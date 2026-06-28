import HeroScene from "@/components/landing/HeroScene";
import { IconWave } from "@/components/landing/IconWave";
import LiveDemo from "@/components/landing/LiveDemo";
import ComparisonTable from "@/components/landing/ComparisonTable";
import RouterVisual from "@/components/landing/RouterVisual";
import SecurityExplainer from "@/components/landing/SecurityExplainer";
import AudienceSection from "@/components/landing/AudienceSection";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* 1. 3D Hero */}
      <HeroScene />

      <div className="relative z-10 bg-slate-950">
        {/* Ambient glow orbs */}
        <div className="glow-orb glow-orb-cyan" style={{ width: 500, height: 500, top: 200, left: -200 }} />
        <div className="glow-orb glow-orb-amber" style={{ width: 400, height: 400, top: 1200, right: -150 }} />
        <div className="glow-orb glow-orb-cyan" style={{ width: 350, height: 350, top: 2500, left: '30%' }} />

        {/* 1.5. Scrolling Icon Wave Transition */}
        <IconWave />

        {/* 2. Live Demo (The Pitch) */}
        <LiveDemo />

        <div className="section-divider" />

        {/* 3. Honest Comparison */}
        <ComparisonTable />

        <div className="section-divider" />

        {/* 4. Multi-model router visualization */}
        <RouterVisual />

        <div className="section-divider" />

        {/* 5. Security Pass explainer */}
        <SecurityExplainer />

        <div className="section-divider" />

        {/* 6. Built for builders + final CTA */}
        <AudienceSection />

        {/* Footer */}
        <footer className="border-t border-graphite-800 py-8 text-center text-graphite-500 text-sm font-mono mt-12 relative">
          <div className="scan-line" />
          <p>&copy; {new Date().getFullYear()} Kareixo. The Glass Box IDE.</p>
        </footer>
      </div>
    </main>
  );
}
