import { useRef, useEffect, useState, useMemo } from "react";
import Overlay from "./Overlay";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import AboutSection from "./AboutSection";
import MoldedPart from "./MoldedPart";

gsap.registerPlugin(ScrollTrigger);

const Loader = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
      <p className="text-white text-sm tracking-widest uppercase opacity-60">Loading</p>
    </div>
  </div>
);

const Scene = ({ capRef, heroTitleRef, heroSublineRef, onModelReady, isModelReady }) => {
  const { viewport } = useThree();

  const blackPlasticMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#111111",
    roughness: 0.50,
    metalness: 0.0,
    ior: 1.46,
    reflectivity: 0.5,
    clearcoat: 0.6,
    clearcoatRoughness: 0.20,
    sheen: 0.9,
    sheenRoughness: 0.35,
    sheenColor: "#bbbbbb",
    envMapIntensity: 1.8,
  }), []);

  const blueBandMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#b8cedd",
    roughness: 0.68,
    metalness: 0.0,
    transmission: 0.22,
    ior: 1.38,
    thickness: 0.4,
    envMapIntensity: 1.1,
    clearcoat: 0.18,
    clearcoatRoughness: 0.45,
  }), []);

  useEffect(() => {
    const cap = capRef.current;
    const title = heroTitleRef.current;
    const subline = heroSublineRef.current;
    if (!isModelReady || !cap || !title || !subline) return;

    ScrollTrigger.getAll().forEach(st => st.kill());

    // Entry: spin in and slide left, reveal text
    gsap.timeline()
      .set(cap.position, { x: 0, y: -0.5 })
      .set(cap.rotation, { y: 0 })
      .to(cap.rotation, { y: Math.PI * 2, duration: 1.6, ease: "power2.inOut" })
      .to(cap.position, { x: -3.0, y: 0, duration: 1.5, ease: "power2.inOut" }, "-=1.2")
      .to([title, subline], { opacity: 1, duration: 1, stagger: 0.2 }, "-=0.8");

    gsap.timeline({
      scrollTrigger: {
        trigger: "#about",
        start: "top bottom",
        end: "bottom top",
        scrub: 1.2,
      },
    })
      .to(cap.position, { x: viewport.width / 2.5, y: -0.5 })
      .to(cap.rotation, { y: Math.PI / 1.5 }, "<")
      .to(cap.scale, { x: 1.2, y: 1.2, z: 1.2 }, "<");

    return () => ScrollTrigger.getAll().forEach(st => st.kill());
  }, [isModelReady, capRef, heroTitleRef, heroSublineRef, viewport.width]);

  return (
    <>
      <ambientLight intensity={0.35} />

      {/* Key light — front right, slightly high */}
      <directionalLight position={[4, 5, 6]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />

      {/* Fill — left cool tone */}
      <directionalLight position={[-5, 2, 3]} intensity={0.55} color="#ddeeff" />

      {/* Top light — reveals screw cap top and D-ring */}
      <directionalLight position={[0, 8, 1]} intensity={0.9} color="#ffffff" />

      {/* Rim — back definition */}
      <directionalLight position={[0, 2, -7]} intensity={0.35} />

      <Environment preset="studio" resolution={256} />

      <ContactShadows opacity={0.55} scale={16} blur={2.5} far={6} position={[0, -1.8, 0]} />

      {/*
        Camera at y=2.5, z=12 gives a slight downward angle
        matching the reference photo — you can see:
          • the top of the cap (screw cap + D-ring)
          • the side wall with blue band + knurling
          • the D-ring bar rising from the top surface
        
        Y-rotation of 0.20π on the group puts the screw cap (left)
        and bar/D-ring (right) in the correct orientation
      */}
      <group
        ref={capRef}
        position={[0, -0.1, 0]}
        scale={0.72}
        rotation={[0, Math.PI * 0.20, 0]}
        dispose={null}
      >
        <MoldedPart
          blackPlasticMaterial={blackPlasticMaterial}
          blueBandMaterial={blueBandMaterial}
          onModelReady={onModelReady}
        />
      </group>
    </>
  );
};

function App() {
  const capRef = useRef();
  const heroTitleRef = useRef();
  const heroSublineRef = useRef();
  const [isModelReady, setIsModelReady] = useState(false);

  return (
    <>
      <div className="fixed top-0 left-0 w-screen h-screen">
        {!isModelReady && <Loader />}
        <Canvas
          shadows
          camera={{ position: [0, 2.5, 12], fov: 30 }}
          gl={{
            alpha: true,
            antialias: false,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.15,
          }}
          dpr={[1, 1.5]}
        >
          <Scene
            capRef={capRef}
            heroTitleRef={heroTitleRef}
            heroSublineRef={heroSublineRef}
            onModelReady={() => setIsModelReady(true)}
            isModelReady={isModelReady}
          />
        </Canvas>
      </div>

      <div className="relative z-10 pointer-events-none">
        <div className="relative h-screen">
          <Overlay heroTitleRef={heroTitleRef} heroSublineRef={heroSublineRef} />
        </div>
        <section id="about" className="h-[100vh] pointer-events-auto">
          <AboutSection />
        </section>
      </div>
    </>
  );
}

export default App;