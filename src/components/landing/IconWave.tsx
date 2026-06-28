"use client";

import { useEffect, useRef } from "react";
import { 
  Code, Hierarchy, BackSquare, MoreCircle, 
  MagicStar, Command, Star1, Code1, Box, TickCircle,
  FolderOpen, DocumentCopy, Refresh2, Setting2
} from "iconsax-react";

// Store component references, not JSX instances, to avoid hydration/render issues
const ICON_COMPONENTS = [
  Refresh2, Code1, MagicStar, BackSquare, TickCircle, 
  Star1, Hierarchy, MoreCircle, DocumentCopy, Box, 
  Command, FolderOpen, Code, Setting2
];

// Triple the icons for seamless infinite scroll
const WAVE_ICONS = [...ICON_COMPONENTS, ...ICON_COMPONENTS, ...ICON_COMPONENTS];

export function IconWave() {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      time += 0.015; // Speed of the snake simulation

      if (containerRef.current) {
        // Move the entire container left for infinite scroll
        // 14 icons * (72px + 24px gap) = 1344px width per set approx.
        // We calculate exact pixel offset dynamically based on time
        const xOffset = -(time * 40) % (ICON_COMPONENTS.length * 100); 
        containerRef.current.style.transform = `translateX(${xOffset}px)`;
      }

      elementsRef.current.forEach((el, index) => {
        if (!el) return;
        // Calculate the sine wave position for each element
        // The phase includes both the static index and the moving time
        const wavePhase = (index * 0.4) - (time * 1.5); 
        const yOffset = Math.sin(wavePhase) * 60; // 60px amplitude
        
        // We only animate Y here, X is handled by the parent container
        el.style.transform = `translateY(${yOffset}px)`;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div 
      className="relative w-full h-[300px] overflow-hidden flex items-center justify-start my-12"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
      }}
    >
      <div 
        ref={containerRef}
        className="flex gap-6 md:gap-8 items-center px-[10vw] flex-nowrap w-max"
        style={{ willChange: "transform" }}
      >
        {WAVE_ICONS.map((IconComponent, index) => (
          <div
            key={index}
            ref={(el) => { elementsRef.current[index] = el; }}
            className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full flex items-center justify-center bg-white border border-gray-200/60 shadow-sm text-gray-800 transition-colors hover:text-coral-500 hover:border-coral-400/50"
            style={{ willChange: "transform" }}
          >
            <IconComponent size={24} variant="Outline" color="currentColor" />
          </div>
        ))}
      </div>
    </div>
  );
}
