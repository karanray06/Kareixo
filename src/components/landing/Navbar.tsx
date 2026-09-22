"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Star } from "lucide-react";
import { getGitHubStars } from "@/app/actions/github";

const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Security", href: "#security" },
  { label: "Pricing", href: "/pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    getGitHubStars().then(setStars).catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-canvas-dark border-b border-border-dark py-3"
            : "bg-transparent py-5 border-b border-transparent"
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-text-primary-dark font-semibold text-lg tracking-tight flex items-center gap-2.5 group"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Image
                src="/logo-dark.svg"
                alt="Kareixo Logo"
                width={30}
                height={30}
                className="rounded-lg object-contain transition-transform duration-300 group-hover:scale-110"
              />
              <span className="font-headline-hero">Kareixo</span>
            </Link>
            
            <a 
              href="https://github.com/elixpo"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-2 py-1 bg-surface-container/50 hover:bg-surface-container border border-border-default/50 rounded-md transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-signal shadow-[0_0_8px_rgba(26,194,148,0.8)]" />
              <span className="font-label-ui text-[10px] text-text-secondary-dark uppercase tracking-wider">Elixpo Ecosystem</span>
            </a>
          </div>

          {/* Center: Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-3.5 py-2 text-sm font-medium text-fg-muted hover:text-fg-default transition-colors duration-200 rounded-lg group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-signal rounded-full transition-all duration-300 group-hover:w-[60%]" />
              </Link>
            ))}
            <a
              href="https://github.com/karanray06/Kareixo"
              target="_blank"
              rel="noopener noreferrer"
              className="relative px-3.5 py-2 text-sm font-medium text-text-secondary-dark hover:text-text-primary-dark transition-colors duration-200 rounded-lg group flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
              GitHub
              {stars !== null && (
                <span className="flex items-center gap-1 ml-1 text-[11px] bg-surface-container-dark/50 px-1.5 py-0.5 rounded font-badge-mono text-text-secondary-dark border border-border-dark/50">
                  <Star size={10} className="fill-text-secondary-dark" />
                  {stars}
                </span>
              )}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-signal rounded-full transition-all duration-300 group-hover:w-[60%]" />
            </a>
          </div>

          {/* Right: CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-text-secondary-dark hover:text-text-primary-dark transition-colors px-3 py-2"
            >
              Sign in
            </Link>
            <a
              href="https://github.com/apps/kareixo-reviewer/installations/new"
              className="btn btn-signal inline-flex items-center gap-2 px-4 py-2"
            >
              <Plus size={16} />
              Get Started
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden relative w-8 h-8 flex items-center justify-center text-text-secondary-dark hover:text-text-primary-dark transition-colors"
            aria-label="Toggle menu"
          >
            <motion.span
              animate={mobileMenuOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
              className="absolute w-5 h-[1.5px] bg-current rounded-full"
              transition={{ duration: 0.2 }}
            />
            <motion.span
              animate={mobileMenuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              className="absolute w-5 h-[1.5px] bg-current rounded-full"
              transition={{ duration: 0.15 }}
            />
            <motion.span
              animate={mobileMenuOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }}
              className="absolute w-5 h-[1.5px] bg-current rounded-full"
              transition={{ duration: 0.2 }}
            />
          </button>
        </div>
      </motion.nav>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-canvas-default/95 backdrop-blur-xl pt-24 px-6 pb-8 flex flex-col md:hidden"
          >
            <motion.div
              className="flex flex-col gap-2"
              initial="closed"
              animate="open"
              variants={{
                open: { transition: { staggerChildren: 0.06 } },
                closed: {},
              }}
            >
              {NAV_LINKS.map((link) => (
                <motion.div
                  key={link.href}
                  variants={{
                    open: { opacity: 1, y: 0 },
                    closed: { opacity: 0, y: 16 },
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 text-xl font-medium text-text-primary-dark hover:text-accent-green-emphasis transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                variants={{
                  open: { opacity: 1, y: 0 },
                  closed: { opacity: 0, y: 16 },
                }}
              >
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 text-xl font-medium text-fg-default"
                >
                  Sign in
                </Link>
              </motion.div>
            </motion.div>

            <div className="mt-auto flex flex-col gap-3">
              <a
                href="https://github.com/apps/kareixo-reviewer/installations/new"
                className="btn btn-signal w-full text-center justify-center py-3 text-base"
              >
                <Plus size={18} />
                Install on GitHub
              </a>
              <a
                href="https://github.com/karanray06/Kareixo"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary w-full text-center justify-center py-3 text-base"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
                View on GitHub
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
