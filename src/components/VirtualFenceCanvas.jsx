import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

import {
  saveFence,
  reloadFence,
} from "../services/api";

import "./VirtualFenceCanvas.css";

const DRAG_RADIUS = 12;
const SNAP_RADIUS = 15;
// [EDIT DI SINI]
// POINT_OUTER mengatur ukuran (radius) titik-titik bulat saat Anda menggambar zona.
// Standarnya adalah 4. Ubah menjadi lebih besar (misal 7) atau lebih kecil (misal 2).
const POINT_OUTER = 4;

export default function VirtualFenceCanvas({
  imageUrl,
  cameraId,
  existingZones,
  onSave,
  onCancel,
}) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const wrapperRef = useRef(null);

  const [zones, setZones] = useState([
    { id: "yellow", name: "Zona Peringatan", polygon: [] },
    { id: "red", name: "Zona Bahaya", polygon: [] }
  ]);
  const [activeZoneId, setActiveZoneId] = useState("yellow");

  const [hoverPos, setHoverPos] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState(-1);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const getRenderedRect = useCallback(() => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth) return null;

    const cw = img.clientWidth;
    const ch = img.clientHeight;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;

    const imgAspect = nw / nh;
    const boxAspect = cw / ch;

    let rw, rh;
    if (imgAspect > boxAspect) {
      rw = cw;
      rh = cw / imgAspect;
    } else {
      rh = ch;
      rw = ch * imgAspect;
    }

    return {
      x: (cw - rw) / 2,
      y: 0,
      w: rw,
      h: rh,
      sx: rw / nw,
      sy: rh / nh,
    };
  }, []);

  const getScale = useCallback(() => {
    const r = getRenderedRect();
    if (!r) return { sx: 1, sy: 1 };
    return { sx: r.sx, sy: r.sy };
  }, [getRenderedRect]);

  useEffect(() => {
    if (!existingZones || existingZones.length === 0) return;
    const img = imgRef.current;
    if (!img) return;

    const loadExisting = () => {
      const { sx, sy } = getScale();
      const newZones = [
        { id: "yellow", name: "Zona Peringatan", polygon: [] },
        { id: "red", name: "Zona Bahaya", polygon: [] }
      ];

      existingZones.forEach(ez => {
        const targetZone = newZones.find(z => z.id === ez.id);
        if (targetZone && ez.polygon) {
          targetZone.polygon = ez.polygon.map(pt => ({
            x: Math.round((Array.isArray(pt) ? pt[0] : pt.x) * sx),
            y: Math.round((Array.isArray(pt) ? pt[1] : pt.y) * sy),
          }));
        }
      });
      setZones(newZones);
    };

    if (img.complete) {
      loadExisting();
    } else {
      img.addEventListener("load", loadExisting);
      return () => img.removeEventListener("load", loadExisting);
    }
  }, [existingZones, getScale]);

  const handleImageLoad = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const r = getRenderedRect();
    if (r) {
      canvas.width = r.w;
      canvas.height = r.h;
    }
  };

  useEffect(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const ro = new ResizeObserver(() => {
      const r = getRenderedRect();
      if (r) {
        canvas.width = r.w;
        canvas.height = r.h;
      }
    });

    ro.observe(img);
    return () => ro.disconnect();
  }, [getRenderedRect]);

  const drawOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    zones.forEach(zone => {
      const isYellow = zone.id === "yellow";
      const fillColor = isYellow ? "rgba(255, 255, 0, 0.25)" : "rgba(255, 0, 0, 0.25)";
      const strokeColor = isYellow ? "#FFD700" : "#FF3333";
      const pts = zone.polygon;
      const isActive = zone.id === activeZoneId;

      if (pts.length >= 3) {
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.closePath();
        ctx.fill();
      }

      if (pts.length >= 2) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
      }

      if (pts.length >= 3) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.lineTo(pts[0].x, pts[0].y);
        ctx.stroke();
      }

      if (isActive && pts.length > 0 && hoverPos && !dragging) {
        ctx.strokeStyle = "rgba(180, 180, 180, 0.8)";
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.lineTo(hoverPos.x, hoverPos.y);
        ctx.stroke();

        if (pts.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(hoverPos.x, hoverPos.y);
          ctx.lineTo(pts[0].x, pts[0].y);
          ctx.stroke();
        }
        ctx.setLineDash([]);
      }

      pts.forEach((pt, i) => {
        const isFirst = i === 0 && pts.length >= 3;
        ctx.fillStyle = isYellow 
          ? (isFirst ? "#FFAA00" : "#FFFF00") 
          : (isFirst ? "#880000" : "#FF5555");
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, POINT_OUTER, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    });
  }, [zones, activeZoneId, hoverPos, dragging]);

  useEffect(() => {
    drawOverlay();
  }, [drawOverlay]);

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const distance = (a, b) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    let pos = getMousePos(e);

    const activePolygon = zones.find(z => z.id === activeZoneId).polygon;

    for (let i = 0; i < activePolygon.length; i++) {
      if (distance(pos, activePolygon[i]) < DRAG_RADIUS) {
        setDragging(true);
        setDragIndex(i);
        return;
      }
    }

    if (activePolygon.length >= 3) {
      if (distance(pos, activePolygon[0]) < SNAP_RADIUS) {
        return;
      }
    }

    // Fitur Snap: Cari zona lain, jika ada titik yang dekat, maka kunci koordinatnya
    const otherZone = zones.find(z => z.id !== activeZoneId);
    if (otherZone && otherZone.polygon) {
      for (let pt of otherZone.polygon) {
        if (distance(pos, pt) < SNAP_RADIUS) {
          pos = { x: pt.x, y: pt.y };
          break;
        }
      }
    }

    setZones(prev => prev.map(z => 
      z.id === activeZoneId 
        ? { ...z, polygon: [...z.polygon, pos] }
        : z
    ));
  };

  const handleMouseMove = (e) => {
    let pos = getMousePos(e);

    // Fitur Snap saat kursor ditarik / melayang
    const otherZone = zones.find(z => z.id !== activeZoneId);
    if (otherZone && otherZone.polygon) {
      for (let pt of otherZone.polygon) {
        if (distance(pos, pt) < SNAP_RADIUS) {
          pos = { x: pt.x, y: pt.y };
          break;
        }
      }
    }

    setHoverPos(pos);

    if (dragging && dragIndex >= 0) {
      setZones(prev => prev.map(z => {
        if (z.id !== activeZoneId) return z;
        const newPoly = [...z.polygon];
        newPoly[dragIndex] = pos;
        return { ...z, polygon: newPoly };
      }));
    }
  };

  const handleMouseUp = () => {
    if (dragging) {
      setDragging(false);
      setDragIndex(-1);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setZones(prev => prev.map(z => 
      z.id === activeZoneId 
        ? { ...z, polygon: z.polygon.slice(0, -1) }
        : z
    ));
  };

  const handleSave = useCallback(async () => {
    if (saving) return;
    
    // ensure at least one valid polygon is saved, or handle empty gracefully?
    // Let's allow saving even if only one zone is configured.
    
    setSaving(true);

    try {
      const { sx, sy } = getScale();
      const payloadZones = zones.map(z => ({
        id: z.id,
        name: z.name,
        polygon: z.polygon.map(p => [Math.round(p.x / sx), Math.round(p.y / sy)])
      }));

      await saveFence(cameraId, payloadZones);

      try {
        await reloadFence();
      } catch {
        console.warn("Reload MQTT gagal, worker perlu restart manual");
      }

      setToast({ type: "success", msg: "Virtual Fence tersimpan!" });
      setTimeout(() => {
        setToast(null);
        onSave();
      }, 1500);
    } catch (err) {
      console.error("Gagal menyimpan:", err);
      setToast({
        type: "error",
        msg: "Gagal menyimpan: " + (err.response?.data?.error || err.message),
      });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  }, [cameraId, getScale, onSave, saving, zones]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "r" || e.key === "R") {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
        setZones(prev => prev.map(z => 
          z.id === activeZoneId ? { ...z, polygon: [] } : z
        ));
        setHoverPos(null);
      }
      if (e.key === "Enter" || e.key === "s" || e.key === "S") {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
        handleSave();
      }
      if (e.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeZoneId, handleSave, onCancel]);

  const handleReset = () => {
    setZones(prev => prev.map(z => 
      z.id === activeZoneId ? { ...z, polygon: [] } : z
    ));
    setHoverPos(null);
  };

  const activeZoneLength = zones.find(z => z.id === activeZoneId).polygon.length;

  return (
    <div className="vf-container">
      <div className="vf-zone-selector" style={{display: 'flex', gap: '10px', padding: '10px', background: '#222', color: '#fff', justifyContent: 'center'}}>
        <button 
          style={{padding: '8px 16px', borderRadius: '4px', border: activeZoneId === 'yellow' ? '2px solid yellow' : '1px solid #666', background: activeZoneId === 'yellow' ? 'rgba(255, 255, 0, 0.2)' : 'transparent', color: 'white', cursor: 'pointer'}}
          onClick={() => setActiveZoneId('yellow')}
        >
          Zona Peringatan (Kuning)
        </button>
        <button 
          style={{padding: '8px 16px', borderRadius: '4px', border: activeZoneId === 'red' ? '2px solid red' : '1px solid #666', background: activeZoneId === 'red' ? 'rgba(255, 0, 0, 0.2)' : 'transparent', color: 'white', cursor: 'pointer'}}
          onClick={() => setActiveZoneId('red')}
        >
          Zona Bahaya (Merah)
        </button>
      </div>

      <div
        className="vf-canvas-wrapper"
        ref={wrapperRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={handleContextMenu}
        style={{ height: 'calc(100% - 100px)' }}
      >
        <img
          ref={imgRef}
          src={imageUrl}
          alt="referensi"
          onLoad={handleImageLoad}
          crossOrigin="anonymous"
        />
        <canvas ref={canvasRef} />
        {toast && (
          <div className={`vf-toast vf-toast--${toast.type}`}>
            {toast.msg}
          </div>
        )}
      </div>

      <div className="vf-footer">
        <div className="vf-instructions">
          <span>
            <strong>Klik Kiri</strong>=Tambah Titik
            &nbsp;|&nbsp;
            <strong>Klik Kanan</strong>=Hapus Terakhir
            &nbsp;|&nbsp;
            <strong>Drag</strong>=Geser Titik
          </span>
          <span>
            <strong>R</strong>=Reset
            &nbsp;|&nbsp;
            <strong>Enter/S</strong>=Simpan
            &nbsp;|&nbsp;
            <strong>Esc</strong>=Batal
            &nbsp;|&nbsp;
            Titik Aktif: <strong>{activeZoneLength}</strong>
          </span>
        </div>
        <div className="vf-actions">
          <button
            className="vf-btn vf-btn--save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
          <button className="vf-btn vf-btn--reset" onClick={handleReset}>
            Reset
          </button>
          <button className="vf-btn vf-btn--cancel" onClick={onCancel}>
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
