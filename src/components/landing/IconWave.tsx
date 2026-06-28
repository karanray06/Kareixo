"use client";

import { useEffect, useRef, useState } from "react";

// Lucide-inspired minimal SVG icons matching the Antigravity style
const ICONS = [
  // Terminal
  <svg key="1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>,
  // Git Branch
  <svg key="2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="6" y1="3" x2="6" y2="15" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M18 9a9 9 0 0 1-9 9" />
  </svg>,
  // Enter/Return
  <svg key="3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="9 10 4 15 9 20" />
    <path d="M20 4v7a4 4 0 0 1-4 4H4" />
  </svg>,
  // Commit/Line
  <svg key="4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="3" />
    <line x1="12" y1="3" x2="12" y2="9" />
    <line x1="12" y1="15" x2="12" y2="21" />
  </svg>,
  // Sparkles
  <svg key="5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 3c.132 5.426 1.92 7.74 6.843 8.35-4.83.69-6.666 3.09-6.843 8.65-.177-5.56-2.013-7.96-6.843-8.65 4.923-.61 6.711-2.924 6.843-8.35z" />
  </svg>,
  // Command key
  <svg key="6" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
  </svg>,
  // Star/Magic
  <svg key="7" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6L12 17.2 5.8 21.7l2.4-7.6L2 9.6h7.6L12 2z" />
  </svg>,
  // Code Brackets
  <svg key="8" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>,
  // Box/Package
  <svg key="9" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>,
  // Check Circle
  <svg key="10" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>,
];

// Duplicate the array to allow for infinite scrolling effect if needed,
// though a pure wave just needs a long enough array
const WAVE_ICONS = [...ICONS, ...ICONS, ...ICONS]; 

export function IconWave() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initialize
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[300px] overflow-hidden flex items-center justify-center my-12"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <div className="flex gap-4 md:gap-8 items-center px-[20vw] flex-nowrap w-max">
        {WAVE_ICONS.map((icon, index) => {
          // Calculate the sine wave position
          // Offset based on index, modulated by scroll position
          const wavePhase = (index * 0.4) + (scrollY * -0.003); 
          const yOffset = Math.sin(wavePhase) * 60; // 60px amplitude
          
          return (
            <div
              key={index}
              className="w-16 h-16 md:w-24 md:h-24 shrink-0 rounded-full flex items-center justify-center glass-strong border-cream-300/50 shadow-lg text-dusk-700 transition-colors hover:text-coral-400 hover:border-coral-400/50"
              style={{
                transform: `translateY(${yOffset}px)`,
                // We use transform directly instead of tailwind for dynamic values,
                // and avoid heavy CSS transitions to let React/Scroll drive it instantly
              }}
            >
              {icon}
            </div>
          );
        })}
      </div>
    </div>
  );
}
