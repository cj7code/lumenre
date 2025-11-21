// src/api.js
import axios from "axios";

/* 
  -----------------------------------------------
  🌍 Automatic API URL Switching (Local + Vercel)
  -----------------------------------------------
  - When running locally (npm run dev):
        → Uses http://localhost:5000/api
  - When deployed on Vercel:
        → Uses VITE_API_URL/api
  - No manual changing required.
*/
const baseURL =
  import.meta.env.PROD
    ? import.meta.env.VITE_API_URL                      // Production backend URL (from Vercel env vars)
    : "http://localhost:5000";                          // Local backend during development

// Create axios instance
const api = axios.create({
  baseURL: baseURL + "/api",
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
