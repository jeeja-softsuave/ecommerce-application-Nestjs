import React from "react";
import API from "../services/api";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  inventory: number;
}

interface CartItem {
  productId: number;
  name: string;
  qty: number;
}

export default function Products() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [q, setQ] = React.useState("");
  const [message, setMessage] = React.useState("");

  async function fetchProducts() {
    const res = await API.get("/products", { params: { q } });
    setProducts(res.data);
  }

  React.useEffect(() => {
    fetchProducts();
  }, []);

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    fetchProducts();
  }

  function addToCart(product: Product) {
    const raw = localStorage.getItem("cart");
    const cart: CartItem[] = raw ? JSON.parse(raw) : [];
    const found = cart.find((c) => c.productId === product.id);
    let newCart: CartItem[];

    if (found) {
      newCart = cart.map((c) =>
        c.productId === product.id ? { ...c, qty: c.qty + 1 } : c
      );
    } else {
      newCart = [
        ...cart,
        { productId: product.id, name: product.title, qty: 1 },
      ];
    }

    localStorage.setItem("cart", JSON.stringify(newCart));

    // Show toast notification
    setMessage(`${product.title} added to cart`);
    setTimeout(() => setMessage(""), 3000);
  }

  return (
    <div className="min-h-screen bg-[#F6F6F5] px-6 md:px-10 pt-28 pb-16 font-sans text-[#0B0B0A] relative">
      {/* Title */}
      <h2 className="text-4xl font-extrabold text-center mb-8 tracking-tight">
        Our <span className="text-[#986439]">Collection</span>
      </h2>

      {/* Search bar */}
      <form
        onSubmit={search}
        className="max-w-lg mx-auto mb-10 flex gap-3 bg-white rounded-full shadow-sm px-4 py-2"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search furniture..."
          className="flex-1 bg-transparent focus:outline-none text-[#5F4130]"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-[#986439] text-white rounded-full hover:bg-[#5F4130] transition"
        >
          Search
        </button>
      </form>

      {/* Products Grid */}
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
          >
            <div className="h-56 bg-[#F6F6F5] flex items-center justify-center">
              <img
                src="/asserts/cover.jpg"
                alt={p.title}
                className="w-48 h-48 object-contain"
              />
            </div>

            <div className="p-6 flex flex-col justify-between flex-grow">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-[#0B0B0A]">
                  {p.title}
                </h3>
                <p className="text-[#5F4130] text-sm mb-3 line-clamp-2">
                  {p.description}
                </p>
                <div className="text-lg font-bold text-[#986439] mb-2">
                  ₹{p.price}
                </div>
                <div className="text-sm text-[#A4A09C]">
                  In stock: {p.inventory}
                </div>
              </div>

              <button
                onClick={() => addToCart(p)}
                className="mt-5 w-full py-3 bg-[#986439] text-white rounded-full font-semibold hover:bg-[#5F4130] transition"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center text-[#A4A09C] mt-20 text-lg">
          No products found. Try searching for something else.
        </div>
      )}

      {/* Toast Notification */}
      {message && (
        <div
          className="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-[#986439] text-white px-6 py-3 rounded-full shadow-lg 
          animate-fade-in-up text-sm font-medium"
        >
          {message}
        </div>
      )}

      {/* Toast Animation */}
      <style>
        {`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(20px); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 3s ease-in-out forwards;
        }
        `}
      </style>
    </div>
  );
}
