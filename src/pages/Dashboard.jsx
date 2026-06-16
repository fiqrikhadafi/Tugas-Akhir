import { useEffect, useState } from "react";

import {
  getLatest,
  getCameras,
  getFence,
  getImageUrl
} from "../services/api";

import { useNavigate } from "react-router-dom";

import elephantIcon from "../assets/elephant.svg";

import VirtualFenceCanvas
  from "../components/VirtualFenceCanvas";

export default function Dashboard() {

  //////////////////////////////////////////////////
  // STATE
  //////////////////////////////////////////////////

  const [data, setData] = useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  // daftar kamera
  const [cameras, setCameras] =
    useState([]);

  // kamera aktif
  const [selectedCamera, setSelectedCamera] =
    useState("");

  // mode setup virtual fence
  const [setupMode, setSetupMode] =
    useState(false);

  const [existingPolygon, setExistingPolygon] =
    useState([]);

  // Username from localStorage
  const [username, setUsername] =
    useState("");

  // Show camera menu
  const [showCameraMenu, setShowCameraMenu] =
    useState(false);

  const navigate = useNavigate();

  //////////////////////////////////////////////////
  // GET USERNAME
  //////////////////////////////////////////////////

  useEffect(() => {
    const storedUsername =
      localStorage.getItem("username") ||
      "User";
    setUsername(storedUsername);
  }, []);

  //////////////////////////////////////////////////
  // SETUP VIRTUAL FENCE HANDLERS
  //////////////////////////////////////////////////

  const handleStartSetup = async () => {

    try {

      const fence = await getFence(
        selectedCamera
      );

      setExistingPolygon(
        fence.polygon || []
      );

    } catch {

      setExistingPolygon([]);

    }

    setSetupMode(true);
  };

  const handleSaveSetup = () => {
    setSetupMode(false);
    fetchData();
  };

  const handleCancelSetup = () => {
    setSetupMode(false);
  };

  //////////////////////////////////////////////////
  // HANDLE LOGOUT
  //////////////////////////////////////////////////

  const handleLogout = () => {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("username");
    navigate("/");
  };

  //////////////////////////////////////////////////
  // FETCH DATA TERBARU
  //////////////////////////////////////////////////

  const fetchData = async () => {

    try {

      if (!selectedCamera) return;

      setErrorMessage("");

      const res = await getLatest(
        selectedCamera
      );

      if (!res || Object.keys(res).length === 0) {
        setData(null);
        setErrorMessage(
          "Belum ada data deteksi untuk kamera ini."
        );
        return;
      }

      setData(res);

    } catch (err) {

      console.error(err);
      setData(null);
      setErrorMessage(
        "Backend belum terhubung. Pastikan Flask API berjalan dan VITE_API_BASE_URL benar."
      );

    }
  };

  //////////////////////////////////////////////////
  // FETCH CAMERA LIST
  //////////////////////////////////////////////////

  const fetchCameras = async () => {

    try {

      setIsLoading(true);
      setErrorMessage("");

      const res = await getCameras();

      setCameras(res);

      if (res.length === 0) {
        setErrorMessage(
          "Belum ada kamera terdaftar. Jalankan worker dan kirim minimal satu data deteksi."
        );
      }

      // otomatis pilih kamera pertama
      if (
        res.length > 0 &&
        !selectedCamera
      ) {

        setSelectedCamera(res[0]);

      }

    } catch (err) {

      console.error(err);
      setErrorMessage(
        "Backend belum terhubung. Pastikan Flask API berjalan dan VITE_API_BASE_URL benar."
      );

    } finally {

      setIsLoading(false);

    }
  };

  //////////////////////////////////////////////////
  // LOAD CAMERA
  //////////////////////////////////////////////////

  useEffect(() => {

    fetchCameras();

  }, []);

  //////////////////////////////////////////////////
  // POLLING DATA
  //////////////////////////////////////////////////

  useEffect(() => {

    if (!selectedCamera) return;

    fetchData();

    const interval = setInterval(
      fetchData,
      3000
    );

    return () => clearInterval(interval);

  }, [selectedCamera]);

  //////////////////////////////////////////////////
  // LOADING
  //////////////////////////////////////////////////

  if (isLoading) {

    return (

      <div style={loadingContainer}>

        <h2 style={loadingText}>
          Loading...
        </h2>

      </div>

    );
  }

  if (!data) {

    return (

      <div style={loadingContainer}>

        <div style={statusPanel}>

          <h2 style={loadingText}>
            Dashboard belum siap
          </h2>

          <p style={statusText}>
            {errorMessage ||
              "Sedang menunggu data deteksi terbaru dari backend."}
          </p>

          <button
            style={statusButton}
            onClick={fetchCameras}
          >
            Coba Lagi
          </button>

          <button
            style={{
              ...statusButton,
              background: "rgba(127, 29, 29, 0.28)",
              color: "#fecaca",
            }}
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </div>

    );
  }

  //////////////////////////////////////////////////
  // STATUS ALARM
  //////////////////////////////////////////////////

  const isAlarm =
    data.result?.includes("PERINGATAN");

  return (

    <div style={container}>

      {/* TOP NAVIGATION */}
      <div style={topNav}>

        <div style={navLeft}>

          <img
            src={elephantIcon}
            alt="elephant"
            style={navIcon}
          />

          <span style={navTitle}>
            SISTEM PENDETEKSI GAJAH
          </span>

        </div>

        <div style={navRight}>

          {/* CAMERA SELECTOR */}
          <div style={navItemContainer}>

            <button
              style={navButton}
              onClick={() =>
                setShowCameraMenu(
                  !showCameraMenu
                )
              }
            >
              {selectedCamera || "Pilih Kamera"}
            </button>

            {showCameraMenu && (
              <div style={cameraMenuDropdown}>
                {cameras.map((cam) => (

                  <div
                    key={cam}
                    style={{
                      ...cameraMenuItem,
                      background:
                        cam ===
                        selectedCamera
                          ? "rgba(82, 183, 136, 0.18)"
                          : "transparent",
                      color:
                        cam ===
                        selectedCamera
                          ? "#d8f3dc"
                          : "rgba(241,255,246,0.78)",
                    }}
                    onClick={() => {
                      setSelectedCamera(
                        cam
                      );
                      setShowCameraMenu(
                        false
                      );
                    }}
                  >
                    {cam}
                  </div>

                ))}
              </div>
            )}

          </div>

          {/* VIRTUAL FENCE BUTTON */}
          <button
            style={{
              ...navButton,
              background: setupMode
                ? "rgba(82, 183, 136, 0.24)"
                : "rgba(255,255,255,0.08)",
            }}
            onClick={handleStartSetup}
          >
            Setup Virtual Fence
          </button>

          {/* USERNAME */}
          <div style={navUsername}>
            <span style={usernameLabel}>
              {username}
            </span>
          </div>

          {/* LOGOUT */}
          <button
            style={logoutButton}
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </div>

      {/* MAIN CONTENT */}
      <div
        style={{
          ...mainContent,
          alignItems: setupMode
            ? "stretch"
            : "center",
        }}
      >

        <div
          style={{
            ...contentInner,
            height: setupMode
              ? "100%"
              : "min(460px, 100%)",
          }}
        >

          {/* LEFT PANEL */}
          <div style={leftPanel}>

            {/* TOTAL GAJAH */}
            <div style={statsCard}>

              <h3 style={statsTitle}>
                Jumlah Total Gajah
              </h3>

              <h1 style={statsNumber}>
                {data.total}
              </h1>

              <div style={statsSubtext}>
                Gajah terdeteksi
              </div>

            </div>

            {/* ALARM STATUS */}
            <div
              style={{
                ...alarmCard,
                background: isAlarm
                  ? "linear-gradient(145deg, rgba(127, 29, 29, 0.92), rgba(220, 38, 38, 0.78))"
                  : "linear-gradient(145deg, rgba(8, 28, 21, 0.84), rgba(45, 106, 79, 0.82))",
              }}
            >

              <h3 style={{
                ...statsTitle,
                color: isAlarm
                  ? "rgba(255,255,255,0.7)"
                  : "rgba(255,255,255,0.7)",
              }}>
                Status Alarm
              </h3>

              <h2 style={{
                ...alarmText,
                color: isAlarm
                  ? "#ffcdd2"
                  : "#f7fff9",
              }}>

                {
                  isAlarm
                    ? "PERINGATAN"
                    : "AMAN"
                }

              </h2>

              <div style={{
                ...statsSubtext,
                color: isAlarm
                  ? "rgba(255,255,255,0.6)"
                  : "rgba(255,255,255,0.6)",
              }}>
                {isAlarm
                  ? "Gajah terdeteksi di area"
                  : "Tidak ada aktivitas"}
              </div>

            </div>

            {/* HISTORY */}
            <button
              style={actionButton}

              onClick={() =>
                navigate(
                  `/history?camera=${selectedCamera}`
                )
              }
            >
              Log Aktivitas
            </button>

            {/* TREND */}
            <button
              style={actionButton}

              onClick={() =>
                navigate(
                  `/trend?camera=${selectedCamera}`
                )
              }
            >
              Tren Aktivitas
            </button>

          </div>

          {/* RIGHT PANEL - CAMERA FEED */}
          <div style={rightPanel}>

            {setupMode ? (

              <VirtualFenceCanvas
                imageUrl={
                  getImageUrl(data.image)
                }
                cameraId={selectedCamera}
                existingPolygon={existingPolygon}
                onSave={handleSaveSetup}
                onCancel={handleCancelSetup}
              />

            ) : (

              <img
                src={
                  getImageUrl(data.image)
                }
                alt="hasil"
                style={{
                  ...cameraImage,
                  height: "100%",
                  maxWidth: "100%",
                  width: "100%",
                }}
              />

            )}

          </div>

        </div>

      </div>

    </div>
  );
}


