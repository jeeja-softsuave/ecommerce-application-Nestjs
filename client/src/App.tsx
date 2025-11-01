import React from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import Admin from "./pages/Admin";
import Cart from "./pages/Cart";
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-white shadow-lg z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4 md:p-6">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-2xl font-bold text-green-600 hover:text-green-700 transition-colors"
            >
              E-Shop
            </Link>
            <nav className="hidden md:flex gap-4">
              <Link
                to="/"
                className="px-3 py-2 rounded hover:bg-green-50 text-green-600 font-semibold transition"
              >
                Products
              </Link>
              <Link
                to="/cart"
                className="px-3 py-2 rounded hover:bg-green-50 text-green-600 font-semibold transition"
              >
                Cart
              </Link>
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="px-3 py-2 rounded hover:bg-green-50 text-green-600 font-semibold transition"
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-lg shadow hover:from-green-500 hover:to-green-600 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-lg shadow hover:from-blue-500 hover:to-blue-600 transition"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <span className="text-gray-700 font-medium hidden sm:inline">
                  {user.email} ({user.role})
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-28 max-w-7xl mx-auto px-4 md:px-6">
        <Routes>
          <Route path="/" element={<Products />} />
          <Route
            path="/login"
            element={<Login onLogin={() => setUser(authService.getUser())} />}
          />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </main>
    </div>
  );
}
