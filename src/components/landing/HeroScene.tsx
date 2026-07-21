"use client";

/**
 * Hero section — exact replica of shadergradient.co Screenshot 1.
 * 
 * Structure:
 *  - "Kareixo" small text at top center with underline (like "ShaderGradient")
 *  - Massive transparent "It's Agentic!" text overlaid ON the gradient
 *  - Small subtitle: "The most natural way to build complex software"
 *  - Tiny white pill at the very bottom (scroll indicator)
 *  - NO buttons, NO CTAs, NO split layouts
 */

import { FaGithub, FaChrome } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";
import LiveDemo from "./LiveDemo";

export default function HeroScene() {
  return (
    <section className="relative min-h-screen flex flex-col justify-between overflow-hidden">
      {/* Main Content — Split Layout */}
      <div className="relative z-10 max-w-[1400px] mx-auto w-full px-6 md:px-12 flex flex-col lg:flex-row items-center gap-16 lg:gap-8 flex-1 py-32">
        
        {/* Left: Text */}
        <div className="lg:w-1/2 space-y-8 select-none">
          <h1
            className="text-[clamp(4rem,6vw,7rem)] leading-[0.9] font-normal tracking-[-0.02em] text-white"
            style={{ fontFamily: "var(--font-lora), serif" }}
          >
            The AI<br />Workspace<br />for GitHub
          </h1>
          <p className="text-white/60 text-lg md:text-xl max-w-md font-medium tracking-wide">
            Build, review, and ship faster with an intelligent agent embedded directly into your workflow.
          </p>
          
          <div className="flex items-center gap-6 pt-4">
            <a
              href="/login"
              className="px-8 py-4 bg-[#ff5005] hover:bg-[#e64604] text-white font-semibold text-sm rounded-full transition-all shadow-[0_0_20px_rgba(255,80,5,0.3)] hover:shadow-[0_0_30px_rgba(255,80,5,0.5)] flex items-center gap-2"
            >
              Start Coding <FiArrowRight />
            </a>
          </div>
        </div>

        {/* Right: Floating 3D LiveDemo */}
        <div className="lg:w-1/2 w-full relative perspective-1000">
          <div className="p-1 rounded-2xl transform rotate-y-[-10deg] rotate-x-[5deg] hover:rotate-0 hover:scale-[1.02] transition-all duration-700 shadow-[0_30px_60px_rgba(0,0,0,0.6)] bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/20">
            <div className="bg-black/40 rounded-[calc(1rem-1px)] h-full overflow-hidden">
              <LiveDemo />
            </div>
          </div>
        </div>

      </div>

      {/* Bottom CTA Pill */}
      <div className="pb-12 z-20 flex justify-center w-full">
        <div className="flex items-center gap-3 p-2.5 bg-gradient-to-r from-pink-300/30 via-purple-300/30 to-blue-300/30 backdrop-blur-2xl border border-white/30 rounded-[2rem] shadow-[0_8px_32px_rgba(255,100,200,0.15)] animate-bounce-slow">
          <a href="#" className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-[#00BFFF] hover:scale-105 transition-transform shadow-sm">
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M8.293 6.293L2.586 12l5.707 5.707 1.414-1.414L5.414 12l4.293-4.293-1.414-1.414zm7.414 11.414L21.414 12l-5.707-5.707-1.414 1.414L18.586 12l-4.293 4.293 1.414 1.414z"></path></svg>
          </a>
          <a href="#" className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-[#00BFFF] hover:scale-105 transition-transform shadow-sm">
            <FaChrome size={20} />
          </a>
          <a href="https://github.com/karanray06/Kareixo" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-[#00BFFF] hover:scale-105 transition-transform shadow-sm">
            <FaGithub size={20} />
          </a>
        </div>
      </div>
    </section>
  );
}
