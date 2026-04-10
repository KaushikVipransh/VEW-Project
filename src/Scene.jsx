import React, { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import MoldedPart from "./MoldedPart";

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

  // Bob around the blue-band base y offset so the model stays centered in its slot
  const BASE_Y = -0.35;

  useFrame((state) => {
    if (capRef.current) {
      const t = state.clock.getElapsedTime();
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

      {/* Initial x/z offset is managed by GSAP in App.jsx; y bobs around BASE_Y */}
      <group
        ref={capRef}
        position={[0.13, BASE_Y, 0]}
        scale={1.98}
        rotation={[0, 0.6, 0]}
      >
        <MoldedPart
          blackPlasticMaterial={blackPlasticMaterial}
          blueBandMaterial={blueBandMaterial}
          onModelReady={onModelReady}
        />
      </group>

      <ContactShadows opacity={0.5} scale={12} blur={2.4} far={5} position={[0, -2, 0]} />
    </>
  );
};

export default Scene;