//////////////////////////////////////////////////
// STYLE
//////////////////////////////////////////////////

const container = {
  width: "100%",
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",

  background:
    "radial-gradient(circle at 72% 82%, rgba(82, 183, 136, 0.24), transparent 34%), linear-gradient(145deg, #081c15 0%, #123524 48%, #1b4332 100%)",

  fontFamily:
    "'Poppins', sans-serif",
};

//////////////////////////////////////////////////
// LOADING
//////////////////////////////////////////////////

const loadingContainer = {
  width: "100%",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",

  background:
    "radial-gradient(circle at 50% 78%, rgba(82, 183, 136, 0.28), transparent 36%), linear-gradient(145deg, #081c15 0%, #123524 48%, #1b4332 100%)",
};

const loadingText = {
  color: "#f7fff9",
  fontWeight: "400",
};

const statusPanel = {
  width: "min(520px, calc(100% - 40px))",
  padding: "28px",
  borderRadius: "14px",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.13), rgba(255,255,255,0.07))",
  border: "1px solid rgba(255,255,255,0.16)",
  boxShadow:
    "0 18px 38px rgba(0,0,0,0.26)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "14px",
  textAlign: "center",
};

const statusText = {
  margin: 0,
  color: "rgba(241,255,246,0.72)",
  fontSize: "14px",
  lineHeight: "1.6",
};

