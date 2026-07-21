/**
 * Repeat CTA band — appears just before the footer.
 */

import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { FaGithub } from "react-icons/fa";

export default function CtaBand() {
  return (
    <section className="max-w-[1200px] mx-auto px-6 md:px-12 py-24">
      <div className="relative p-0.5 rounded-[2rem] bg-gradient-to-r from-[#ff5005]/40 via-[#ff5005]/20 to-[#ff5005]/40 overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 bg-[#ff5005]/10 blur-[60px] rounded-full" />
        
        <div className="relative bg-black/70 backdrop-blur-3xl rounded-[calc(2rem-1px)] border border-white/5 shadow-inner px-8 py-16 md:py-20 text-center">
          <h2
            className="text-4xl md:text-5xl text-white font-normal mb-6"
            style={{ fontFamily: "var(--font-lora), serif" }}
          >
            Ready to build <span className="text-white/50 italic">smarter</span>?
          </h2>
          <p className="text-white/40 max-w-lg mx-auto mb-10 font-medium tracking-wide">
            Start for free. No credit card, no vendor lock-in.
            Your code stays yours.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/signup"
              className="px-8 py-4 bg-[#ff5005] hover:bg-[#e64604] text-white font-semibold text-sm rounded-full transition-all shadow-[0_0_20px_rgba(255,80,5,0.3)] hover:shadow-[0_0_30px_rgba(255,80,5,0.5)] flex items-center gap-2"
            >
              Start Coding <FiArrowRight />
            </Link>
            <a
              href="https://github.com/karanray06/Kareixo"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-semibold text-sm rounded-full transition-all border border-white/10 hover:border-white/20 flex items-center gap-2"
            >
              <FaGithub /> View on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
