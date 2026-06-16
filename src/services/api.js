import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export default API;

export const getImageUrl = (imagePath) => {
  if (!imagePath) return "";

  return `${API_BASE_URL}/${imagePath}`;
};

//////////////////////////////////////////////////
// GET DATA TERBARU
//////////////////////////////////////////////////
export const getLatest = async (
  camera = null
) => {

  let url = "/api/latest";

  // =========================================
  // FILTER CAMERA
  // =========================================
  if (camera) {

    url += `?camera=${camera}`;

  }

  const res = await API.get(url);

  return res.data;
};

//////////////////////////////////////////////////
// GET HISTORY
//////////////////////////////////////////////////
export const getHistory = async (
  camera = null
) => {

  let url = "/api/history";

  // =========================================
  // FILTER CAMERA
  // =========================================
  if (camera) {

    url += `?camera=${camera}`;

  }

  const res = await API.get(url);

  return res.data;
};

//////////////////////////////////////////////////
// GET CAMERA LIST
//////////////////////////////////////////////////
export const getCameras = async () => {

  const res = await API.get(
    "/api/cameras"
  );

  return res.data;
};

//////////////////////////////////////////////////
// GET FENCE CONFIG
//////////////////////////////////////////////////
export const getFence = async (
  camera = "default"
) => {

  const res = await API.get(
    `/api/fence?camera=${camera}`
  );

  return res.data;
};

//////////////////////////////////////////////////
// SAVE FENCE POLYGON
//////////////////////////////////////////////////
export const saveFence = async (
  camera,
  polygon
) => {

  const res = await API.post(
    `/api/fence?camera=${camera}`,
    { polygon }
  );

  return res.data;
};

//////////////////////////////////////////////////
// RELOAD FENCE (MQTT)
//////////////////////////////////////////////////
export const reloadFence = async () => {

  const res = await API.post(
    "/api/fence/reload"
  );

  return res.data;
};
