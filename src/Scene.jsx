import React, { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import MoldedPart from "./MoldedPart";
import ExplodeLines from "./ExplodeLines";

/**
 * Scene
 *
 * capRef      → top-level group; GSAP moves x (slot swap) and scale (intro).
 * topMeshRef  → Top Cap mesh; GSAP explosion: y → +4
 * bodyMeshRef → Body mesh;    GSAP explosion: y → 0
 * bandMeshRef → Blue Band;    GSAP explosion: y → -4
 *
 * useFrame owns the idle bob on capRef.position.y.
 * Camera is NOT changed (position [0, 6, 27], fov 30).
 * Rotation is [0, 0.7, 0] (level X/Z, angled Y).
 */
const Scene = ({ capRef, onModelReady }) => {

  const blackPlasticMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#050505",
    roughness: 0.75,
    metalness: 0.05,
    ior: 1.46,
    clearcoat: 0.4,
    clearcoatRoughness: 0.2,
    envMapIntensity: 0.2,
  }), []);

  const blueBandMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#2563eb",
    roughness: 0.6,
    metalness: 0.0,
    envMapIntensity: 0.5,
  }), []);

  const BASE_Y = 0; // parts are centred at y=0 in worker space

  useFrame((state) => {
    if (capRef.current) {
      const t = state.clock.getElapsedTime();
      // Gentle idle bob — only when not exploding (GSAP overrides when needed)
      capRef.current.position.y = BASE_Y + Math.sin(t * 1.2) * 0.15;
    }
  });

  return (
    <>
      <spotLight
        position={[0, 15, 5]}
        angle={0.3}
        penumbra={1}
        intensity={250}
        color="#ffcc00"
        castShadow
      />
      <directionalLight position={[10, 10, 10]} intensity={4.5} castShadow />
      <directionalLight position={[-10, 5, -5]} intensity={2.0} color="#ffffff" />

      <Environment preset="city" />

      {/*
        capRef: GSAP controls x (slot swap) and scale (intro reveal).
        Rotation [0, 0.7, 0] — level X/Z, angled Y per spec.
      */}
      <group
        ref={capRef}
        position={[0, BASE_Y, 0]}
        scale={1.98}
        rotation={[0, 0.7, 0]}
      >
        <MoldedPart
          blackPlasticMaterial={blackPlasticMaterial}
          blueBandMaterial={blueBandMaterial}
          onModelReady={onModelReady}
        />

        {/* Blueprint guide lines — rendered in the same local space as the parts */}
        <ExplodeLines capRef={capRef} />
      </group>

      <ContactShadows opacity={0.5} scale={12} blur={2.4} far={5} position={[0, -2, 0]} />
    </>
  );
};

export default Scene;