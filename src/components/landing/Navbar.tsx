"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { FiGithub } from "react-icons/fi";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ${
          scrolled ? "glass-nav shadow-sm py-3" : "bg-transparent py-5 border-b border-transparent"
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-[var(--text-primary)] font-semibold text-lg tracking-tight flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {/* Kareixo Logo */}
              <img src="/logo.png" alt="Kareixo Logo" className="w-7 h-7 rounded-md object-contain" />
              Kareixo
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--text-secondary)]">
              <Link href="#product" className="hover:text-[var(--text-primary)] transition-colors">
                Product
              </Link>
              <Link href="#how-it-works" className="hover:text-[var(--text-primary)] transition-colors">
                How it works
              </Link>
              <Link href="#security" className="hover:text-[var(--text-primary)] transition-colors">
                Security
              </Link>
              <a
                href="https://github.com/karanray06/Kareixo"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
              >
                GitHub
              </a>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Sign in
            </Link>
            <a
              href="https://github.com/apps/kareixo-reviewer/installations/new"
              className="btn btn-primary text-sm"
            >
              Install on GitHub
            </a>
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[var(--bg-base)] pt-24 px-6 pb-6 flex flex-col md:hidden">
          <div className="flex flex-col gap-6 text-lg font-medium text-[var(--text-primary)]">
            <Link href="#product" onClick={() => setMobileMenuOpen(false)}>Product</Link>
            <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How it works</Link>
            <Link href="#security" onClick={() => setMobileMenuOpen(false)}>Security</Link>
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>Sign in</Link>
            <div className="pt-4 border-t border-[var(--border-base)] flex flex-col gap-4">
              <a
                href="https://github.com/apps/kareixo-reviewer/installations/new"
                className="btn btn-primary w-full"
              >
                Install on GitHub
              </a>
              <a
                href="https://github.com/karanray06/Kareixo"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary w-full"
              >
                <FiGithub size={16} /> View on GitHub
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
