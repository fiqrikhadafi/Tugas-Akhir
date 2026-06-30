import { useEffect, useState } from "react";
import { getHistory } from "../services/api";
import {
  useNavigate,
  useLocation
} from "react-router-dom";
import elephantIcon from "../assets/elephant.svg";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Trend() {

  const [data, setData] = useState([]);
  const [username, setUsername] = useState("");

  const navigate = useNavigate();

  const location = useLocation();

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
  // HANDLE LOGOUT
  //////////////////////////////////////////////////
  const handleLogout = () => {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("username");
    navigate("/");
  };

  //////////////////////////////////////////////////
  // AMBIL CAMERA DARI URL
  //////////////////////////////////////////////////
  const params = new URLSearchParams(
    location.search
  );

  const selectedCamera =
    params.get("camera");

  //////////////////////////////////////////////////
  // FETCH DATA
  //////////////////////////////////////////////////
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

  //////////////////////////////////////////////////
  // LOAD DATA
  //////////////////////////////////////////////////
  useEffect(() => {

    fetchData();

  }, [selectedCamera]);

  //////////////////////////////////////////////////
  // PROCESS DATA
  // JUMLAH AKTIVASI ALARM PER HARI
  //////////////////////////////////////////////////
  const grouped = {};
  const chronologicalData = [...data].sort(
    (a, b) =>
      a.timestamp.localeCompare(b.timestamp)
  );
  let previousAlarmActive = false;

  const getResultValue = (result, ...labels) => {
    const lines = (result || "").split("\n");

    for (const line of lines) {
      const separatorIndex = line.indexOf(":");
      if (separatorIndex === -1) continue;

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();

      if (labels.includes(key)) {
        return value;
      }
    }

    return "";
  };

  chronologicalData.forEach((item) => {

    const date =
      item.timestamp.split(" ")[0];
    const result = item.result || "";
    const alarmCount = Number(
      getResultValue(result, "Alarm Count", "Alarm count")
    );
    const isAlarmActive =
      result.includes("PERINGATAN") ||
      result.includes("BAHAYA");
    const isNewAlarmEvent =
      Number.isFinite(alarmCount)
        ? false
        : isAlarmActive && !previousAlarmActive;

    if (!grouped[date]) {
      grouped[date] = 0;
    }

    if (Number.isFinite(alarmCount)) {
      grouped[date] = Math.max(grouped[date], alarmCount);
    } else if (isNewAlarmEvent) {
      grouped[date] += 1;
    }

    previousAlarmActive = isAlarmActive;
  });

  const chartData =
    Object.keys(grouped).map((date) => ({

      date,

      total: grouped[date],

    }));

  //////////////////////////////////////////////////
  // TOTAL HARI INI
  //////////////////////////////////////////////////
  const today =
    new Date().toISOString().split("T")[0];

  const todayTotal =
    grouped[today] || 0;

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

        {/* PAGE HEADER */}
        <div style={pageHeader}>

          <div>
            <h1 style={pageTitle}>
              Tren Aktivitas
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

        {/* STATS CARD */}
        <div style={statsBox}>

          <h3 style={statsTitle}>
            Total Aktivasi Alarm Hari Ini
          </h3>

          <h1 style={statsNumber}>
            {todayTotal}
          </h1>

          <div style={statsSubtext}>
            Peringatan terdeteksi pada {new Date(today + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

        </div>

        {/* CHART */}
        <div style={chartBox}>

          <h3 style={chartTitle}>
            Grafik Aktivitas Alarm per Hari
          </h3>

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <LineChart data={chartData}>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(241,255,246,0.14)"
              />

              <XAxis
                dataKey="date"
                stroke="rgba(241,255,246,0.56)"
                style={{ fontSize: "12px" }}
              />

              <YAxis
                allowDecimals={false}
                stroke="rgba(241,255,246,0.56)"
                style={{ fontSize: "12px" }}
              />

              <Tooltip
                contentStyle={{
                  background:
                    "rgba(8, 28, 21, 0.94)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  borderRadius: "8px",
                  boxShadow: "0 14px 32px rgba(0,0,0,0.28)",
                  color: "#f7fff9",
                }}
              />

              <Line
                type="monotone"
                dataKey="total"
                stroke="#52b788"
                strokeWidth={3}
                dot={{ r: 5, fill: "#52b788" }}
                activeDot={{ r: 7, fill: "#95d5b2" }}
              />

            </LineChart>

          </ResponsiveContainer>

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
  padding: "24px 30px",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  overflow: "auto",
  background: "transparent",
};

//////////////////////////////////////////////////
// PAGE HEADER
//////////////////////////////////////////////////

const pageHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
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
// STATS BOX
//////////////////////////////////////////////////

const statsBox = {
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.13), rgba(255,255,255,0.07))",
  borderRadius: "14px",
  boxShadow:
    "0 18px 38px rgba(0,0,0,0.26)",
  border: "1px solid rgba(255,255,255,0.16)",
  backdropFilter: "blur(16px)",
  padding: "28px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
};

//////////////////////////////////////////////////
// CHART BOX
//////////////////////////////////////////////////

const chartBox = {
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.11), rgba(255,255,255,0.06))",
  borderRadius: "14px",
  boxShadow:
    "0 18px 38px rgba(0,0,0,0.28)",
  border: "1px solid rgba(255,255,255,0.14)",
  backdropFilter: "blur(16px)",
  padding: "24px",
  flex: 1,
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
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
  margin: "0 0 12px 0",
  fontSize: "44px",
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
// CHART TITLE
//////////////////////////////////////////////////

const chartTitle = {
  margin: "0 0 16px 0",
  fontSize: "14px",
  fontWeight: "600",
  color: "#f7fff9",
};
