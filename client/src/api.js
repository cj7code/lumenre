// src/api.js
import axios from "axios";

/* 
  -----------------------------------------------
  🌍 Automatic API URL Switching (Local + Render)
  -----------------------------------------------
  - Local dev → http://localhost:5000/api
  - Production → VITE_API_URL/api
*/
const baseURL = import.meta.env.PROD
  ? import.meta.env.VITE_API_URL      // e.g. https://lumenre.onrender.com
  : "http://localhost:5000";          // local backend

// Create axios instance using the computed baseURL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,          // 👈 Always correct
  timeout: 10000,
});

// --------------------------------------
// Attach JWT Token for protected routes
// --------------------------------------
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default api;
