import axios from "axios";
axios.defaults.withCredentials = true; // Ensure cookies are sent with requests
import { useAuthStore } from "./AuthStore";


const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;