import { Search } from "lucide-react";


export default function Home() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-between bg-cover bg-center bg-no-repeat font-[Poppins]"
      style={{ backgroundImage: "url('/asserts/image.png')" }}
    >

      {/* NAVBAR */}
      <nav className="relative z-10 w-full flex justify-between items-center px-10 py-6 text-white">
        <h1 className="text-2xl font-semibold">Panto</h1>
        <ul className="flex items-center gap-10 text-white/90 font-medium">
          <li className="hover:text-white cursor-pointer">Furniture</li>
          <li className="hover:text-white cursor-pointer">Shop</li>
          <li className="hover:text-white cursor-pointer">About Us</li>
          <li className="hover:text-white cursor-pointer">Contact</li>
        </ul>
        <div className="relative">
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
            0
          </span>
        </div>
      </nav>

      {/* HERO CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center text-white px-6">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight max-w-3xl">
          Make Your Interior More <br /> Minimalistic & Modern
        </h1>

        <p className="text-white/80 text-lg mt-4 max-w-xl leading-relaxed">
          Turn your room with Panto into a lot more minimalist and modern with
          ease and speed.
        </p>

        {/* Search Bar */}
        <div className="mt-8 flex items-center bg-white/10 rounded-full overflow-hidden border border-white/30 backdrop-blur-sm w-[90%] md:w-[500px]">
          <input
            type="text"
            placeholder="Search furniture"
            className="flex-grow px-6 py-3 bg-transparent text-white placeholder-white/70 focus:outline-none"
          />
          <button className="bg-[#E58411] p-3 rounded-full mr-2 hover:scale-105 transition-transform duration-200">
            <Search className="text-white w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Padding */}
      <div className="h-16"></div>
    </section>
  );
}
