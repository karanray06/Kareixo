"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiGithub } from "react-icons/fi";

export default function HeroScene() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate materializing shapes
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-[80vh] flex flex-col items-center justify-center overflow-hidden bg-[var(--bg-base)]">
      {/* Background Shapes */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {/* Mint to Pale Yellow Squiggle */}
        <div className="absolute top-[20%] left-[20%] w-[200px] h-[50px] rounded-full bg-gradient-to-r from-[var(--color-mint)] to-[var(--color-pale-yellow)] border-[4px] border-[var(--color-outline)] animate-float opacity-80" style={{ animationDelay: '0s' }}></div>
        
        {/* Mint to Lavender Dot */}
        <div className="absolute top-[15%] left-[50%] w-[40px] h-[40px] rounded-full bg-gradient-to-r from-[var(--color-mint)] to-[var(--color-lavender)] border-[4px] border-[var(--color-outline)] animate-float opacity-80" style={{ animationDelay: '1s' }}></div>
        
        {/* Pale Yellow to Coral Ring (approximate) */}
        <div className="absolute top-[30%] right-[20%] w-[150px] h-[150px] rounded-full border-[30px] border-[var(--color-outline)] border-t-[var(--color-pale-yellow)] border-r-[var(--color-coral)] border-b-[var(--color-coral)] border-l-[var(--color-pale-yellow)] animate-float opacity-80" style={{ animationDelay: '2s' }}></div>
        
        {/* Coral to Lavender Ring */}
        <div className="absolute bottom-[20%] left-[25%] w-[120px] h-[120px] rounded-full border-[25px] border-[var(--color-outline)] bg-gradient-to-br from-[var(--color-coral)] to-[var(--color-lavender)] animate-float opacity-80" style={{ animationDelay: '1.5s', clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 80%)' }}></div>
        
        {/* Mint to Sky-Blue Ring */}
        <div className="absolute bottom-[10%] right-[30%] w-[180px] h-[180px] rounded-full border-[30px] border-[var(--color-outline)] border-l-[var(--color-mint)] border-b-[var(--color-sky-blue)] border-r-[var(--color-sky-blue)] border-t-transparent animate-float opacity-80" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-8 flex flex-col items-center">
        {loading ? (
          <div className="text-[var(--text-secondary)] font-mono tracking-widest uppercase animate-pulse">
            Materializing shapes...
          </div>
        ) : (
          <>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 animate-fade-in-up">
              Ship better code.<br />
              <span className="text-[var(--text-muted)]">Automatically.</span>
            </h1>
            <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Kareixo reviews your pull requests with AI, catches issues before they reach production, and gives your team actionable feedback directly in GitHub.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <a
                href="https://github.com/apps/kareixo-reviewer/installations/new"
                className="btn btn-primary h-12 px-8 text-base w-full sm:w-auto shadow-lg shadow-black/5"
              >
                <FiGithub size={18} />
                Install on GitHub
              </a>
              <a
                href="#how-it-works"
                className="btn btn-secondary h-12 px-8 text-base w-full sm:w-auto"
              >
                Explore how it works
              </a>
            </div>
            <p className="text-sm text-[var(--text-muted)] font-medium animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              Free forever &middot; No configuration &middot; GitHub-native
            </p>
          </>
        )}
      </div>
    </section>
  );
}
