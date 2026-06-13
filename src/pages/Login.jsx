import { useState } from "react";
import { useNavigate } from "react-router-dom";

import elephantIcon from "../assets/elephant.svg";
import gajahBackground from "../assets/gajah1.png";
import {
  login,
  signup,
} from "../services/authService";

export default function Login() {

  const navigate = useNavigate();

  //////////////////////////////////////////////////
  // STATE
  //////////////////////////////////////////////////

  const [isSignup, setIsSignup] =
    useState(false);

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("error"); // "error" or "success"

  //////////////////////////////////////////////////
  // HANDLE LOGIN
  //////////////////////////////////////////////////

  const handleLogin = () => {
    setMessage("");

    if (!username || !password) {
      setMessage(
        "Username dan password harus diisi"
      );
      setMessageType("error");
      return;
    }

    const result = login(username, password);

    if (result.success) {
      localStorage.setItem(
        "isLogin",
        "true"
      );

      localStorage.setItem(
        "username",
        username
      );

      navigate("/dashboard");
    } else {
      setMessage(result.message);
      setMessageType("error");
    }
  };

  //////////////////////////////////////////////////
  // HANDLE SIGNUP
  //////////////////////////////////////////////////

  const handleSignup = () => {
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Password tidak cocok");
      setMessageType("error");
      return;
    }

    const result = signup(username, password);

    if (result.success) {
      setMessage(result.message);
      setMessageType("success");

      // Clear form and switch back to login
      setTimeout(() => {
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setIsSignup(false);
        setMessage("");
      }, 1500);
    } else {
      setMessage(result.message);
      setMessageType("error");
    }
  };

  //////////////////////////////////////////////////
  // TOGGLE MODE
  //////////////////////////////////////////////////

  const toggleMode = () => {
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setMessage("");
    setIsSignup(!isSignup);
  };

  return (

    <div style={container}>

      {/* LEFT SIDE - BACKGROUND GAJAH */}
      <div style={leftSide}>
        <img
          src={gajahBackground}
          alt="gajah"
          style={backgroundImage}
        />
        <div style={overlay}></div>
        <div style={leftContent}>
          <div style={leftLogoBox}>
            <img
              src={elephantIcon}
              alt="elephant"
              style={leftLogo}
            />
          </div>
          <div>
            <div style={leftEyebrow}>
              SISTEM
            </div>
            <h1 style={leftTitle}>
              PENDETEKSI
              <br />
              GAJAH
            </h1>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div style={rightSide}>

        {/* FORM CARD */}
        <div style={loginCard}>

          {/* HEADER */}
          <div style={header}>

            <img
              src={elephantIcon}
              alt="elephant"
              style={icon}
            />

            <div style={headerText}>
              SISTEM PENDETEKSI GAJAH
            </div>

          </div>

          {/* FORM */}
          <div style={formContainer}>

            {/* MODE TITLE */}
            <div style={modeTitle}>
              {isSignup ? "BUAT AKUN" : "LOGIN"}
            </div>

            {/* MESSAGE */}
            {message && (
              <div
                style={{
                  ...messageBox,
                  backgroundColor:
                    messageType === "success"
                      ? "rgba(76, 175, 80, 0.3)"
                      : "rgba(244, 67, 54, 0.3)",
                  borderColor:
                    messageType === "success"
                      ? "#4CAF50"
                      : "#F44336",
                  color:
                    messageType === "success"
                      ? "#4CAF50"
                      : "#FF6B6B",
                }}
              >
                {message}
              </div>
            )}

            {/* USERNAME */}
            <div style={inputGroup}>

              <label style={label}>
                Username
              </label>

              <input
                type="text"

                placeholder="Masukkan username"

                value={username}

                onChange={(e) =>
                  setUsername(
                    e.target.value
                  )
                }

                style={input}
              />

            </div>

            {/* PASSWORD */}
            <div style={inputGroup}>

              <label style={label}>
                Password
              </label>

              <div style={passwordWrapper}>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }

                  placeholder="Masukkan password"

                  value={password}

                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }

                  style={passwordInput}
                />

                {/* SHOW / HIDE */}
                <div
                  style={toggleButton}

                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >

                  {
                    showPassword
                      ? "HIDE"
                      : "SHOW"
                  }

                </div>

              </div>

            </div>

            {/* CONFIRM PASSWORD (Signup Only) */}
            {isSignup && (
              <div style={inputGroup}>

                <label style={label}>
                  Konfirmasi Password
                </label>

                <div style={passwordWrapper}>

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }

                    placeholder="Konfirmasi password"

                    value={confirmPassword}

                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }

                    style={passwordInput}
                  />

                  {/* SHOW / HIDE */}
                  <div
                    style={toggleButton}

                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                  >

                    {
                      showConfirmPassword
                        ? "HIDE"
                        : "SHOW"
                    }

                  </div>

                </div>

              </div>
            )}

            {/* BUTTON */}
            <button
              style={button}
              onClick={
                isSignup
                  ? handleSignup
                  : handleLogin
              }
            >
              {isSignup ? "BUAT AKUN" : "LOGIN"}
            </button>

            {/* TOGGLE SIGNUP / LOGIN */}
            <div style={toggleContainer}>
              <span style={toggleText}>
                {isSignup
                  ? "Sudah punya akun?"
                  : "Belum punya akun?"}
              </span>
              <button
                style={toggleLink}
                onClick={toggleMode}
              >
                {isSignup
                  ? "LOGIN"
                  : "BUAT AKUN"}
              </button>
            </div>

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

  background: "#f5f5f5",

  fontFamily:
    "'Poppins', sans-serif",

  overflow: "hidden",
};

