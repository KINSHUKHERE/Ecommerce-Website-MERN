import axios from "axios";

// Dynamically read the backend base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
console.log("API URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
