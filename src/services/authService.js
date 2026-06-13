//////////////////////////////////////////////////
// AUTH SERVICE
// Mengelola username dan password
//////////////////////////////////////////////////

const CREDENTIALS_KEY = "app_credentials";

// Default credentials (admin account)
const DEFAULT_CREDENTIALS = [
  {
    username: "admin",
    password: "admin123",
  },
];

//////////////////////////////////////////////////
// GET ALL CREDENTIALS
//////////////////////////////////////////////////
export const getAllCredentials = () => {
  const stored = localStorage.getItem(
    CREDENTIALS_KEY
  );

  if (stored) {
    return JSON.parse(stored);
  }

  // Initialize with default if empty
  localStorage.setItem(
    CREDENTIALS_KEY,
    JSON.stringify(DEFAULT_CREDENTIALS)
  );

  return DEFAULT_CREDENTIALS;
};

//////////////////////////////////////////////////
// LOGIN - Validate username and password
//////////////////////////////////////////////////
export const login = (username, password) => {
  const credentials = getAllCredentials();

  const user = credentials.find(
    (cred) =>
      cred.username === username &&
      cred.password === password
  );

  if (user) {
    return {
      success: true,
      message: "Login berhasil",
    };
  }

  return {
    success: false,
    message: "Username atau password salah",
  };
};

//////////////////////////////////////////////////
// SIGNUP - Register new account
//////////////////////////////////////////////////
export const signup = (username, password) => {
  // Validate input
  if (!username || !password) {
    return {
      success: false,
      message: "Username dan password harus diisi",
    };
  }

  if (username.length < 3) {
    return {
      success: false,
      message:
        "Username minimal 3 karakter",
    };
  }

  if (password.length < 6) {
    return {
      success: false,
      message:
        "Password minimal 6 karakter",
    };
  }

  const credentials = getAllCredentials();

  // Check if username already exists
  const userExists = credentials.find(
    (cred) => cred.username === username
  );

  if (userExists) {
    return {
      success: false,
      message: "Username sudah terdaftar",
    };
  }

  // Add new credential
  credentials.push({
    username,
    password,
  });

  localStorage.setItem(
    CREDENTIALS_KEY,
    JSON.stringify(credentials)
  );

  return {
    success: true,
    message: "Akun berhasil dibuat",
  };
};

//////////////////////////////////////////////////
// CHECK USERNAME AVAILABILITY
//////////////////////////////////////////////////
export const checkUsernameAvailable = (
  username
) => {
  const credentials = getAllCredentials();
  const exists = credentials.find(
    (cred) => cred.username === username
  );

  return !exists;
};
