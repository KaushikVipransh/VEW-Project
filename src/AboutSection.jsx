import React, { useRef, useEffect, useMemo } from "react";
import gsap from "gsap";
import { Canvas, useFrame } from "@react-three/fiber"; // Added useFrame
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

  // --- FLOATING ANIMATION LOGIC ---
  useFrame((state) => {
    if (capRef.current) {
      const t = state.clock.getElapsedTime();
      // Math.sin(t * speed) * amplitude
      capRef.current.position.y = Math.sin(t * 1.2) * 0.15; 
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
      
      <group
        ref={capRef}
        position={[0, 0, 0]}
        scale={2.6} 
        rotation={[0.2, 0.6, 0]} // PREFERRED ANGLE LOCKED
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

const AboutSection = ({ isModelReady, setIsModelReady }) => {
  const sectionRef = useRef(null);
  const leftPanelRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const capRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        end: "top top",
        scrub: 1,
      },
    });

    tl.fromTo(leftPanelRef.current, { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 1 });
    tl.to(canvasContainerRef.current, { opacity: 1, duration: 1 }, "<");
  }, []);

  return (
    <div ref={sectionRef} className="w-full flex flex-col md:flex-row min-h-screen items-center justify-center px-10 gap-10 relative z-20 bg-black">
      <div ref={leftPanelRef} className="w-full md:w-1/2 flex items-center justify-center p-6 z-20">
        <div className="w-full bg-white/[0.03] backdrop-blur-md border border-white/10 p-10 text-white rounded-xl shadow-2xl">
          <h2 className="text-4xl font-bold font-serif leading-tight">
            Engineering Precision Since 2002
          </h2>
          <p className="mt-6 text-gray-400 leading-relaxed text-lg">
            At Vardhman Engineering Works, we specialize in high-tolerance
            plastic closure systems. Our commitment to 0.01mm accuracy ensures
            that every cap we manufacture meets global standards.
          </p>
        </div>
      </div>
      
      <div ref={canvasContainerRef} className="w-full md:w-1/2 h-[650px] relative z-10 opacity-0 transition-opacity duration-1000">
        <Canvas
          shadows
          camera={{ position: [0, 6, 30], fov: 30 }} // PREFERRED CAMERA LOCKED
          gl={{ 
            antialias: true, 
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.0
          }}
        >
          <Scene
            capRef={capRef}
            onModelReady={() => setIsModelReady(true)}
          />
        </Canvas>
      </div>
    </div>
  );
};

export default AboutSection;