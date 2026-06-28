"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ── Floating geometric shapes that orbit sections ── */

export function FloatingOctahedron({
  position = [0, 0, 0] as [number, number, number],
  scale = 1,
  color = "#4dd8d0",
  speed = 0.3,
}: {
  position?: [number, number, number];
  scale?: number;
  color?: string;
  speed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.elapsedTime * speed;
    ref.current.rotation.y = state.clock.elapsedTime * speed * 0.7;
    ref.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.15}
        wireframe
      />
    </mesh>
  );
}

export function FloatingTorus({
  position = [0, 0, 0] as [number, number, number],
  scale = 1,
  color = "#4dd8d0",
  speed = 0.2,
}: {
  position?: [number, number, number];
  scale?: number;
  color?: string;
  speed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.elapsedTime * speed;
    ref.current.rotation.z = state.clock.elapsedTime * speed * 0.5;
    ref.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 0.6 + 1) * 0.12;
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <torusGeometry args={[1, 0.3, 16, 32]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.12}
        wireframe
      />
    </mesh>
  );
}

export function FloatingIcosahedron({
  position = [0, 0, 0] as [number, number, number],
  scale = 1,
  color = "#4dd8d0",
  speed = 0.25,
}: {
  position?: [number, number, number];
  scale?: number;
  color?: string;
  speed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * speed;
    ref.current.rotation.z = state.clock.elapsedTime * speed * 0.4;
    ref.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 0.4 + 2) * 0.1;
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.1}
        wireframe
      />
    </mesh>
  );
}

/* ── Animated grid plane (ground effect) ── */
export function GridPlane({
  size = 40,
  divisions = 40,
  color = "#4dd8d0",
  opacity = 0.06,
  position = [0, -2, 0] as [number, number, number],
}: {
  size?: number;
  divisions?: number;
  color?: string;
  opacity?: number;
  position?: [number, number, number];
}) {
  const ref = useRef<THREE.GridHelper>(null);

  useFrame((state) => {
    if (!ref.current) return;
    (ref.current.material as THREE.Material).opacity =
      opacity + Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
  });

  return (
    <gridHelper
      ref={ref}
      args={[size, divisions, color, color]}
      position={position}
      rotation={[0, 0, 0]}
    >
      <meshBasicMaterial
        attach="material"
        color={color}
        transparent
        opacity={opacity}
      />
    </gridHelper>
  );
}

/* ── Orbiting ring of connected dots ── */
export function OrbitRing({
  radius = 3,
  count = 60,
  color = "#4dd8d0",
  speed = 0.1,
  y = 0,
}: {
  radius?: number;
  count?: number;
  color?: string;
  speed?: number;
  y?: number;
}) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, [count, radius, y]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * speed;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color={color}
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

/* ── Dense particle nebula ── */
export function ParticleNebula({
  count = 500,
  radius = 6,
  color = "#4dd8d0",
  size = 0.012,
}: {
  count?: number;
  radius?: number;
  color?: string;
  size?: number;
}) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Spherical distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * Math.cbrt(Math.random());
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count, radius]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.015;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={0.35}
        sizeAttenuation
      />
    </points>
  );
}

/* ── Connecting lines between random points (constellation effect) ── */
export function ConstellationLines({
  count = 30,
  spread = 8,
  color = "#4dd8d0",
  opacity = 0.08,
}: {
  count?: number;
  spread?: number;
  color?: string;
  opacity?: number;
}) {
  const ref = useRef<THREE.LineSegments>(null);

  const positions = useMemo(() => {
    const points: number[] = [];
    const nodes: THREE.Vector3[] = [];

    for (let i = 0; i < count; i++) {
      nodes.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * spread,
          (Math.random() - 0.5) * spread * 0.6,
          (Math.random() - 0.5) * spread
        )
      );
    }

    // Connect nearby nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < spread * 0.3) {
          points.push(nodes[i].x, nodes[i].y, nodes[i].z);
          points.push(nodes[j].x, nodes[j].y, nodes[j].z);
        }
      }
    }

    return new Float32Array(points);
  }, [count, spread]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.008;
  });

  return (
    <lineSegments ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </lineSegments>
  );
}
