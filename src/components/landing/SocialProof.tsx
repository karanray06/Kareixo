/**
 * Social proof / stats strip for the landing page.
 * Shows lightweight metrics to build trust.
 */

const stats = [
  { value: "6", label: "AI Models", sublabel: "Free-tier providers" },
  { value: "100%", label: "Open Source", sublabel: "MIT licensed" },
  { value: "<2s", label: "Avg Latency", sublabel: "Per-task execution" },
  { value: "0", label: "Cost to Start", sublabel: "No credit card required" },
];

export default function SocialProof() {
  return (
    <section className="max-w-[1200px] mx-auto px-6 md:px-12 py-24">
      <div className="p-0.5 rounded-[2rem] bg-gradient-to-r from-white/10 via-[#ff5005]/10 to-white/10">
        <div className="bg-black/60 backdrop-blur-3xl rounded-[calc(2rem-1px)] border border-white/5 shadow-inner px-8 py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="text-center group">
                <div
                  className="text-4xl md:text-5xl font-normal text-white mb-2 group-hover:text-[#ff5005] transition-colors duration-500"
                  style={{ fontFamily: "var(--font-lora), serif" }}
                >
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-white/60 tracking-wide">{stat.label}</div>
                <div className="text-xs text-white/25 mt-1">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