//////////////////////////////////////////////////
// LEFT SIDE - GAJAH BACKGROUND
//////////////////////////////////////////////////

const leftSide = {

  flex: 1,

  position: "relative",

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  overflow: "hidden",

  background:
    "linear-gradient(135deg, #1b4332, #2d6a4f, #40916c)",
};

const backgroundImage = {

  position: "absolute",

  width: "100%",

  height: "100%",

  objectFit: "cover",

  objectPosition: "center",
};

const overlay = {

  position: "absolute",

  width: "100%",

  height: "100%",

  background:
    "linear-gradient(to top, rgba(27, 67, 50, 0.8), rgba(45, 106, 79, 0.5))",

  backdropFilter: "blur(2px)",
};

const leftContent = {

  position: "absolute",

  zIndex: 2,

  top: "26%",

  left: "14%",

  display: "flex",

  alignItems: "center",

  gap: "18px",

  color: "white",
};

const leftLogoBox = {

  width: "58px",

  height: "58px",

  borderRadius: "14px",

  background:
    "linear-gradient(135deg, #4CAF50, #2e7d32)",

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  boxShadow:
    "0 12px 24px rgba(0,0,0,0.28)",
};

const leftLogo = {

  width: "34px",

  height: "34px",

  filter: "brightness(0) invert(1)",
};

const leftEyebrow = {

  fontSize: "15px",

  fontWeight: "700",

  letterSpacing: "3px",

  color: "white",

  lineHeight: "1",

  opacity: 0.9,

  textShadow: "2px 2px 4px rgba(0,0,0,0.35)",
};

const leftTitle = {

  fontSize: "34px",

  fontWeight: "800",

  margin: 0,

  lineHeight: "1.05",

  textShadow: "2px 2px 4px rgba(0,0,0,0.35)",

  color: "white",

  letterSpacing: "1px",
};

//////////////////////////////////////////////////
// RIGHT SIDE - LOGIN FORM
//////////////////////////////////////////////////

const rightSide = {

  flex: 1,

  position: "relative",

  display: "flex",

  justifyContent: "center",

  alignItems: "center",

  padding: "40px",

  background:
    "radial-gradient(circle at 50% 82%, rgba(82, 183, 136, 0.32), transparent 38%), linear-gradient(160deg, #081c15 0%, #123524 48%, #1b4332 100%)",

  borderLeft:
    "1px solid rgba(255,255,255,0.08)",
};

//////////////////////////////////////////////////
// LOGIN CARD
//////////////////////////////////////////////////

const loginCard = {

  width: "100%",

  maxWidth: "420px",

  padding: "40px",

  borderRadius: "20px",

  background:
    "linear-gradient(180deg, rgba(255,255,255,0.13), rgba(255,255,255,0.07))",

  backdropFilter: "blur(16px)",

  boxShadow:
    "0 24px 60px rgba(0,0,0,0.34)",

  border:
    "1px solid rgba(255,255,255,0.18)",

  display: "flex",

  flexDirection: "column",

  gap: "24px",
};

