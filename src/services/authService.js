//////////////////////////////////////////////////
// AUTH SERVICE
// Mengelola login dan signup melalui backend
//////////////////////////////////////////////////

import API from "./api";

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    fallback
  );
};

//////////////////////////////////////////////////
// LOGIN - Validate username and password
//////////////////////////////////////////////////
export const login = async (username, password) => {
  try {
    const res = await API.post("/api/auth/login", {
      username,
      password,
    });

    return res.data;
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(
        error,
        "Login gagal. Periksa koneksi ke backend."
      ),
    };
  }
};

//////////////////////////////////////////////////
// SIGNUP - Register new account
//////////////////////////////////////////////////
export const signup = async (username, password) => {
  try {
    const res = await API.post("/api/auth/signup", {
      username,
      password,
    });

    return res.data;
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(
        error,
        "Akun gagal dibuat. Periksa koneksi ke backend."
      ),
    };
  }
};

//////////////////////////////////////////////////
// CHECK USERNAME AVAILABILITY
//////////////////////////////////////////////////
export const checkUsernameAvailable = async (
  username
) => {
  try {
    const res = await API.get(
      "/api/auth/check-username",
      { params: { username } }
    );

    return res.data.available;
  } catch {
    return false;
  }
};
