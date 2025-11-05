import React from "react";
import API from "../services/api";
import { authService } from "../services/auth";

interface CartItem {
  productId: number;
  qty: number;
  name: string;
  image?: string;
}

export default function Cart() {
  const [cart, setCart] = React.useState<CartItem[]>(() => {
    const raw = localStorage.getItem("cart");
    return raw ? JSON.parse(raw) : [];
  });
  const [toast, setToast] = React.useState<{ text: string; visible: boolean }>({
    text: "",
    visible: false,
  });

  React.useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const showToast = (text: string) => {
    setToast({ text, visible: true });
    setTimeout(() => setToast({ text: "", visible: false }), 2500);
  };

  function removeItem(productId: number) {
    setCart((prev) => prev.filter((p) => p.productId !== productId));
    showToast("❌ Item removed");
  }

  async function checkout() {
    try {
      if (!authService.getToken()) {
        alert("Please login to purchase");
        return;
      }

      const res = await API.post("/orders", { items: cart });
      showToast(`✅ Order placed! ID: ${res.data.orderId}`);
      setCart([]);
      localStorage.removeItem("cart");
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Your Cart</h2>

      {cart.length === 0 ? (
        <div className="text-gray-500 text-center py-8 border rounded bg-white shadow">
          Your cart is empty.
        </div>
      ) : (
        <div className="space-y-4">
          {cart.map((c) => (
            <div
              key={c.productId}
              className="flex items-center justify-between bg-white p-4 rounded-lg shadow hover:shadow-md transition-all"
            >
              <div className="flex items-center space-x-4">
                {c.image ? (
                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-16 h-16 object-contain rounded-lg border"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded-lg">
                    🪑
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-800">{c.name}</p>
                  <p className="text-gray-500 text-sm">Qty: {c.qty}</p>
                </div>
              </div>
              <button
                onClick={() => removeItem(c.productId)}
                className="text-red-500 hover:text-red-700 font-bold text-xl"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={checkout}
        disabled={cart.length === 0}
        className={`mt-6 w-full py-3 rounded-md text-white font-semibold transition ${
          cart.length === 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-500 hover:bg-green-600"
        }`}
      >
        Purchase
      </button>

      {/* Floating Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium transform transition-all duration-500 ease-in-out animate-slideUp opacity-90">
          {toast.text}
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
