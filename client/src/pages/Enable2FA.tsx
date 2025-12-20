import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth";

export default function Enable2FA() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    // Fetch QR code from backend
    authService
      .get2FAQR()
      .then((res) => setQrCode(res.qrCode))
      .catch((err) => setMessage("Failed to load QR code"));
  }, []);

  const handleVerify = async () => {
    try {
      const res = await authService.verify2FA(code);
      setMessage(res.message);
      setTimeout(() => nav("/home"), 1500);
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Verification failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F6F6F5] px-4">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold mb-4">Enable 2FA</h2>
        {qrCode ? (
          <img src={qrCode} alt="Scan this QR code" className="mx-auto mb-4" />
        ) : (
          <p>Loading QR code...</p>
        )}
        <p className="mb-4 text-sm text-[#5F4130]">
          Scan this QR code in Google Authenticator and enter the 6-digit code
          below.
        </p>
        <input
          placeholder="Enter 6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full px-4 py-3 border border-[#EAE7E4] rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-[#986439] text-[#0B0B0A]"
        />
        <button
          onClick={handleVerify}
          className="w-full bg-[#E58411] text-white py-3 rounded-full font-semibold hover:bg-[#5F4130] transition-all duration-300"
        >
          Verify & Enable
        </button>
        {message && <p className="mt-4 text-sm text-[#E58411]">{message}</p>}
      </div>
    </div>
  );
}