const statusButton = {
  width: "100%",
  maxWidth: "220px",
  padding: "10px 16px",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.16)",
  background:
    "linear-gradient(135deg, rgba(82, 183, 136, 0.84), rgba(45, 106, 79, 0.84))",
  color: "#f7fff9",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
};

//////////////////////////////////////////////////
// TOP NAVIGATION
//////////////////////////////////////////////////

const topNav = {
  height: "70px",

  position: "relative",

  zIndex: 20,

  display: "flex",

  justifyContent: "space-between",

  alignItems: "center",

  padding: "0 30px",

  background:
    "linear-gradient(180deg, rgba(8, 28, 21, 0.88), rgba(8, 28, 21, 0.68))",

  backdropFilter: "blur(16px)",

  boxShadow:
    "0 14px 32px rgba(0,0,0,0.24)",

  borderBottom:
    "1px solid rgba(255,255,255,0.12)",
};

const navLeft = {

  display: "flex",

  alignItems: "center",

  gap: "12px",
};

const navIcon = {
  width: "28px",
  height: "28px",
  filter: "brightness(0) invert(1)",
};

const navTitle = {

  color: "#f1fff6",

  fontSize: "16px",

  fontWeight: "700",

  letterSpacing: "0.5px",
};

const navRight = {

  display: "flex",

  alignItems: "center",

  gap: "16px",
};

const navItemContainer = {

  position: "relative",

  zIndex: 30,
};

const navButton = {

  padding: "8px 16px",

  borderRadius: "8px",

  border: "1px solid rgba(255,255,255,0.3)",

  background: "rgba(255,255,255,0.08)",

  color: "#f7fff9",

  fontSize: "13px",

  fontWeight: "600",

  cursor: "pointer",

  transition: "all 0.3s",

  whiteSpace: "nowrap",
};

const cameraMenuDropdown = {

  position: "absolute",

  top: "45px",

  left: 0,

  background:
    "linear-gradient(180deg, rgba(14, 42, 31, 0.96), rgba(8, 28, 21, 0.96))",

  border: "1px solid rgba(255,255,255,0.14)",

  borderRadius: "8px",

  boxShadow:
    "0 18px 38px rgba(0,0,0,0.34)",

  backdropFilter: "blur(14px)",

  zIndex: 1000,

  minWidth: "150px",

  overflow: "hidden",
};

const cameraMenuItem = {

  padding: "12px 16px",

  cursor: "pointer",

  fontSize: "13px",

  fontWeight: "500",

  transition: "all 0.2s",

  borderBottom:
    "1px solid rgba(255,255,255,0.08)",

  color: "rgba(241,255,246,0.78)",

  background: "transparent",

};

const navUsername = {

  padding: "0 16px",

  borderLeft: "1px solid rgba(255,255,255,0.2)",

  borderRight: "1px solid rgba(255,255,255,0.2)",
};

const usernameLabel = {

  color: "#f1fff6",

  fontSize: "13px",

  fontWeight: "600",
};

