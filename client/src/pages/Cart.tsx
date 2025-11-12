import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/auth";

interface CartItem {
  productId: number;
  qty: number;
  name: string;
  price: number;
  image?: string;
}

export default function Cart() {
  const navigate = useNavigate();
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
    showToast("Item removed");
  }

  function handleProceedToCheckout() {
    if (!authService.getToken()) {
      alert("Please login to proceed to checkout");
      return;
    }
    navigate("/checkout");
  }
  console.log(cart);

  return (
    <div className="min-h-screen bg-[#F6F6F5] flex flex-col items-center font-[Montserrat] px-6 py-10">
      <h2 className="text-4xl font-bold text-[#0B0B0A] mb-10">Your Cart</h2>

      {cart.length === 0 ? (
        <div className="bg-white shadow-md rounded-2xl p-10 text-center max-w-2xl w-full">
          <p className="text-gray-600 text-lg mb-10">Your cart is empty 🛋️</p>
          <Link
            to="/products"
            className="bg-[#E58411] hover:bg-[#c96f0e] text-white font-semibold py-3 px-6 rounded-xl transition"
          >
            {"Continue Shopping →"}
          </Link>
        </div>
      ) : (
        <div className="w-full max-w-3xl space-y-5">
          {cart.map((product) => (
            <div
              key={product.productId}
              className="flex items-center justify-between bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-4">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 object-contain rounded-xl border"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 flex items-center justify-center rounded-xl text-3xl">
                    🪑
                  </div>
                )}
                <div>
                  <p className="text-lg font-semibold text-[#0B0B0A]">
                    {product.name}
                  </p>
                  <p className="text-sm text-gray-500">Qty: {product.qty}</p>
                  <p className="text-sm text-gray-500">
                    Price: ${product.price?.toFixed(2)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeItem(product.productId)}
                className="text-[#E58411] hover:text-[#c96f0e] font-bold text-2xl"
              >
                ×
              </button>
            </div>
          ))}

          {/* Proceed to Checkout */}
          <div className="flex flex-col items-center mt-10">
            <button
              onClick={handleProceedToCheckout}
              disabled={cart.length === 0}
              className={`w-full md:w-1/2 py-4 rounded-xl text-white font-semibold text-lg shadow-lg transition ${
                cart.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#E58411] hover:bg-[#c96f0e]"
              }`}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}

      {toast.visible && (
        <div className="fixed bottom-6 right-6 bg-[#E58411] text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-slideUp opacity-90">
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
