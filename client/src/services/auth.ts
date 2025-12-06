import axios from "axios";

const API = "http://localhost:4000/api";

export const authService = {
  // ----------------- Login -----------------
  async login(email: string, password: string) {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    const { token, user, requires2FA, userId } = res.data;

    // Only store token & user if 2FA not required
    if (!requires2FA) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    }

    return res.data;
  },

  // ----------------- 2FA Login -----------------
  async loginWith2FA(userId: number, code: string) {
    const res = await axios.post(`${API}/auth/2fa/login`, { userId, code });
    const { token, user } = res.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    return res.data;
  },

  // ----------------- Register -----------------
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

  // ----------------- Generate 2FA QR -----------------
  async get2FAQR() {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API}/auth/2fa/generate`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // ----------------- Verify 2FA -----------------
  async verify2FA(code: string) {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `${API}/auth/2fa/verify`,
      { code },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  },

  // ----------------- Token & User -----------------
  getToken() {
    return localStorage.getItem("token");
  },

  getUser() {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  },

  // ----------------- Logout -----------------
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
