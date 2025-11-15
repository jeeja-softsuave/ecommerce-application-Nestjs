import React, { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

export default function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!stripe || !elements) {
      setMessage("Stripe not loaded yet...");
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setMessage("Card element not found");
      return;
    }

    setLoading(true);

    // 1️⃣ Create PaymentIntent on backend
    const res = await fetch("http://localhost:4000/payments/create-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: 1000 }), // ₹1000
    });

    const { clientSecret } = await res.json();

    // 2️⃣ Confirm Payment on frontend
    const confirm = await stripe.confirmCardPayment(clientSecret!, {
      payment_method: {
        card: cardElement,
      },
    });

    if (confirm.error) {
      setMessage(confirm.error.message || "Payment failed");
      setLoading(false);
      return;
    }

    if (confirm.paymentIntent?.status === "succeeded") {
      setMessage("Payment Successful 🎉");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-md mx-auto">
      <CardElement className="p-3 border rounded-md bg-white" />

      <button
        type="submit"
        disabled={!stripe || loading}
        className="bg-black text-white px-4 py-2 rounded w-full"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>

      {message && <p className="text-center mt-2">{message}</p>}
    </form>
  );
}
