import React from "react";
import API from "../services/api";
import { authService } from "../services/auth";

interface CartItem {
  productId: number;
  qty: number;
  name: string; // added name
}

export default function Cart() {
  const [cart, setCart] = React.useState<CartItem[]>(() => {
    const raw = localStorage.getItem("cart");
    return raw ? JSON.parse(raw) : [];
  });
  const [message, setMessage] = React.useState("");

  // Persist cart to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Add a product to the cart
  async function addToCart(productId: number) {
    try {
      // fetch product info
      const res = await API.get(`/products/${productId}`);
      const productName = res.data.title;

      setCart((prev) => {
        const found = prev.find((p) => p.productId === productId);
        if (found) return prev.map((p) =>
          p.productId === productId ? { ...p, qty: p.qty + 1 } : p
        );
        return [...prev, { productId, qty: 1, name: productName }];
      });

      setMessage("✅ Product added to cart");
      setTimeout(() => setMessage(""), 2000);
    } catch {
      alert("Failed to fetch product info");
    }
  }

  // Remove a product from the cart
  function removeItem(productId: number) {
    setCart(prev => prev.filter(p => p.productId !== productId));
  }

  async function checkout() {
    try {
      if (!authService.getToken()) {
        alert("Please login to purchase");
        return;
      }

      const res = await API.post("/orders", { items: cart });
      setMessage("✅ Order placed! ID: " + res.data.orderId);
      setCart([]);
      localStorage.removeItem("cart");
      setTimeout(() => setMessage(""), 5000);
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Cart / Checkout</h2>

      {cart.length === 0 ? (
        <div className="text-gray-500 text-center py-8 border rounded bg-white shadow">
          Your cart is empty.
        </div>
      ) : (
        <div className="space-y-4">
          {cart.map((c) => (
            <div
              key={c.productId}
              className="flex justify-between items-center bg-white p-4 rounded shadow hover:shadow-md transition"
            >
              {/* Display product name */}
              <span className="text-gray-700">{c.name}</span>
              <span className="font-semibold text-gray-900">Qty: {c.qty}</span>
              <button
                onClick={() => removeItem(c.productId)}
                className="ml-4 text-red-500 hover:text-red-700 font-bold"
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
        className={`mt-6 w-full py-3 rounded-md text-white font-semibold transition-colors ${
          cart.length === 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-500 hover:bg-green-600"
        }`}
      >
        Purchase
      </button>

      {message && (
        <div className="mt-4 p-4 bg-green-100 text-green-800 rounded shadow text-center animate-fadeIn">
          {message}
        </div>
      )}
    </div>
  );
}
