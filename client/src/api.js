import axios from "axios";

const baseURL = import.meta.env.PROD
  ? import.meta.env.VITE_API_URL         // MUST be: https://lumenre.onrender.com/api
  : "http://localhost:5000/api";         // MUST include /api

const api = axios.create({
  baseURL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
