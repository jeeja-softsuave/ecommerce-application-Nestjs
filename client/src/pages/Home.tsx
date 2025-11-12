import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import React from "react";

export default function Home() {
  const [cartCount, setCartCount] = React.useState(0);

  React.useEffect(() => {
    // Load cart count on mount
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

    // Listen for cart updates from other pages
    window.addEventListener("storage", updateCartCount);
    return () => window.removeEventListener("storage", updateCartCount);
  }, []);

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-between bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/asserts/Home.png')" }}
    >
      {/* NAVBAR */}
      <nav className="relative z-10 w-full flex justify-between items-center px-10 py-6 text-white">
        {/* LEFT: Logo */}
        <h1 className="text-2xl font-semibold">
          <Link to="/">Panto</Link>
        </h1>

        {/* CENTER: Nav Links */}
        <ul className="flex items-center gap-10 text-white/90 font-medium">
          <li>
            <Link to="/products" className="hover:text-white">
              Furniture
            </Link>
          </li>
          <li>
            <Link to="/products" className="hover:text-white">
              Shop
            </Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-white">
              About Us
            </Link>
          </li>
          <li>
            <Link to="/contact" className="hover:text-white">
              Contact
            </Link>
          </li>
        </ul>

        {/* RIGHT: Auth + Cart */}
        <div className="flex items-center gap-6 text-[#E58411] ">
          <Link to="/login" className="hover:text-white">
            Login
          </Link>
          <Link to="/register" className="hover:text-white">
            Register
          </Link>

          {/* CART ICON */}
          <Link to="/cart" className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-white cursor-pointer hover:text-[#E58411] transition-colors"
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
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#E58411] text-white text-xs font-bold rounded-full px-1.5 py-0.5">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* HERO CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center text-white px-6">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight max-w-3xl">
          Make Your Interior More <br /> Minimalistic & Modern
        </h1>

        <p className="text-white/80 text-lg mt-4 max-w-xl leading-relaxed font-[Montserrat]">
          Turn your room with Panto into a lot more minimalist and modern with
          ease and speed.
        </p>

        {/* Search Bar */}
        <div className="mt-8 flex items-center bg-white/30 rounded-full overflow-hidden border border-white/30 backdrop-blur-sm w-[90%] md:w-[500px]">
          <input
            type="text"
            placeholder="Search furniture"
            className="flex-grow px-6 py-3 bg-transparent text-[#5F4130] placeholder-[#25272B] focus:outline-none font-bold text-lg"
          />
          <button className="bg-[#E58411] p-3 rounded-full mr-2 hover:scale-105 transition-transform duration-200">
            <Search className="text-white w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="h-16"></div>
    </section>
  );
}
