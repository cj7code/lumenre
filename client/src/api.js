import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // always read from env
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
