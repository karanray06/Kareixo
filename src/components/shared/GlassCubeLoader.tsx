"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import GlassCube from "../landing/GlassCube";

export default function GlassCubeLoader() {
  return (
    <div className="w-10 h-10 shrink-0">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 2, 2]} intensity={1} />
        <Suspense fallback={null}>
          <GlassCube size={1} rotationSpeed={1.5} autoRotate />
        </Suspense>
      </Canvas>
    </div>
  );
}
