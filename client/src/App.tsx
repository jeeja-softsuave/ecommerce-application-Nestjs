import React from "react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import Admin from "./pages/Admin";
import Cart from "./pages/Cart";
import Home from "./pages/Home";
import Checkout from "./pages/Checkout";
import { authService } from "./services/auth";

// ⭐ Stripe imports
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// ⭐ Stripe Publishable Key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function App() {
  const [user, setUser] = React.useState(authService.getUser());
  const nav = useNavigate();
  const location = useLocation();

  function logout() {
    authService.logout();
    setUser(null);
    nav("/");
  }

  React.useEffect(() => {
    setUser(authService.getUser());
  }, []);

  const hideNavbar = location.pathname === "/";
  const [cartCount, setCartCount] = React.useState(0);

  React.useEffect(() => {
    const updateCartCount = () => {
      const raw = localStorage.getItem("cart");
      const cart = raw ? JSON.parse(raw) : [];
      const total = cart.reduce(
        (sum: number, item: { qty: number }) => sum + item.qty,
        0
      );
      setCartCount(total);
    };

    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    return () => window.removeEventListener("storage", updateCartCount);
  }, []);

  return (
    // ⭐ Wrap everything with Stripe Elements
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-current text-[#0B0B0A] flex flex-col">
        {/* HEADER (hidden on Home) */}
        {!hideNavbar && (
          <nav className="relative z-10 w-full flex justify-between items-center px-10 py-6 text-white">
            <h1 className="text-2xl font-semibold">
              <Link to="/">Panto</Link>
            </h1>

            <ul className="flex items-center gap-10 text-white/90 font-medium">
              <li>
                <Link to="/products" className="hover:text-white cursor-pointer">
                  Furniture
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white cursor-pointer">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white cursor-pointer">
                  Admin
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white cursor-pointer">
                  Contact
                </Link>
              </li>
            </ul>

            {/* CART ICON */}
            <Link to="/cart" className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-white cursor-pointer"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13a4 4 0 108 0M9 21a2 2 0 11-4 0m10 0a2 2 0 11-4 0"
                />
              </svg>
              <span className="absolute -top-2 -right-2 bg-[#E58411] text-white text-xs font-bold rounded-full px-1.5 py-0.5">
                {cartCount}
              </span>
            </Link>
          </nav>
        )}

        {/* PAGE ROUTES */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/admin" element={<Admin />} />
            <Route
              path="/login"
              element={<Login onLogin={() => setUser(authService.getUser())} />}
            />
            <Route path="/register" element={<Register />} />
            <Route path="/checkout" element={<Checkout />} /> {/* <-- Stripe works here */}
          </Routes>
        </main>

        {/* FOOTER */}
        <footer className="bg-white border-t mt-auto py-10 text-center text-[#5F4130]">
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold">Panto</span>. All rights reserved.
          </p>
        </footer>
      </div>
    </Elements>
  );
}
