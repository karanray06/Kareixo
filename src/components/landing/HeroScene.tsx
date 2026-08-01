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
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[var(--text-primary)] animate-fade-in-up">
              Free AI code review for every pull request
            </h1>
            <p className="text-[var(--text-secondary)] text-xl max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Install the GitHub App once, and get instant, intelligent code reviews powered by a resilient multi-model router.
            </p>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--text-primary)] text-[var(--bg-base)] rounded-full font-semibold text-lg hover:scale-105 transition-transform"
              >
                <FiGithub className="w-5 h-5" />
                Install on GitHub
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
