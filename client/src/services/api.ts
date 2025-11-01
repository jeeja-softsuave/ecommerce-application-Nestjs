import axios from "axios";
import { authService } from "./auth";

const API = axios.create({
  baseURL: "http://localhost:4000/api"
});

API.interceptors.request.use((cfg) => {
  const token = authService.getToken();
  if (token) cfg.headers = { ...cfg.headers, Authorization: `Bearer ${token}` };
  return cfg;
});

export default API;
