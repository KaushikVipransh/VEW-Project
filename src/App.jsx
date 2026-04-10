import React, { useState, useRef, useLayoutEffect } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Overlay from "./Overlay";
import AboutSection from "./AboutSection";
import { HeroSection } from "./HeroSection";
import Scene from "./Scene";

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [isModelReady, setIsModelReady] = useState(false);
  const capRef = useRef(null);
  const mainRef = useRef(null);

  useLayoutEffect(() => {
    if (!capRef.current) return;

    let ctx = gsap.context(() => {
      /**
       * getResponsiveX:
       * Camera: fov=30, z=42 (pulled back for a smaller model appearance).
       * 0.25 × visibleWidth = exact geometric center of the right (or left) 50% slot.
       */
      const getResponsiveX = () => {
        const distance = 27; // must match Canvas camera z
        const fov = 30;
        const visibleHeight = 2 * Math.tan((fov * Math.PI) / 360) * distance;
        const visibleWidth = visibleHeight * (window.innerWidth / window.innerHeight);
        // Exact center of each 50% partition
        return visibleWidth * 0.25;
      };

      /**
       * GSAP owns: x, z, and scale (intro reveal).
       * useFrame in Scene.jsx owns: y (the subtle bob animation).
       * We use scale=0 / x off-screen to hide the model initially.
       */

      // Start model off-screen to the right and invisible
      gsap.set(capRef.current.position, { x: 30, z: 0 });
      gsap.set(capRef.current.scale, { x: 0, y: 0, z: 0 });

      if (isModelReady) {
        // ── Intro: model scales in + moves into RIGHT 50% slot ──
        gsap.to(capRef.current.position, {
          x: () => getResponsiveX(),   // geometric center of the right 50%
          z: 0,
          duration: 1.5,
          ease: "power3.inOut",
          invalidateOnRefresh: true,
        });
        gsap.to(capRef.current.scale, {
          x: 1.98,
          y: 1.98,
          z: 1.98,
          duration: 1.5,
          ease: "power3.inOut",
        });

        // ── Scroll swap: Hero → About ──
        // Model sweeps from Right slot to Left slot as About section enters.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: "#about",
            start: "top bottom",
            end: "top top",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        // Only animate x — leave y to useFrame bob
        tl.to(capRef.current.position, {
          x: () => -getResponsiveX(),  // geometric center of the left 50%
          ease: "none",
          invalidateOnRefresh: true,
        });
      }
    }, mainRef);

    return () => ctx.revert();
  }, [isModelReady]);

  return (
    <div ref={mainRef} className="relative w-full bg-black text-white">
      <Overlay />

      {/* Fixed Canvas — always full-screen beneath everything */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas
          shadows
          camera={{ position: [0, 6, 27], fov: 30 }}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.0,
          }}
        >
          <Scene capRef={capRef} onModelReady={() => setIsModelReady(true)} />
        </Canvas>
      </div>

      <main className="relative z-10">
        {/* Hero — full screen, flex-centered so HeroSection can manage its own layout */}
        <section
          id="hero"
          className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pointer-events-none"
        >
          <HeroSection isModelReady={isModelReady} />
        </section>

        {/* About — 3D model swaps from right to left here */}
        <section
          id="about"
          className="min-h-screen pointer-events-auto overflow-hidden pt-[100px] flex items-center bg-transparent"
        >
          <AboutSection />
        </section>
      </main>
    </div>
  );
}

export default App;