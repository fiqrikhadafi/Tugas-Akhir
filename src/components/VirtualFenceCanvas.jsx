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

/**
 * =============================================================
 *   VIRTUAL FENCE CANVAS
 *
 *   Komponen React yang meniru fitur setup_virtual_fence.py
 *   (OpenCV-based) langsung di browser menggunakan HTML Canvas.
 *
 *   Fitur:
 *     Klik kiri      → tambah titik
 *     Klik kanan     → hapus titik terakhir
 *     Drag & drop    → geser titik yang sudah ada
 *     R              → reset semua titik
 *     Enter / S      → simpan
 *     Escape         → batal
 * =============================================================
 */

// ── Konstanta ────────────────────────────────────
const DRAG_RADIUS = 12;
const SNAP_RADIUS = 15;
const POINT_OUTER = 7;
const POINT_INNER = 4;

export default function VirtualFenceCanvas({
  imageUrl,
  cameraId,
  existingPolygon,
  onSave,
  onCancel,
}) {

  //////////////////////////////////////////////////
  // REFS
  //////////////////////////////////////////////////

  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const wrapperRef = useRef(null);

  //////////////////////////////////////////////////
  // STATE
  //////////////////////////////////////////////////

  const [points, setPoints] = useState([]);
  const [hoverPos, setHoverPos] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState(-1);
  const [imgNatural, setImgNatural] = useState({
    w: 0, h: 0,
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  //////////////////////////////////////////////////
  // SKALA: display ↔ asli
  //////////////////////////////////////////////////

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
      y: 0, // object-position: top
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

  //////////////////////////////////////////////////
  // LOAD POLYGON LAMA
  //////////////////////////////////////////////////

  useEffect(() => {
    if (
      !existingPolygon ||
      existingPolygon.length === 0
    ) return;

    // Perlu menunggu gambar ter-load agar
    // skala diketahui
    const img = imgRef.current;
    if (!img) return;

    const loadExisting = () => {
      const { sx, sy } = getScale();
      const loaded = existingPolygon.map(
        (pt) => ({
          x: Math.round(
            (Array.isArray(pt) ? pt[0] : pt.x) * sx
          ),
          y: Math.round(
            (Array.isArray(pt) ? pt[1] : pt.y) * sy
          ),
        })
      );
      setPoints(loaded);
    };

    if (img.complete) {
      loadExisting();
    } else {
      img.addEventListener("load", loadExisting);
      return () =>
        img.removeEventListener("load", loadExisting);
    }
  }, [existingPolygon, getScale]);

  //////////////////////////////////////////////////
  // IMAGE ONLOAD → set natural dims + resize canvas
  //////////////////////////////////////////////////

  const handleImageLoad = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    setImgNatural({
      w: img.naturalWidth,
      h: img.naturalHeight,
    });

    const r = getRenderedRect();
    if (r) {
      canvas.width = r.w;
      canvas.height = r.h;
    }
  };

  //////////////////////////////////////////////////
  // RESIZE OBSERVER
  //////////////////////////////////////////////////

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

  //////////////////////////////////////////////////
  // DRAW OVERLAY (mirip draw_overlay di Python)
  //////////////////////////////////////////////////

  const drawOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Isi polygon semi-transparan
    if (points.length >= 3) {
      ctx.fillStyle = "rgba(0, 200, 100, 0.25)";
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
      ctx.fill();
    }

    // 2. Garis antar titik
    if (points.length >= 2) {
      ctx.strokeStyle = "#00FF78";
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    }

    // 3. Garis penutup polygon
    if (points.length >= 3) {
      ctx.strokeStyle = "#00FF78";
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(
        points[points.length - 1].x,
        points[points.length - 1].y
      );
      ctx.lineTo(points[0].x, points[0].y);
      ctx.stroke();
    }

    // 4. Preview garis ke kursor
    if (points.length > 0 && hoverPos && !dragging) {
      ctx.strokeStyle = "rgba(180, 180, 180, 0.6)";
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(
        points[points.length - 1].x,
        points[points.length - 1].y
      );
      ctx.lineTo(hoverPos.x, hoverPos.y);
      ctx.stroke();

      // Preview balik ke titik pertama
      if (points.length >= 2) {
        ctx.strokeStyle = "rgba(100, 100, 100, 0.4)";
        ctx.beginPath();
        ctx.moveTo(hoverPos.x, hoverPos.y);
        ctx.lineTo(points[0].x, points[0].y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // 5. Lingkaran titik + label
    points.forEach((pt, i) => {
      const isFirst = i === 0 && points.length >= 3;

      // Outer
      ctx.fillStyle = isFirst
        ? "#00B4FF"
        : "#00E650";
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, POINT_OUTER, 0, Math.PI * 2);
      ctx.fill();

      // Border hitam
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Inner
      ctx.fillStyle = isFirst
        ? "#0064C8"
        : "#FFFFFF";
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, POINT_INNER, 0, Math.PI * 2);
      ctx.fill();

      // Label nomor
      ctx.font = "bold 11px sans-serif";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 3;
      ctx.strokeText(
        String(i + 1), pt.x + 10, pt.y - 8
      );
      ctx.fillStyle = "#FFF";
      ctx.fillText(
        String(i + 1), pt.x + 10, pt.y - 8
      );
    });
  }, [points, hoverPos, dragging]);

  //////////////////////////////////////////////////
  // RE-DRAW setiap kali state berubah
  //////////////////////////////////////////////////

  useEffect(() => {
    drawOverlay();
  }, [drawOverlay]);

  //////////////////////////////////////////////////
  // MOUSE COORDINATES dari event
  //////////////////////////////////////////////////

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const distance = (a, b) =>
    Math.sqrt(
      (a.x - b.x) ** 2 + (a.y - b.y) ** 2
    );

  //////////////////////////////////////////////////
  // MOUSE DOWN → drag atau tambah titik
  //////////////////////////////////////////////////

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // hanya klik kiri
    const pos = getMousePos(e);

    // Cek drag: klik dekat titik yang sudah ada
    for (let i = 0; i < points.length; i++) {
      if (distance(pos, points[i]) < DRAG_RADIUS) {
        setDragging(true);
        setDragIndex(i);
        return;
      }
    }

    // Snap ke titik pertama → tutup polygon
    if (points.length >= 3) {
      if (distance(pos, points[0]) < SNAP_RADIUS) {
        return; // polygon sudah tertutup
      }
    }

    // Tambah titik baru
    setPoints((prev) => [...prev, pos]);
  };

  //////////////////////////////////////////////////
  // MOUSE MOVE → update hover / drag
  //////////////////////////////////////////////////

  const handleMouseMove = (e) => {
    const pos = getMousePos(e);
    setHoverPos(pos);

    if (dragging && dragIndex >= 0) {
      setPoints((prev) => {
        const copy = [...prev];
        copy[dragIndex] = pos;
        return copy;
      });
    }
  };

  //////////////////////////////////////////////////
  // MOUSE UP → selesai drag
  //////////////////////////////////////////////////

  const handleMouseUp = () => {
    if (dragging) {
      setDragging(false);
      setDragIndex(-1);
    }
  };

  //////////////////////////////////////////////////
  // CONTEXT MENU → hapus titik terakhir
  //////////////////////////////////////////////////

  const handleContextMenu = (e) => {
    e.preventDefault();
    setPoints((prev) => prev.slice(0, -1));
  };

  //////////////////////////////////////////////////
  // KEYBOARD SHORTCUTS
  //////////////////////////////////////////////////

  useEffect(() => {
    const handler = (e) => {
      // R → reset
      if (e.key === "r" || e.key === "R") {
        // Jangan intercept jika sedang di input
        if (
          e.target.tagName === "INPUT" ||
          e.target.tagName === "TEXTAREA"
        ) return;
        setPoints([]);
        setHoverPos(null);
      }

      // Enter atau S → simpan
      if (
        e.key === "Enter" ||
        e.key === "s" ||
        e.key === "S"
      ) {
        if (
          e.target.tagName === "INPUT" ||
          e.target.tagName === "TEXTAREA"
        ) return;
        if (points.length >= 3) {
          handleSave();
        }
      }

      // Escape → batal
      if (e.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handler);
    return () =>
      window.removeEventListener("keydown", handler);
  }, [points, onCancel]);

  //////////////////////////////////////////////////
  // SIMPAN POLYGON
  //////////////////////////////////////////////////

  const handleSave = async () => {
    if (points.length < 3 || saving) return;
    setSaving(true);

    try {
      // Konversi display → koordinat asli
      const { sx, sy } = getScale();
      const polygon = points.map((p) => [
        Math.round(p.x / sx),
        Math.round(p.y / sy),
      ]);

      await saveFence(cameraId, polygon);

      // Coba reload worker via MQTT
      try {
        await reloadFence();
      } catch {
        // Tidak fatal jika MQTT gagal
        console.warn(
          "Reload MQTT gagal, worker perlu restart manual"
        );
      }

      setToast({
        type: "success",
        msg: "✓ Virtual Fence tersimpan!",
      });

      setTimeout(() => {
        setToast(null);
        onSave();
      }, 1500);
    } catch (err) {
      console.error("Gagal menyimpan:", err);
      setToast({
        type: "error",
        msg: "✗ Gagal menyimpan: " +
          (err.response?.data?.error || err.message),
      });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  //////////////////////////////////////////////////
  // RESET
  //////////////////////////////////////////////////

  const handleReset = () => {
    setPoints([]);
    setHoverPos(null);
  };

  //////////////////////////////////////////////////
  // STATUS BANNER
  //////////////////////////////////////////////////

  const getBanner = () => {
    const n = points.length;
    if (n === 0)
      return {
        cls: "vf-banner--empty",
        text: "Klik untuk menentukan batas zona deteksi gajah",
      };
    if (n < 3)
      return {
        cls: "vf-banner--progress",
        text: `Tambah ${3 - n} titik lagi...`,
      };
    return {
      cls: "vf-banner--ready",
      text: `✓ READY — ${n} titik [Klik Simpan atau tekan Enter]`,
    };
  };

  const banner = getBanner();

  //////////////////////////////////////////////////
  // RENDER
  //////////////////////////////////////////////////

  return (
    <div className="vf-container">

      {/* CANVAS WRAPPER - PENUH LAYAR */}
      <div
        className="vf-canvas-wrapper"
        ref={wrapperRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={handleContextMenu}
      >
        <img
          ref={imgRef}
          src={imageUrl}
          alt="referensi"
          onLoad={handleImageLoad}
          crossOrigin="anonymous"
        />
        <canvas ref={canvasRef} />

        {/* TOAST */}
        {toast && (
          <div
            className={`vf-toast vf-toast--${toast.type}`}
          >
            {toast.msg}
          </div>
        )}
      </div>

      {/* FOOTER - INSTRUKSI & TOMBOL DI LUAR GAMBAR */}
      <div className="vf-footer">
        {/* INSTRUKSI */}
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
            Titik: <strong>{points.length}</strong>
            &nbsp;|&nbsp;
            Min. 3 titik
          </span>
        </div>

        {/* TOMBOL AKSI */}
        <div className="vf-actions">
          <button
            className="vf-btn vf-btn--save"
            onClick={handleSave}
            disabled={points.length < 3 || saving}
          >
            {saving ? "Menyimpan..." : "💾 Simpan"}
          </button>

          <button
            className="vf-btn vf-btn--reset"
            onClick={handleReset}
          >
            🔄 Reset
          </button>

          <button
            className="vf-btn vf-btn--cancel"
            onClick={onCancel}
          >
            ✕ Batal
          </button>
        </div>
      </div>

    </div>
  );
}
