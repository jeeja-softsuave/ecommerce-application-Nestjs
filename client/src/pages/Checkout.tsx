import React, { useState, useEffect } from "react";
import API from "../services/api"; // ✅ same API instance used in Cart
import { authService } from "../services/auth"; // ✅ to check user login
import { useNavigate } from "react-router-dom";

interface CartItem {
  productId: number;
  name: string;
  qty: number;
  price: number;
  image?: string;
}

export default function Checkout() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    paymentMethod: "card",
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Load cart items from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("cart");
    if (raw) {
      setCartItems(JSON.parse(raw));
    }
  }, []);

  // ✅ Calculate totals
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.qty * (item.price || 0),
    0
  );
  const shipping = subtotal > 200 ? 0 : 20;
  const total = subtotal + shipping;

  // ✅ Handle input change
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // ✅ Handle form submission (place order)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!authService.getToken()) {
      alert("⚠️ Please login before placing an order.");
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      alert("🛒 Your cart is empty.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        customer: form,
        items: cartItems,
        total,
        paymentMethod: form.paymentMethod,
      };

      const res = await API.post("/orders", payload);
      alert(`✅ Order placed successfully! Order ID: ${res.data.orderId}`);

      // ✅ Clear cart
      localStorage.removeItem("cart");
      setCartItems([]);

      // ✅ Redirect to success or home
      navigate("/");
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }
  console.log("Cart Items:", cartItems);

  return (
    <div className="min-h-screen bg-[#F6F6F5] flex flex-col items-center py-12 px-4">
      <h1 className="text-3xl md:text-4xl font-bold text-[#0B0B0A] mb-8">
        Checkout
      </h1>

      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-6 md:p-10 flex flex-col md:flex-row gap-10">
        {/* LEFT - SHIPPING DETAILS */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-5">
          <h2 className="text-2xl font-semibold text-[#0B0B0A] mb-3">
            Shipping Details
          </h2>

          <input
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E58411]"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E58411]"
            required
          />
          <input
            name="address"
            placeholder="Street Address"
            value={form.address}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E58411]"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E58411]"
              required
            />
            <input
              name="postalCode"
              placeholder="Postal Code"
              value={form.postalCode}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E58411]"
              required
            />
          </div>

          <input
            name="country"
            placeholder="Country"
            value={form.country}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E58411]"
            required
          />

          {/* Payment Details */}
          {/* Payment Details */}
          <div className="bg-white rounded-2xl shadow-md p-6 mt-6 border">
            <h2 className="text-lg font-semibold text-gray-800">
              Payment Details
            </h2>

            <div className="space-y-4">
              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Card number
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  onChange={(e) => {
                    // Allow only digits and auto-insert spaces every 4 numbers
                    let value = e.target.value.replace(/\D/g, "");
                    value = value.replace(/(.{4})/g, "$1 ").trim();
                    e.target.value = value;
                  }}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E58411]"
                />
              </div>

              {/* Expiration and CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Expiration date (MM/YY)
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    onChange={(e) => {
                      // Allow only digits and auto-insert slash after 2 numbers
                      let value = e.target.value.replace(/\D/g, "");
                      if (value.length >= 3)
                        value = value.slice(0, 2) + "/" + value.slice(2, 4);
                      e.target.value = value;
                    }}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E58411]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Security code
                  </label>
                  <input
                    type="password"
                    placeholder="CVV"
                    maxLength={3}
                    onChange={(e) => {
                      // Only digits allowed
                      e.target.value = e.target.value.replace(/\D/g, "");
                    }}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E58411]"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              loading ? "bg-gray-400" : "bg-[#E58411] hover:bg-[#c96f0e]"
            } text-white text-lg font-semibold py-3 rounded-lg mt-6 transition-all`}
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </form>

        {/* RIGHT - ORDER SUMMARY */}
        <div className="w-full md:w-[350px] bg-[#F9F9F9] rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

          {cartItems.length === 0 ? (
            <p className="text-gray-500 text-sm">Your cart is empty 🛋️</p>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div
                    key={item.productId}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-20 rounded-lg object-contain border"
                        />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg text-xl">
                          🪑
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                      </div>
                    </div>
                    <p className="font-semibold">
                      ${item.price ? (item.price * item.qty).toFixed(2) : "-"}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-300 pt-4 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
