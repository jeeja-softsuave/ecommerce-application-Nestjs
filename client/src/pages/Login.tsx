import React from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth";

export default function Login({ onLogin }: { onLogin?: () => void }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  const [requires2FA, setRequires2FA] = React.useState(false);
  const [userId, setUserId] = React.useState<number | null>(null);
  const [twoFACode, setTwoFACode] = React.useState("");

  const nav = useNavigate();

  // ----------------- Login Email/Password -----------------
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const res = await authService.login(email, password);

      // Backend requires 2FA
      if (res.requires2FA) {
        setRequires2FA(true);
        setUserId(res.userId);
        return;
      }

      localStorage.setItem("token", res.token);
      onLogin?.();
      nav("/home");
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message);
    }
  }

  // ----------------- Submit 2FA Code -----------------
  async function submit2FA() {
    if (!userId) return;
    setError("");

    try {
      const res = await authService.loginWith2FA(userId, twoFACode);
      localStorage.setItem("token", res.token);
      onLogin?.();
      nav("/home");
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message);
    }
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-[#F6F6F5] px-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/asserts/Home.png')" }}
    >
      <form
        onSubmit={!requires2FA ? submit : (e) => e.preventDefault()}
        className="bg-white/95 shadow-lg rounded-3xl p-8 w-full max-w-sm border border-[#EAE7E4] animate-fade-in"
      >
        <h2 className="text-3xl font-extrabold mb-4 text-center text-[#0B0B0A]">
          Login
        </h2>
        <p className="text-center text-[#5F4130] mb-8 text-sm">
          Log in to continue exploring furniture you’ll love.
        </p>

        {error && (
          <p className="text-[#E58411] text-sm mb-4 text-center bg-[#FDECEC] py-2 rounded-md">
            {error}
          </p>
        )}
        {!requires2FA ? (
          <>
            <div className="mb-4">
              <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-[#EAE7E4] rounded-xl bg-[#FDFCFB] focus:outline-none focus:ring-2 focus:ring-[#986439] transition text-[#0B0B0A]"
              />
            </div>

            <div className="mb-6">
              <input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[#EAE7E4] rounded-xl bg-[#FDFCFB] focus:outline-none focus:ring-2 focus:ring-[#986439] transition text-[#0B0B0A]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#E58411] text-white py-3 rounded-full font-semibold hover:bg-[#5F4130] transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Login
            </button>
          </>
        ) : (
          <>
            <p className="text-center text-[#5F4130] mb-4 text-sm">
              Enter your 2FA code from Google Authenticator
            </p>
            <input
              placeholder="6-digit code"
              value={twoFACode}
              onChange={(e) => setTwoFACode(e.target.value)}
              className="w-full px-4 py-3 border border-[#EAE7E4] rounded-xl bg-[#FDFCFB] focus:outline-none focus:ring-2 focus:ring-[#986439] transition text-[#0B0B0A] mb-4"
            />
            <button
              type="button"
              onClick={submit2FA}
              className="w-full bg-[#E58411] text-white py-3 rounded-full font-semibold hover:bg-[#5F4130] transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Verify 2FA
            </button>
          </>
        )}

        {!requires2FA && (
          <p className="text-center text-sm mt-6">
            Don’t have an account?{" "}
            <span
              onClick={() => nav("/register")}
              className="text-[#E58411] font-semibold cursor-pointer hover:underline"
            >
              Register
            </span>
          </p>
        )}
      </form>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.6s ease-out;
          }
        `}
      </style>
    </div>
  );
}
