import React from "react";
import { authService } from "../services/auth";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [role, setRole] = React.useState("user");
  const [phone, setPhone] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const nav = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await authService.register(name, email, password, role, phone);
      setSuccess("Registered successfully! Redirecting to login...");
      setTimeout(() => nav("/login"), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F6F6F5] px-4 font-sans">
      <form
        onSubmit={submit}
        className="bg-white shadow-lg rounded-3xl p-8 w-full max-w-md border border-[#EAE7E4] animate-fade-in"
      >
        <h2 className="text-3xl font-extrabold mb-4 text-center text-[#0B0B0A]">
          Create Account
        </h2>
        <p className="text-center text-[#5F4130] mb-8 text-sm">
          Join our community and start exploring furniture you’ll love.
        </p>

        {/* Name */}
        <div className="mb-4">
          <input
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-[#EAE7E4] rounded-xl bg-[#FDFCFB] focus:outline-none focus:ring-2 focus:ring-[#986439] transition text-[#0B0B0A]"
            required
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <input
            placeholder="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-[#EAE7E4] rounded-xl bg-[#FDFCFB] focus:outline-none focus:ring-2 focus:ring-[#986439] transition text-[#0B0B0A]"
            required
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-[#EAE7E4] rounded-xl bg-[#FDFCFB] focus:outline-none focus:ring-2 focus:ring-[#986439] transition text-[#0B0B0A]"
            required
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-4">
          <input
            placeholder="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 border border-[#EAE7E4] rounded-xl bg-[#FDFCFB] focus:outline-none focus:ring-2 focus:ring-[#986439] transition text-[#0B0B0A]"
            required
          />
        </div>

        {/* Phone */}
        <div className="mb-4">
          <input
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 border border-[#EAE7E4] rounded-xl bg-[#FDFCFB] focus:outline-none focus:ring-2 focus:ring-[#986439] transition text-[#0B0B0A]"
          />
        </div>

        {/* Role */}
        <div className="mb-6">
          <label className="block mb-2 text-[#5F4130] font-medium">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-3 border border-[#EAE7E4] rounded-xl bg-[#FDFCFB] focus:outline-none focus:ring-2 focus:ring-[#986439] transition text-[#0B0B0A]"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Messages */}
        {error && (
          <p className="text-[#B33A3A] text-sm mb-4 text-center bg-[#FDECEC] py-2 rounded-md">
            {error}
          </p>
        )}
        {success && (
          <p className="text-[#2B7A0B] text-sm mb-4 text-center bg-[#E9F9EE] py-2 rounded-md">
            {success}
          </p>
        )}

        {/* Button */}
        <button
          type="submit"
          className="w-full bg-[#E58411] text-white py-3 rounded-full font-semibold hover:bg-[#5F4130] transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Register
        </button>

        <p className="text-center text-sm  mt-6">
          Already have an account?{" "}
          <span
            onClick={() => nav("/login")}
            className="text-[#E58411] font-semibold cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
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
