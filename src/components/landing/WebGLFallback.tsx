"use client";

import { useEffect, useRef } from "react";
// @ts-expect-error animejs types do not have a default export
import anime from "animejs";

export function WebGLFallback() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Simple floating animation for the gradient orbs using animejs
    anime({
      targets: containerRef.current.querySelectorAll('.fallback-orb'),
      translateY: [
        { value: -20, duration: 2000 },
        { value: 20, duration: 2000 }
      ],
      translateX: [
        { value: 10, duration: 3000 },
        { value: -10, duration: 3000 }
      ],
      loop: true,
      direction: 'alternate',
      easing: 'easeInOutSine'
    });
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 flex items-center justify-center bg-cream-50 overflow-hidden">
      <div className="absolute inset-0 opacity-40">
        <div className="fallback-orb absolute top-1/4 left-1/4 w-64 h-64 bg-coral-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-glow" />
        <div className="fallback-orb absolute bottom-1/4 right-1/4 w-80 h-80 bg-periwinkle-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70" style={{ animationDelay: "1s" }} />
        <div className="fallback-orb absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-rosegold-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50" style={{ animationDelay: "2s" }} />
      </div>
    </div>
  );
}