const logoutButton = {

  padding: "8px 16px",

  borderRadius: "8px",

  border: "1px solid rgba(255,255,255,0.18)",

  background: "rgba(127, 29, 29, 0.28)",

  color: "#fecaca",

  fontSize: "13px",

  fontWeight: "600",

  cursor: "pointer",

  transition: "all 0.3s",
};

//////////////////////////////////////////////////
// MAIN CONTENT
//////////////////////////////////////////////////

const mainContent = {
  flex: 1,
  minHeight: 0,

  position: "relative",

  zIndex: 1,

  display: "flex",

  justifyContent: "center",

  padding: "24px 30px",

  overflow: "hidden",

  background:
    "transparent",
};

const contentInner = {

  display: "flex",

  gap: "24px",

  width: "100%",

  maxWidth: "1400px",

  height: "100%",

  minHeight: 0,
};

//////////////////////////////////////////////////
// LEFT PANEL
//////////////////////////////////////////////////

const leftPanel = {

  width: "280px",

  height: "100%",

  display: "flex",

  flexDirection: "column",

  gap: "16px",

  overflow: "auto",

  paddingRight: "8px",

  background: "transparent",
};

//////////////////////////////////////////////////
// STATS CARD
//////////////////////////////////////////////////

const statsCard = {

  flex: "1 1 0",

  minHeight: 0,

  boxSizing: "border-box",

  borderRadius: "14px",

  background:
    "linear-gradient(180deg, rgba(255,255,255,0.13), rgba(255,255,255,0.07))",

  backdropFilter: "blur(16px)",

  boxShadow:
    "0 18px 38px rgba(0,0,0,0.26)",

  border:
    "1px solid rgba(255,255,255,0.16)",

  padding: "24px",

  display: "flex",

  flexDirection: "column",

  justifyContent: "center",

  alignItems: "center",

  textAlign: "center",

  color: "#f7fff9",
};

//////////////////////////////////////////////////
// ALARM CARD
//////////////////////////////////////////////////

const alarmCard = {

  flex: "1 1 0",

  minHeight: 0,

  boxSizing: "border-box",

  borderRadius: "14px",

  boxShadow:
    "0 18px 38px rgba(0,0,0,0.26)",

  border: "1px solid rgba(255,255,255,0.16)",

  backdropFilter: "blur(16px)",

  padding: "24px",

  display: "flex",

  flexDirection: "column",

  justifyContent: "center",

  alignItems: "center",

  textAlign: "center",
};

//////////////////////////////////////////////////
// STATS TEXT
//////////////////////////////////////////////////

const statsTitle = {

  margin: "0 0 12px 0",

  fontSize: "14px",

  fontWeight: "500",

  color: "rgba(241,255,246,0.68)",
};

const statsNumber = {

  margin: "0 0 8px 0",

  fontSize: "36px",

  fontWeight: "700",

  color: "#f7fff9",
};

const alarmText = {

  margin: "0 0 8px 0",

  fontSize: "28px",

  fontWeight: "700",

  color: "#f7fff9",
};

const statsSubtext = {

  margin: 0,

  fontSize: "12px",

  fontWeight: "400",

  color: "rgba(241,255,246,0.62)",
};

//////////////////////////////////////////////////
// ACTION BUTTONS
//////////////////////////////////////////////////

const actionButton = {

  height: "44px",

  flexShrink: 0,

  boxSizing: "border-box",

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  borderRadius: "10px",

  background:
    "linear-gradient(135deg, rgba(82, 183, 136, 0.84), rgba(45, 106, 79, 0.84))",

  border: "1px solid rgba(255,255,255,0.16)",

  padding: "14px 16px",

  textAlign: "center",

  cursor: "pointer",

  fontSize: "13px",

  fontWeight: "600",

  color: "#f7fff9",

  transition: "all 0.3s",

  whiteSpace: "nowrap",

  boxShadow:
    "0 12px 24px rgba(0,0,0,0.18)",
};

//////////////////////////////////////////////////
// RIGHT PANEL - CAMERA
//////////////////////////////////////////////////

const rightPanel = {

  flex: 1,

  height: "100%",

  display: "flex",

  justifyContent: "center",

  alignItems: "flex-start",

  minHeight: 0,

  overflow: "hidden",

  borderRadius: "14px",

  background:
    "linear-gradient(180deg, rgba(255,255,255,0.11), rgba(255,255,255,0.06))",

  border:
    "1px solid rgba(255,255,255,0.14)",

  backdropFilter: "blur(16px)",

  boxShadow:
    "0 18px 38px rgba(0,0,0,0.28)",
};

//////////////////////////////////////////////////
// CAMERA IMAGE
//////////////////////////////////////////////////

const cameraImage = {

  width: "100%",

  height: "100%",

  objectFit: "contain",

  objectPosition: "center",

  imageRendering: "auto",

  borderRadius: "14px",
};
