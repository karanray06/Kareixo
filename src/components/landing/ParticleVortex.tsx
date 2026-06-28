"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleVortexProps {
  count?: number;
  radius?: number;
  colorPrimary?: string;
  colorSecondary?: string;
  size?: number;
}

export function ParticleVortex({
  count = 2000,
  radius = 8,
  colorPrimary = "#4dd8d0", // Cyan
  colorSecondary = "#f59e0b", // Amber/Orange accent
  size = 0.015,
}: ParticleVortexProps) {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate positions and colors using a Vogel/Fibonacci spiral projected onto a sphere,
  // but flattened slightly to create a vortex disk/funnel shape.
  const { positions, colors, randomFactors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const factors = new Float32Array(count); // For individual particle animation

    const color1 = new THREE.Color(colorPrimary);
    const color2 = new THREE.Color(colorSecondary);
    const tempColor = new THREE.Color();

    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const angleIncrement = Math.PI * 2 * goldenRatio;

    for (let i = 0; i < count; i++) {
      // Vogel spiral math
      const t = i / count;
      const angle = i * angleIncrement;
      
      // Radius expands outward
      const r = radius * Math.pow(t, 0.6); 
      
      // Create a funnel/vortex shape (Z is height)
      // The center dips down, the edges rise up
      const z = (Math.pow(r, 2) / radius) * 0.5 - 2;

      // Add a bit of random scatter so it's not a perfect line
      const scatter = 0.2 * (1 - t);

      pos[i * 3] = r * Math.cos(angle) + (Math.random() - 0.5) * scatter;
      pos[i * 3 + 1] = z + (Math.random() - 0.5) * scatter * 2;
      pos[i * 3 + 2] = r * Math.sin(angle) + (Math.random() - 0.5) * scatter;

      // Mix colors based on radius and random factor
      const mixRatio = Math.random() > 0.8 ? 1 : t * 0.5;
      tempColor.lerpColors(color1, color2, mixRatio);
      
      col[i * 3] = tempColor.r;
      col[i * 3 + 1] = tempColor.g;
      col[i * 3 + 2] = tempColor.b;

      // Random factor for rotation speed variance
      factors[i] = Math.random();
    }

    return { positions: pos, colors: col, randomFactors: factors };
  }, [count, radius, colorPrimary, colorSecondary]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    // Rotate the entire vortex slowly
    pointsRef.current.rotation.y += delta * 0.05;
    
    // Gentle tilting based on time
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.15 + 0.2;
    pointsRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.15) * 0.05;

    // We can also animate individual particles if we want to get fancy by updating the buffer geometry,
    // but a global rotation + tilt usually looks incredible for this exact effect.
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
