"use client";

import { ShaderGradientCanvas, ShaderGradient } from "shadergradient";
import * as reactSpring from "@react-spring/three";
import * as drei from "@react-three/drei";
import * as fiber from "@react-three/fiber";

/**
 * Full-bleed ShaderGradient background — exactly like shadergradient.co.
 * Uses the "halo" preset colors tuned to Kareixo's purple/coral palette.
 * The gradient fills the ENTIRE viewport and stays fixed behind all content.
 */
export default function BackgroundGradient() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <ShaderGradientCanvas
        importedFiber={{ ...fiber, ...drei, ...reactSpring }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
        pixelDensity={1}
        fov={45}
        pointerEvents="none"
      >
        <ShaderGradient
          type="waterPlane"
          animate="on"
          uTime={0.2}
          uSpeed={0.1}
          uStrength={2}
          uDensity={1.8}
          uFrequency={5.5}
          uAmplitude={0}
          positionX={0}
          positionY={0}
          positionZ={0}
          rotationX={0}
          rotationY={10}
          rotationZ={50}
          color1="#ff5005"
          color2="#dbba95"
          color3="#d0bce1"
          reflection={0.1}
          wireframe={false}
          shader="defaults"
          lightType="3d"
          grain="on"
          envPreset="city"
          brightness={1.2}
          cAzimuthAngle={180}
          cPolarAngle={90}
          cDistance={3.6}
          cameraZoom={1}
        />
      </ShaderGradientCanvas>
    </div>
  );
}
