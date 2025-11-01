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

  // Fetch products from API
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

  // Add product to cart
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
      newCart = [...cart, { productId: product.id, name: product.title, qty: 1 }];
    }

    localStorage.setItem("cart", JSON.stringify(newCart));

    setMessage(`✅ "${product.title}" added to cart`);
    setTimeout(() => setMessage(""), 2000);
  }

  return (
    <div className="p-5 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Products</h2>

      {/* Search */}
      <form onSubmit={search} className="mb-6 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Success message */}
      {message && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded shadow text-center">
          {message}
        </div>
      )}

      {/* Products Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <div key={p.id} className="border rounded-md p-4 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">{p.title}</h3>
              <p className="text-gray-600 mb-2">{p.description}</p>
              <div className="font-bold mb-1">₹{p.price}</div>
              <div className="text-sm text-gray-500 mb-2">Inventory: {p.inventory}</div>
            </div>
            <button
              onClick={() => addToCart(p)}
              className="mt-auto px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Add to cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
