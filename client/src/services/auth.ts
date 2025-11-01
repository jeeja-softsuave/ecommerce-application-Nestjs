import axios from "axios";

const API = "http://localhost:4000/api";

export const authService = {
  async login(email: string, password: string) {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    const { token, user } = res.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    return res.data;
  },
  async register(
    name: string,
    email: string,
    password: string,
    role?: string,
    phone?: string
  ) {
    const res = await axios.post(`${API}/auth/register`, {
      name,
      email,
      password,
      role,
      phone,
    });
    return res.data;
  },
  getToken() {
    return localStorage.getItem("token");
  },
  getUser() {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  },
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
