"use client";

import { Book, Airplane, Hierarchy, Activity } from "iconsax-react";

const AUDIENCES = [
  {
    icon: <Book size={24} variant="Outline" />,
    title: "Students",
    description:
      "Learn to code with an AI assistant that explains its reasoning — not just generates code. Zero cost means zero barriers.",
  },
  {
    icon: <Airplane size={24} variant="Outline" />,
    title: "Indie hackers",
    description:
      "Ship your side project with AI assistance before you've earned your first dollar. No subscription to cancel if the project doesn't work out.",
  },
  {
    icon: <Hierarchy size={24} variant="Outline" />,
    title: "Open-source contributors",
    description:
      "Review AI suggestions with the same rigor you'd review a pull request. Full diff visibility and security checks, not blind trust.",
  },
  {
    icon: <Activity size={24} variant="Outline" />,
    title: "Curious builders",
    description:
      "Prototype faster, understand deeper. The 'explain mode' helps you learn why code works, not just that it works.",
  },
];

export default function AudienceSection() {
  return (
    <div className="relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl text-white font-normal drop-shadow-2xl"
            style={{ fontFamily: "var(--font-lora), serif" }}
          >
            Built for builders with{" "}
            <span className="text-[#ff5005] italic">zero budget</span>
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto mt-4 font-medium tracking-wide">
            We&apos;re not hiding who this is for. If you can&apos;t afford $20/month
            for AI tooling, you are exactly our user.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto mb-16">
          {AUDIENCES.map((audience) => (
            <div
              key={audience.title}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#ff5005]/30 transition-all group backdrop-blur-sm"
            >
              <div className="w-10 h-10 rounded-lg bg-[#ff5005]/10 border border-[#ff5005]/20 flex items-center justify-center text-[#ff5005] mb-4 group-hover:shadow-[0_0_15px_rgba(255,80,5,0.3)] transition-all">
                {audience.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {audience.title}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">
                {audience.description}
              </p>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <div
            className="inline-block px-12 py-10 text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem]"
          >
            <h3
              className="text-2xl md:text-4xl font-normal text-white mb-3"
              style={{ fontFamily: "var(--font-lora), serif" }}
            >
              Start building — no card, no signup limits
            </h3>
            <p className="text-white/40 text-base mb-6 max-w-md mx-auto">
              Your projects sync everywhere, free. See exactly what the AI does
              and why, every time.
            </p>
            <a
              href="/signup"
              className="px-10 py-3.5 bg-[#ff5005] hover:bg-[#e64604] text-white font-semibold text-lg rounded-full transition-all shadow-[0_0_20px_rgba(255,80,5,0.3)] hover:shadow-[0_0_30px_rgba(255,80,5,0.5)] inline-flex items-center gap-2"
            >
              Create free account
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="ml-1"
              >
                <path
                  d="M7 4l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <p className="text-white/30 text-xs mt-4 font-mono">
              No credit card · No usage limits · Projects sync across devices
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
