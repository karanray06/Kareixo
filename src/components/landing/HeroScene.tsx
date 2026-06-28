"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Text } from "@react-three/drei";
import * as THREE from "three";
import GlassCube from "./GlassCube";
import {
  FloatingOctahedron,
  FloatingTorus,
  FloatingIcosahedron,
  GridPlane,
  OrbitRing,
  ConstellationLines,
} from "./SceneElements";
import { ParticleVortex } from "./ParticleVortex";

/* ── Floating code fragments that orbit the glass cube ── */
const CODE_FRAGMENTS = [
  "const router =",
  "async function",
  "security.check()",
  "model.stream()",
  "diff.apply()",
  "agent.think()",
  "free: true",
  "<GlassBox />",
  "return pass;",
  "import AI",
  "export default",
  "await verify()",
];

function CodeFragment({
  text,
  index,
  total,
}: {
  text: string;
  index: number;
  total: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const angle = (index / total) * Math.PI * 2;
  const radius = 2.4 + (index % 3) * 0.5;
  const yOffset = ((index % 5) - 2) * 0.6;
  const speed = 0.15 + (index % 4) * 0.05;

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed + angle;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.z = Math.sin(t) * radius;
    ref.current.position.y = yOffset + Math.sin(t * 2) * 0.15;
    ref.current.lookAt(state.camera.position);
  });

  return (
    <mesh ref={ref}>
      <Text
        fontSize={0.13}
        color="#4dd8d0"
        anchorX="center"
        anchorY="middle"
        font="/fonts/JetBrainsMono-Regular.ttf"
        fillOpacity={0.6}
      >
        {text}
      </Text>
    </mesh>
  );
}

/* ── Mouse-reactive camera rig ── */
function CameraRig() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    const px = state.pointer.x * 0.3;
    const py = state.pointer.y * 0.2;
    mouse.current.x += (px - mouse.current.x) * 0.05;
    mouse.current.y += (py - mouse.current.y) * 0.05;
    camera.position.x = mouse.current.x;
    camera.position.y = mouse.current.y + 0.5;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ── Main Scene ── */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      <pointLight position={[-3, 2, -3]} intensity={0.3} color="#4dd8d0" />
      <pointLight position={[4, -1, 4]} intensity={0.15} color="#f59e0b" />

      <CameraRig />

      {/* Structured Fibonacci spiral vortex background */}
      <ParticleVortex count={2500} radius={12} colorPrimary="#4dd8d0" colorSecondary="#f59e0b" size={0.018} />

      {/* Constellation lines for depth */}
      <ConstellationLines count={40} spread={10} color="#4dd8d0" opacity={0.06} />

      {/* Ground grid (antigravity-style) */}
      <GridPlane size={50} divisions={50} color="#4dd8d0" opacity={0.04} position={[0, -2.5, 0]} />

      {/* Orbiting rings at different heights */}
      <OrbitRing radius={3.5} count={80} color="#4dd8d0" speed={0.08} y={-0.5} />
      <OrbitRing radius={5} count={100} color="#4dd8d0" speed={-0.05} y={0.3} />

      {/* Floating wireframe geometry (antigravity-style depth) */}
      <FloatingOctahedron position={[-4, 1.5, -3]} scale={0.6} color="#4dd8d0" speed={0.15} />
      <FloatingTorus position={[4.5, -0.5, -2]} scale={0.4} color="#4dd8d0" speed={0.12} />
      <FloatingIcosahedron position={[-3, -1.5, 2]} scale={0.5} color="#f59e0b" speed={0.1} />
      <FloatingOctahedron position={[3.5, 2, 3]} scale={0.35} color="#4dd8d0" speed={0.2} />

      {/* Central glass cube */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <GlassCube size={1.6} rotationSpeed={0.25} autoRotate />
      </Float>

      {/* Orbiting code fragments */}
      {CODE_FRAGMENTS.map((text, i) => (
        <CodeFragment
          key={text}
          text={text}
          index={i}
          total={CODE_FRAGMENTS.length}
        />
      ))}

      <Environment preset="night" />
    </>
  );
}

/* ── Export the full hero ── */
export default function HeroScene() {
  return (
    <div className="relative w-full h-[100vh] min-h-[700px]">
      {/* 3D Canvas — full viewport */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0.5, 5], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
          dpr={[1, 1.5]}
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      {/* Overlay content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center pointer-events-none">
        {/* Tagline badge */}
        <div className="badge badge-cyan mb-6 pointer-events-auto animate-fade-in-up">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 mr-1 animate-pulse-glow" />
          Free &middot; Transparent &middot; No credit card
        </div>

        {/* Headline */}
        <h1
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] max-w-4xl mb-6"
          style={{ animationDelay: "0.1s" }}
        >
          The IDE that{" "}
          <span className="text-gradient-cyan">shows its work</span>
        </h1>

        {/* Subheadline */}
        <p
          className="text-graphite-300 text-lg md:text-xl max-w-2xl mb-8 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          Free multi-model AI routing across 6+ providers. Every reasoning step
          visible. Every diff reviewed. Every change security-checked — before it
          touches your code.
        </p>

        {/* CTA */}
        <div
          className="flex flex-col sm:flex-row gap-4 pointer-events-auto animate-fade-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          <a href="/signup" className="btn btn-primary text-lg px-8 py-3">
            Start building — free
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
          <a href="#demo" className="btn btn-secondary text-lg px-8 py-3">
            See it in action
          </a>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-950 to-transparent" />
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: "1s" }}>
        <span className="text-graphite-500 text-[10px] font-mono tracking-widest uppercase">Scroll</span>
        <div className="w-5 h-8 border border-graphite-600 rounded-full flex items-start justify-center p-1.5">
          <div className="w-1 h-2 bg-cyan-400 rounded-full animate-[float_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}
