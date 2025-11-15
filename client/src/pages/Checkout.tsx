import React, { useState, useEffect } from "react";
import API from "../services/api";
import { authService } from "../services/auth";
import { useNavigate } from "react-router-dom";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

interface CartItem {
  productId: number;
  name: string;
  qty: number;
  price: number;
  image?: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("cart");
    if (raw) setCartItems(JSON.parse(raw));
  }, []);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.qty * (item.price || 0),
    0
  );
  const shipping = subtotal > 200 ? 0 : 20;
  const total = subtotal + shipping;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // ============================
  //       HANDLE PAYMENT
  // ============================
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    if (!authService.getToken()) {
      alert("Please login to continue");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Create PaymentIntent on backend
      const res = await API.post("/payments/create-payment-intent", {
        amount: total,
      });

      const clientSecret = res.data.clientSecret;

      // 2️⃣ Confirm card payment
      const card = elements.getElement(CardElement);
      if (!card) {
        alert("Payment failed: card not loaded.");
        setLoading(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: card, // now guaranteed not null
            billing_details: {
              name: form.fullName,
              email: form.email,
            },
          },
        }
      );

      if (error) {
        alert(error.message);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        alert("Payment successful! 🎉");

        // 3️⃣ Create order in your system
        await API.post("/orders", {
          items: cartItems,
          customer: form,
          total,
          paymentIntentId: paymentIntent.id,
        });

        localStorage.removeItem("cart");
        navigate("/");
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

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

          {/* Stripe Secure Card Field */}
          <div className="border rounded-xl p-4 mt-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-3">Card Details</h3>

            <div className="border rounded-md p-3 mt-1">
              <CardElement
                options={{
                  style: { base: { fontSize: "16px", color: "#000" } },
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !stripe}
            className="w-full bg-[#E58411] text-white text-lg font-semibold py-3 rounded-lg mt-6"
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
