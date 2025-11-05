import React from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import Admin from "./pages/Admin";
import Cart from "./pages/Cart";
import Home from "./pages/Home";
import { authService } from "./services/auth";

export default function App() {
  const [user, setUser] = React.useState(authService.getUser());
  const nav = useNavigate();

  function logout() {
    authService.logout();
    setUser(null);
    nav("/");
  }

  React.useEffect(() => {
    setUser(authService.getUser());
  }, []);

  return (
    <div className="min-h-screen bg-[#F6F6F5] font-sans text-[#0B0B0A] flex flex-col">
      {/* HEADER */}

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
  );
}
