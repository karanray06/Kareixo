"use client";

import { useEffect, useRef, useState } from "react";

import { 
  Code, Hierarchy, BackSquare, MoreCircle, 
  MagicStar, Command, Star1, Code1, Box, TickCircle 
} from "iconsax-react";

// Iconsax icons matching the Antigravity style
const ICONS = [
  <Code key="1" size={24} variant="Outline" />,
  <Hierarchy key="2" size={24} variant="Outline" />,
  <BackSquare key="3" size={24} variant="Outline" />,
  <MoreCircle key="4" size={24} variant="Outline" />,
  <MagicStar key="5" size={24} variant="Outline" />,
  <Command key="6" size={24} variant="Outline" />,
  <Star1 key="7" size={24} variant="Outline" />,
  <Code1 key="8" size={24} variant="Outline" />,
  <Box key="9" size={24} variant="Outline" />,
  <TickCircle key="10" size={24} variant="Outline" />
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
