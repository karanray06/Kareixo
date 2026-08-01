"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiGithub } from "react-icons/fi";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled || menuOpen ? 'bg-[var(--bg-base)] border-b border-[var(--color-outline)] py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-[var(--text-primary)] font-bold text-xl tracking-tight flex items-center gap-2" onClick={() => setMenuOpen(false)}>
              {/* Logo Blob icon could go here */}
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[var(--color-mint)] to-[var(--color-pale-yellow)] border-2 border-[var(--color-outline)]" />
              Kareixo
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-[var(--text-primary)] flex items-center gap-2 font-medium hover:text-[var(--text-secondary)] transition-colors"
            >
              <span className="hidden sm:inline">Menu</span>
              {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Full-screen overlay menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[var(--bg-base)] flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-8 text-3xl font-bold">
            <Link href="/" onClick={() => setMenuOpen(false)} className="text-[var(--text-primary)] hover:text-[var(--text-secondary)] transition-colors">
              Home
            </Link>
            <Link href="#how-it-works" onClick={() => setMenuOpen(false)} className="text-[var(--text-primary)] hover:text-[var(--text-secondary)] transition-colors">
              How it works
            </Link>
            <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="text-[var(--text-primary)] hover:text-[var(--text-secondary)] transition-colors">
              Install
            </Link>
            <a href="https://github.com/karanray06/Kareixo" target="_blank" rel="noopener noreferrer" className="text-[var(--text-primary)] hover:text-[var(--text-secondary)] transition-colors flex items-center gap-2">
              <FiGithub /> GitHub
            </a>
          </div>
        </div>
      )}
    </>
  );
}
