import { useEffect, useState } from "react";
import { getHistory, getImageUrl } from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import elephantIcon from "../assets/elephant.svg";

export default function History() {

  const [data, setData] = useState([]);
  const [username, setUsername] = useState("");

  const navigate = useNavigate();

  const location = useLocation();

  // =====================================
  // GET USERNAME
  // =====================================
  useEffect(() => {
    const storedUsername =
      localStorage.getItem("username") ||
      "User";
    setUsername(storedUsername);
  }, []);

  // =====================================
  // HANDLE LOGOUT
  // =====================================
  const handleLogout = () => {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("username");
    navigate("/");
  };

  // =====================================
  // AMBIL CAMERA DARI URL
  // =====================================
  const params = new URLSearchParams(
    location.search
  );

  const selectedCamera =
    params.get("camera");

  // =====================================
  // FETCH DATA
  // =====================================
  const fetchData = async () => {

    try {

      const res = await getHistory(
        selectedCamera
      );

      setData(res);

    } catch (err) {

      console.error(err);

    }
  };

  // =====================================
  // LOAD DATA
  // =====================================
  useEffect(() => {

    fetchData();

  }, [selectedCamera]);

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

          <div style={navUsername}>
            <span style={usernameLabel}>
              {username}
            </span>
          </div>

          <button
            style={logoutButton}
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </div>

      {/* CONTENT */}
      <div style={content}>

        {/* HEADER */}
        <div style={pageHeader}>

          <div>
            <h1 style={pageTitle}>
              Log Aktivitas
            </h1>
            <p style={cameraLabel}>
              Kamera: {selectedCamera}
            </p>
          </div>

          <button
            style={backButton}
            onClick={() => navigate("/dashboard")}
          >
            Kembali ke Dashboard
          </button>

        </div>

        {/* TABLE HEADER */}
        <div style={tableHeader}>

          <div style={colNo}>No</div>
          <div style={colWaktu}>Waktu</div>
          <div style={colGambar}>Gambar</div>
          <div style={colInfo}>
            Informasi Lengkap
          </div>

        </div>

        {/* TABLE DATA */}
        <div style={tableContainer}>

          {data.length === 0 ? (

            <div style={emptyState}>
              Tidak ada data aktivitas
            </div>

          ) : (

            data.map((item, index) => (

              <div
                key={item.id}
                style={tableRow}
              >

                <div style={colNo}>
                  {index + 1}
                </div>

                <div style={colWaktu}>
                  {item.timestamp}
                </div>

                <div style={colGambar}>

                  <img
                    src={getImageUrl(item.image)}
                    alt="img"
                    style={rowImage}
                  />

                </div>

                <div style={colInfo}>

                  <pre style={infoText}>
                    {item.result}
                  </pre>

                </div>

              </div>

            ))

          )}

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
  background:
    "radial-gradient(circle at 72% 82%, rgba(82, 183, 136, 0.24), transparent 34%), linear-gradient(145deg, #081c15 0%, #123524 48%, #1b4332 100%)",
  fontFamily: "'Poppins', sans-serif",
  color: "#f7fff9",
};

//////////////////////////////////////////////////
// TOP NAVIGATION
//////////////////////////////////////////////////

const topNav = {
  height: "70px",

  position: "relative",

  zIndex: 10,

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
// CONTENT
//////////////////////////////////////////////////

const content = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  padding: "24px 30px",
  overflow: "hidden",
  background: "transparent",
};

//////////////////////////////////////////////////
// PAGE HEADER
//////////////////////////////////////////////////

const pageHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "24px",
  padding: "18px 20px",
  borderRadius: "14px",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))",
  border: "1px solid rgba(255,255,255,0.14)",
  boxShadow:
    "0 18px 38px rgba(0,0,0,0.22)",
  backdropFilter: "blur(16px)",
};

const pageTitle = {
  margin: "0 0 8px 0",
  fontSize: "28px",
  fontWeight: "700",
  color: "#f7fff9",
};

const cameraLabel = {
  margin: 0,
  fontSize: "13px",
  color: "rgba(241,255,246,0.64)",
  fontWeight: "500",
};

const backButton = {
  padding: "10px 20px",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.16)",
  background:
    "linear-gradient(135deg, rgba(82, 183, 136, 0.84), rgba(45, 106, 79, 0.84))",
  color: "#f7fff9",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.3s",
  boxShadow:
    "0 12px 24px rgba(0,0,0,0.18)",
};

//////////////////////////////////////////////////
// TABLE
//////////////////////////////////////////////////

const gridTemplate =
  "100px 300px 360px minmax(360px, 1fr)";

const tableHeader = {
  display: "grid",
  gridTemplateColumns: gridTemplate,
  columnGap: "16px",
  padding: "12px 16px",
  alignItems: "center",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.07))",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.14)",
  fontWeight: "600",
  fontSize: "13px",
  color: "rgba(241,255,246,0.72)",
  marginBottom: "8px",
  backdropFilter: "blur(16px)",
};

const tableRow = {
  display: "grid",
  gridTemplateColumns: gridTemplate,
  columnGap: "16px",
  alignItems: "center",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.105), rgba(255,255,255,0.055))",
  marginBottom: "8px",
  borderRadius: "12px",
  padding: "12px 16px",
  border: "1px solid rgba(255,255,255,0.13)",
  transition: "all 0.3s",
  boxShadow:
    "0 10px 24px rgba(0,0,0,0.16)",
  backdropFilter: "blur(12px)",
};

//////////////////////////////////////////////////
// COLUMNS
//////////////////////////////////////////////////

const baseCol = {
  display: "flex",
  alignItems: "center",
  fontSize: "13px",
  color: "#f7fff9",
};

const colNo = {
  ...baseCol,
  justifyContent: "center",
};

const colWaktu = {
  ...baseCol,
  justifyContent: "center",
  textAlign: "center",
};

const colGambar = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const colInfo = {
  ...baseCol,
  justifyContent: "flex-start",
};

//////////////////////////////////////////////////
// TABLE CONTAINER
//////////////////////////////////////////////////

const tableContainer = {
  flex: 1,
  overflowY: "auto",
  paddingRight: "8px",
  minHeight: 0,
};

//////////////////////////////////////////////////
// IMAGES
//////////////////////////////////////////////////

const rowImage = {
  width: "200px",
  height: "120px",
  objectFit: "cover",
  borderRadius: "8px",
  boxShadow:
    "0 12px 24px rgba(0,0,0,0.24)",
  border:
    "1px solid rgba(255,255,255,0.14)",
};

//////////////////////////////////////////////////
// INFO TEXT
//////////////////////////////////////////////////

const infoText = {
  fontSize: "12px",
  whiteSpace: "pre-wrap",
  color: "rgba(241,255,246,0.8)",
  textAlign: "left",
  margin: 0,
  fontFamily: "monospace",
  width: "100%",
};

//////////////////////////////////////////////////
// EMPTY STATE
//////////////////////////////////////////////////

const emptyState = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "200px",
  color: "rgba(241,255,246,0.64)",
  fontSize: "16px",
  fontWeight: "500",
};
