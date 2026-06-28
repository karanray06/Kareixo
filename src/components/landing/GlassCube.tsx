"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

interface GlassCubeProps {
  size?: number;
  position?: [number, number, number];
  autoRotate?: boolean;
  rotationSpeed?: number;
  interactive?: boolean;
}

export default function GlassCube({
  size = 1,
  position = [0, 0, 0],
  autoRotate = true,
  rotationSpeed = 0.3,
}: GlassCubeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    if (autoRotate) {
      meshRef.current.rotation.y += delta * rotationSpeed;
      meshRef.current.rotation.x += delta * rotationSpeed * 0.5;
    }

    // Subtle floating motion
    meshRef.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.08;

    if (edgesRef.current) {
      edgesRef.current.rotation.copy(meshRef.current.rotation);
      edgesRef.current.position.copy(meshRef.current.position);
    }
  });

  return (
    <group>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[size, size, size]} />
        <MeshTransmissionMaterial
          backside
          samples={8}
          thickness={0.6}
          roughness={0.12}
          ior={1.2}
          chromaticAberration={0.03}
          anisotropy={0.2}
          distortion={0.1}
          distortionScale={0.2}
          color="#ffffff"
          attenuationColor="#f2bba8"
          attenuationDistance={3}
          transmission={1}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
      {/* Wireframe edges for the "glass box" look */}
      <lineSegments ref={edgesRef} position={position}>
        <edgesGeometry
          args={[new THREE.BoxGeometry(size * 1.001, size * 1.001, size * 1.001)]}
        />
        <lineBasicMaterial color="#e88a6d" transparent opacity={0.35} />
      </lineSegments>
    </group>
  );
}
