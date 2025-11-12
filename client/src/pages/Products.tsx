import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, Plus } from "lucide-react";
import API from "../services/api";

interface Product {
  id: number;
  title: string;
  description?: string;
  category?: string;
  price: number;
  inventory?: number;
  image?: string;
}

interface CartItem {
  productId: number;
  name: string;
  price: number;
  qty: number;
  image: string;
}

const categories = ["Chair", "Beds", "Sofa", "Lamp"];

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("Chair");
  const [message, setMessage] = useState("");

  // Fetch products from backend
  async function fetchProducts() {
    try {
      const res = await API.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  // Add to cart logic
  function addToCart(product: Product) {
    const raw = localStorage.getItem("cart");
    const cart: CartItem[] = raw ? JSON.parse(raw) : [];
    const found = cart.find((cart) => cart.productId === product.id);
    let newCart: CartItem[];

    if (found) {
      newCart = cart.map((item) =>
        item.productId === product.id ? { ...item, qty: item.qty + 1 } : item
      );
    } else {
      newCart = [
        ...cart,
        {
          productId: product.id,
          name: product.title,
          price: product.price,
          qty: 1,
          image: product.image
            ? `http://localhost:4000${product.image}`
            : "/asserts/cover.jpg",
        },
      ];
    }

    localStorage.setItem("cart", JSON.stringify(newCart));

    setMessage(`${product.title} added to cart`);
    setTimeout(() => setMessage(""), 3000);
  }

  // Filter products by category
  const filteredProducts = products.filter(
    (p) => p.category?.toLowerCase() === activeCategory.toLowerCase()
  );

  console.log("product", products);

  return (
    <section className="py-20 bg-[#F6F6F5] min-h-screen relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1E1E1E] mb-10">
          Best Selling Product
        </h2>

        {/* Categories */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full border transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-[#E58411] text-white border-[#E58411]"
                  : "border-gray-300 text-gray-600 hover:border-[#E58411] hover:text-[#E58411]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="relative">
          <button className="absolute -left-12 top-2/3 -translate-y-1/2 bg-white shadow-md w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#E58411] hover:text-white transition">
            <ChevronLeft size={20} />
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 w-full max-w-[280px] overflow-hidden"
                >
                  <div className="flex justify-center bg-[#F9F9F9] p-8">
                    <img
                      src={
                        product.image
                          ? `http://localhost:4000${product.image}`
                          : "/asserts/cover.jpg"
                      }
                      alt={product.title}
                      className="w-60 h-50 object-contain"
                    />
                  </div>

                  <div className="p-5">
                    <p className="text-gray-400 text-sm">{product.category}</p>
                    <h3 className="text-lg font-semibold text-[#1E1E1E] mt-1">
                      {product.title}
                    </h3>

                    <div className="flex items-center mt-2 text-[#E58411]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill="#E58411" />
                      ))}
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <span className="text-lg font-bold text-[#1E1E1E]">
                        ₹{product.price}
                      </span>
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-[#1E1E1E] text-white p-2 rounded-full hover:bg-[#E58411] transition"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 text-lg mt-6">
                No products found in this category.
              </div>
            )}
          </div>

          <button className="absolute -right-12 top-2/3 -translate-y-1/2 bg-white shadow-md w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#E58411] hover:text-white transition">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* View All */}
        <div className="text-center mt-10">
          <button className="text-[#E58411] font-semibold flex items-center justify-center gap-2 hover:underline mx-auto">
            View All →
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {message && (
        <div
          className="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-[#E58411] text-white px-6 py-3 rounded-full shadow-lg 
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
    </section>
  );
}
