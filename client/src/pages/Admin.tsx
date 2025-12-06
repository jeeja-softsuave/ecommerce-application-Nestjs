import React from "react";
import API from "../services/api";
import { authService } from "../services/auth";

export default function Admin() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [price, setPrice] = React.useState(0);
  const [inventory, setInventory] = React.useState(0);
  const [image, setImage] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<any>(null);

  const token = authService.getToken();
  const user = authService.getUser();
  const categories = ["Chair", "Beds", "Sofa", "Lamp"];

  // Access control
  if (!token || user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F9F5F2]">
        <h1 className="text-3xl font-bold text-[#E58411] mb-3">
          Access Denied 🚫
        </h1>
        <p className="text-[#2C2C2C] text-lg">
          Only <strong>admins</strong> can access this page.
        </p>
      </div>
    );
  }

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

  // Prefill form for editing
  function startEdit(product: any) {
    setEditingProduct(product);
    setTitle(product.title);
    setDescription(product.description);
    setCategory(product.category);
    setPrice(product.price);
    setInventory(product.inventory);
    setImage(null);
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();

    if (price <= 0 || inventory < 0) {
      alert("Price must be greater than 0 and inventory cannot be negative.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("price", (price ?? 0).toString());
      formData.append("inventory", (inventory ?? 0).toString());

      if (image) formData.append("image", image);

      if (editingProduct) {
        // Edit mode
        await API.put(`/products/${editingProduct.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setEditingProduct(null);
      } else {
        // Create mode
        await API.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setPrice(0);
      setInventory(0);
      setImage(null);
      fetchProducts();
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message);
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this product?")) return;
    try {
      await API.delete(`/products/${id}`);
      fetchProducts();
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message);
    }
  }

  // Handle drag-and-drop image upload
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
    } else {
      alert("Please drop a valid image file.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F6F5] py-10 px-6 font-[Montserrat]">
      <h2 className="text-3xl font-bold text-center mb-10">Admin Panel</h2>

      <div className="flex flex-col md:flex-row gap-10 justify-center items-start max-w-7xl mx-auto">
        {/* Create / Edit Product Section */}
        <section className="bg-white w-full md:w-2/3 p-6 rounded-2xl shadow-md border border-[#E8E2DC]">
          <h3 className="text-2xl font-semibold mb-5 text-[#2C2C2C]">
            {editingProduct ? "Edit Product" : "Create a New Product"}
          </h3>

          <form onSubmit={saveProduct} className="grid gap-4">
            {/* Title */}
            <input
              placeholder="Product title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-[#E8E2DC] rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#E58411]"
            />

            {/* Description */}
            <textarea
              placeholder="Product description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-[#E8E2DC] rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#E58411]"
            />

            {/* Category */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-[#7A7A7A] mb-1">
                Product Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border border-[#E8E2DC] rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-[#E58411]"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price & Inventory */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-[#7A7A7A] mb-1">
                  Product Price
                </label>
                <input
                  type="number"
                  placeholder="Price"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="border border-[#E8E2DC] rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#E58411]"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-[#7A7A7A] mb-1">
                  Product Inventory
                </label>
                <input
                  type="number"
                  placeholder="Inventory"
                  value={inventory}
                  onChange={(e) => setInventory(Number(e.target.value))}
                  className="border border-[#E8E2DC] rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#E58411]"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-[#7A7A7A] mb-1">
                Product Image
              </label>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                  isDragging
                    ? "border-[#E58411] bg-orange-50"
                    : "border-[#E8E2DC] bg-white"
                }`}
                onClick={() => document.getElementById("fileInput")?.click()}
              >
                {image ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg mb-2 border"
                    />
                    <p className="text-[#7A7A7A] text-sm">
                      Click or drag new image to replace
                    </p>
                  </div>
                ) : editingProduct?.image ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={`http://localhost:4000/uploads/${editingProduct.image}`}
                      alt="Existing"
                      className="w-32 h-32 object-cover rounded-lg mb-2 border"
                    />
                    <p className="text-[#7A7A7A] text-sm">
                      Click or drag new image to replace
                    </p>
                  </div>
                ) : (
                  <p className="text-[#7A7A7A]">
                    {isDragging
                      ? "Drop the image here..."
                      : "Drag & drop product image here, or click to upload"}
                  </p>
                )}
              </div>

              <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="hidden"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-[#E58411] hover:bg-black text-white hover:text-[#E58411] font-semibold py-2 px-4 rounded-xl transition"
              >
                {editingProduct ? "Update Product" : "Create Product"}
              </button>

              {editingProduct && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setTitle("");
                    setDescription("");
                    setCategory("");
                    setPrice(0);
                    setInventory(0);
                    setImage(null);
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded-xl transition"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Product List Section */}
        <section className="bg-white w-full md:w-1/2 p-6 rounded-2xl shadow-md border border-[#E8E2DC]">
          <h3 className="text-2xl font-semibold mb-5 text-[#2C2C2C]">
            Product List
          </h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8E2DC] text-[#7A7A7A]">
                <th className="py-2">Title</th>
                <th>Category</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-[#F0EBE5] hover:bg-[#FFF5EE] transition "
                >
                  <td className="py-2 text-[#2C2C2C]">{product.title}</td>
                  <td className="text-[#7A7A7A]">{product.category}</td>
                  <td className="font-semibold text-[#E58411]">
                    ${product.price}
                  </td>
                  <td className="flex gap-2 text-center justify-start">
                    <button
                      onClick={() => startEdit(product)}
                      className="text-blue-500 hover:text-blue-700 font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(product.id)}
                      className="text-red-500 hover:text-red-700 font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
