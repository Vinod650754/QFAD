import axios from "axios";

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, ""),
  timeout: 12000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  try {
    const token = window.localStorage.getItem("qotd_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // localStorage unavailable in some browser privacy modes
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "Network request failed";
    return Promise.reject(new Error(message));
  }
);

export default api;
