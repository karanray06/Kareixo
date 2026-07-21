"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 py-4 shadow-lg' : 'bg-transparent py-6'}`}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="relative inline-block pb-1 group">
            <span className="text-white/80 text-sm font-medium tracking-widest uppercase group-hover:text-white transition-colors">Kareixo</span>
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/20 rounded-full group-hover:bg-coral-500 transition-colors"></div>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Features</a>
          <a href="#" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Pricing</a>
          <a href="#" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Docs</a>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/signup" className="px-5 py-2 bg-[#ff5005] hover:bg-[#e64604] text-white font-medium text-sm rounded-full transition-all flex items-center gap-2">
            Get Started <FiArrowRight />
          </Link>
        </div>
      </div>
    </nav>
  );
}