//////////////////////////////////////////////////
// HEADER
//////////////////////////////////////////////////

const header = {

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  gap: "12px",

  paddingBottom: "16px",

  borderBottom:
    "1px solid rgba(255,255,255,0.18)",
};

const icon = {

  width: "36px",

  height: "36px",

  filter: "brightness(0) invert(1)",
};

const headerText = {

  color: "#f1fff6",

  fontSize: "20px",

  fontWeight: "700",

  letterSpacing: "0.5px",
};

//////////////////////////////////////////////////
// FORM
//////////////////////////////////////////////////

const formContainer = {

  display: "flex",

  flexDirection: "column",

  gap: "20px",
};

const inputGroup = {

  display: "flex",

  flexDirection: "column",

  gap: "8px",
};

const label = {

  color: "rgba(241,255,246,0.86)",

  fontSize: "14px",

  fontWeight: "600",
};

//////////////////////////////////////////////////
// INPUT
//////////////////////////////////////////////////

const input = {

  padding: "14px 16px",

  borderRadius: "10px",

  border:
    "1px solid rgba(255,255,255,0.18)",

  background: "rgba(8, 28, 21, 0.52)",

  color: "#f7fff9",

  fontSize: "15px",

  outline: "none",

  transition: "all 0.3s",

  "&:focus": {
    border: "1px solid #74c69d",
    background: "rgba(8, 28, 21, 0.72)",
    boxShadow: "0 0 0 3px rgba(116, 198, 157, 0.16)",
  },
};

//////////////////////////////////////////////////
// PASSWORD WRAPPER
//////////////////////////////////////////////////

const passwordWrapper = {

  display: "flex",

  alignItems: "center",

  background: "rgba(8, 28, 21, 0.52)",

  border:
    "1px solid rgba(255,255,255,0.18)",

  borderRadius: "10px",

  overflow: "hidden",

  transition: "all 0.3s",
};

const passwordInput = {

  flex: 1,

  padding: "14px 16px",

  border: "none",

  background: "transparent",

  color: "#f7fff9",

  fontSize: "15px",

  outline: "none",
};

//////////////////////////////////////////////////
// SHOW HIDE BUTTON
//////////////////////////////////////////////////

const toggleButton = {

  width: "70px",

  display: "flex",

  justifyContent: "center",

  alignItems: "center",

  cursor: "pointer",

  color: "#95d5b2",

  fontSize: "12px",

  fontWeight: "600",

  userSelect: "none",

  transition: "0.2s",
};

//////////////////////////////////////////////////
// BUTTON
//////////////////////////////////////////////////

const button = {

  marginTop: "10px",

  padding: "14px 20px",

  borderRadius: "10px",

  border: "none",

  background:
    "linear-gradient(135deg, #52b788, #2d6a4f)",

  color: "white",

  fontSize: "15px",

  fontWeight: "600",

  cursor: "pointer",

  transition: "all 0.3s",

  boxShadow:
    "0 12px 24px rgba(45, 106, 79, 0.32)",
};

//////////////////////////////////////////////////
// MODE TITLE
//////////////////////////////////////////////////

const modeTitle = {

  color: "#f7fff9",

  fontSize: "18px",

  fontWeight: "700",

  textAlign: "center",

  marginTop: "10px",
};

//////////////////////////////////////////////////
// MESSAGE BOX
//////////////////////////////////////////////////

const messageBox = {

  padding: "12px 16px",

  borderRadius: "10px",

  border: "1px solid #F44336",

  fontSize: "13px",

  fontWeight: "500",

  textAlign: "center",

  marginBottom: "10px",
};

//////////////////////////////////////////////////
// TOGGLE CONTAINER
//////////////////////////////////////////////////

const toggleContainer = {

  display: "flex",

  justifyContent: "center",

  alignItems: "center",

  gap: "6px",

  marginTop: "15px",
};

const toggleText = {

  color: "rgba(241,255,246,0.72)",

  fontSize: "14px",
};

const toggleLink = {

  background: "transparent",

  border: "none",

  color: "#95d5b2",

  fontSize: "14px",

  fontWeight: "700",

  cursor: "pointer",

  textDecoration: "none",

  padding: "0",

  transition: "all 0.2s",
};
