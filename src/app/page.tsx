import HeroScene from "@/components/landing/HeroScene";
import FeatureCard from "@/components/landing/FeatureCard";
import BackgroundGradient from "@/components/landing/BackgroundGradient";
import ComparisonTable from "@/components/landing/ComparisonTable";
import RouterVisual from "@/components/landing/RouterVisual";
import SecurityExplainer from "@/components/landing/SecurityExplainer";
import { FaGithub, FaTwitter } from "react-icons/fa";

export default function Home() {
  return (
    <main className="min-h-screen text-white relative font-sans" style={{ background: "#050505" }}>
      {/* Full-bleed ShaderGradient — deeply darkened for premium feel */}
      <div className="fixed inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
        <BackgroundGradient />
      </div>
      
      {/* Subtle vignette / noise overlay for texture */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,#050505_100%)] opacity-80" />

      {/* Section 1: Hero */}
      <HeroScene />

      {/* Section 2: Core Features Grid */}
      <section className="relative z-10 py-32 max-w-[1400px] mx-auto px-6 md:px-12 space-y-32">
        
        {/* Why Kareixo / Comparison Table */}
        <div className="flex flex-col items-center space-y-12">
          <h2 
            className="text-4xl md:text-5xl text-white font-normal text-center drop-shadow-2xl"
            style={{ fontFamily: "var(--font-lora), serif" }}
          >
            The new standard for<br /><span className="text-white/50 italic">agentic workspaces</span>
          </h2>
          <div className="w-full max-w-5xl p-0.5 rounded-[2rem] bg-gradient-to-b from-white/10 to-transparent shadow-[0_0_100px_rgba(0,0,0,0.8)]">
            <div className="bg-black/60 backdrop-blur-3xl rounded-[calc(2rem-1px)] p-8 md:p-12 overflow-hidden border border-white/5 shadow-inner">
              <ComparisonTable />
            </div>
          </div>
        </div>

        {/* Router & Security Split */}
        <div className="flex flex-col lg:flex-row gap-8 items-stretch max-w-6xl mx-auto w-full">
          
          {/* Multi-model Router */}
          <div className="lg:w-3/5 p-0.5 rounded-[2rem] bg-gradient-to-br from-white/10 to-transparent">
            <div className="bg-black/60 backdrop-blur-3xl rounded-[calc(2rem-1px)] h-full p-8 md:p-12 border border-white/5 shadow-inner flex flex-col justify-between group">
              <div className="mb-12">
                <h3 className="text-3xl text-white font-normal mb-4" style={{ fontFamily: "var(--font-lora), serif" }}>
                  Intelligent Routing
                </h3>
                <p className="text-white/50 max-w-sm font-medium tracking-wide">
                  Dynamically route tasks to the best model based on context, cost, and speed.
                </p>
              </div>
              <div className="relative transform group-hover:scale-[1.02] transition-transform duration-700">
                <RouterVisual />
              </div>
            </div>
          </div>

          {/* Security Pass */}
          <div className="lg:w-2/5 p-0.5 rounded-[2rem] bg-gradient-to-br from-emerald-500/20 to-transparent">
            <div className="bg-black/60 backdrop-blur-3xl rounded-[calc(2rem-1px)] h-full p-8 md:p-12 border border-white/5 shadow-inner flex flex-col justify-between group relative overflow-hidden">
              {/* Subtle green glow bleed */}
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/20 blur-[80px] rounded-full pointer-events-none group-hover:bg-emerald-500/30 transition-colors duration-700" />
              
              <div className="relative z-10 mb-12">
                <h3 className="text-3xl text-white font-normal mb-4" style={{ fontFamily: "var(--font-lora), serif" }}>
                  Secure by Design
                </h3>
                <p className="text-white/50 font-medium tracking-wide">
                  Nothing executes without passing strict static analysis and your final approval.
                </p>
              </div>
              <div className="relative z-10 transform group-hover:translate-y-[-5px] transition-transform duration-700">
                <SecurityExplainer />
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* Section 3: Feature Card Deep Dive */}
      <div className="relative z-10 pb-32">
        <FeatureCard />
      </div>

      {/* Premium Dark Footer */}
      <footer className="relative z-20 border-t border-white/5 bg-[#020202] pt-24 pb-12">
        <div className="max-w-[1200px] mx-auto px-8 md:px-16">
          <div className="flex flex-col md:flex-row justify-between gap-16 mb-24">
            
            {/* Built by */}
            <div className="space-y-6">
              <h3
                className="text-2xl text-[#ff5005] italic"
                style={{ fontFamily: "var(--font-lora), serif" }}
              >
                Built by
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-sm font-medium tracking-wide">
                  <a href="#" className="text-white/80 hover:text-[#ff5005] transition-colors">Karan Ray ↗</a>
                  <span className="text-white/30">Founder & Engineer</span>
                </div>
                <div className="flex items-center gap-4 text-sm font-medium tracking-wide">
                  <a href="#" className="text-white/80 hover:text-[#ff5005] transition-colors">Kareixo AI ↗</a>
                  <span className="text-white/30">Agentic Engine</span>
                </div>
              </div>
            </div>

            {/* Keep in touch */}
            <div className="space-y-6">
              <h3
                className="text-2xl text-white/40 italic"
                style={{ fontFamily: "var(--font-lora), serif" }}
              >
                Keep in touch
              </h3>
              <p className="text-white/30 text-sm font-medium tracking-wide">
                For product updates and bug reports
              </p>
              <div className="flex items-center gap-6 text-sm font-medium tracking-wide">
                <a href="#" className="text-white/80 hover:text-[#ff5005] transition-colors flex items-center gap-2">
                  <FaTwitter /> Twitter
                </a>
                <a href="https://github.com/karanray06/Kareixo" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-[#ff5005] transition-colors flex items-center gap-2">
                  <FaGithub /> GitHub
                </a>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center border-t border-white/5 pt-8 text-xs font-medium tracking-widest text-white/20 uppercase">
            <span>© 2026 Kareixo</span>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white/50 transition-colors">Privacy</a>
              <a href="#" className="hover:text-white/50 transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
