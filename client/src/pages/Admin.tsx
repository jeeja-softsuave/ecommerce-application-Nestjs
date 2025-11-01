import React from "react";
import API from "../services/api";
import { authService } from "../services/auth";

export default function Admin() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [price, setPrice] = React.useState(0);
  const [inventory, setInventory] = React.useState(0);

  const token = authService.getToken();
  const user = authService.getUser(); // ✅ get user info (with role)

  // 🚫 Restrict access if not admin
  if (!token || user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Access Denied 🚫
        </h1>
        <p className="text-gray-700 text-lg">
          You must be an <strong>admin</strong> to access this page.
        </p>
      </div>
    );
  }

  // ✅ Fetch all products
  React.useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await API.get("/products");
      setProducts(res.data);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      alert("Failed to load products");
    }
  }

  // ✅ Create new product (admin only)
  async function create(e: React.FormEvent) {
    e.preventDefault();

    if (price <= 0 || inventory < 0) {
      alert("Price must be greater than 0 and inventory cannot be negative.");
      return;
    }

    try {
      await API.post("/products", { title, description, price, inventory });
      setTitle("");
      setDescription("");
      setPrice(0);
      setInventory(0);
      fetchProducts();
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message);
    }
  }

  // ✅ Delete product (admin only)
  async function remove(id: number) {
    if (!confirm("Delete this product?")) return;
    try {
      await API.delete(`/products/${id}`);
      fetchProducts();
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        Admin Panel
      </h2>

      {/* Create Product Section */}
      <section className="bg-white p-6 rounded shadow mb-8">
        <h3 className="text-2xl font-semibold mb-4 text-gray-700">
          Create a New Product
        </h3>
        <form onSubmit={create} className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Title
            </label>
            <input
              placeholder="Product title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Description
            </label>
            <textarea
              placeholder="Product description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Price (₹)
            </label>
            <input
              type="number"
              placeholder="Enter price"
              min="1"
              value={price}
              onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Inventory
            </label>
            <input
              type="number"
              placeholder="Number of items in stock"
              min="0"
              value={inventory}
              onChange={(e) => setInventory(Math.max(0, Number(e.target.value)))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors font-semibold"
          >
            Create Product
          </button>
        </form>
      </section>

      {/* Product List Section */}
      <section>
        <h3 className="text-2xl font-semibold mb-4 text-gray-700">
          All Products
        </h3>
        {products.length === 0 ? (
          <p className="text-gray-500 italic">
            No products found. Add one above!
          </p>
        ) : (
          <ul className="space-y-4">
            {products.map((p) => (
              <li key={p.id} className="bg-white p-4 rounded shadow space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-gray-800 text-lg">
                      {p.title}
                    </span>{" "}
                    <span className="text-gray-600">
                      – ₹{p.price} – {p.inventory} in stock
                    </span>
                  </div>
                  <button
                    onClick={() => remove(p.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
                {p.description && (
                  <p className="text-gray-600 text-sm border-t pt-2">
                    {p.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
