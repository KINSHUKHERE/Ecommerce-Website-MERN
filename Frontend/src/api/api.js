import axios from "axios";
import { Capacitor } from "@capacitor/core";

// Dynamically read the backend base URL from environment variables
let API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// If running inside a native mobile app (e.g. on Android emulator), map localhost requests to the emulator loopback address 10.0.2.2
if (Capacitor.isNativePlatform()) {
  if (Capacitor.getPlatform() === "android") {
    if (API_BASE_URL.includes("localhost") || API_BASE_URL.includes("127.0.0.1")) {
      API_BASE_URL = API_BASE_URL.replace("localhost", "10.0.2.2").replace("127.0.0.1", "10.0.2.2");
    }
  }
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach JWT token to Authorization header for cross-origin requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
