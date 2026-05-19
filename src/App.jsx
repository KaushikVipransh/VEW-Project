import React, { useState, useRef, useLayoutEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Overlay from "./Overlay";
import AboutSection from "./AboutSection";
import { HeroSection } from "./HeroSection";
import Scene from "./Scene";
import ProductGateway from "./ProductGateway";
import ProductsPage from "./ProductsPage";
import ClientsSection from "./ClientsSection";
import Footer from "./Footer";

gsap.registerPlugin(ScrollTrigger);

// ─── Responsive X helper ─────────────────────────────────────────────────────
const getResponsiveX = () => {
  const distance = 27;
  const fov = 30;
  const visibleHeight = 2 * Math.tan((fov * Math.PI) / 360) * distance;
  const visibleWidth = visibleHeight * (window.innerWidth / window.innerHeight);
  return visibleWidth * 0.25;
};

function App() {
  const [isModelReady, setIsModelReady] = useState(false);

  const mainRef = useRef(null);
  const capRef  = useRef(null);
  const canvasWrapperRef = useRef(null); // <-- NEW: Ref for the HTML container

  useLayoutEffect(() => {
    if (!capRef.current || !isModelReady) return;

    // A slight delay ensures React has injected all child components (like Products/Footer) 
    // before GSAP calculates the page height.
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    const ctx = gsap.context(() => {

      // ── 0. Initial state ─────────────────────────────────────────────────
      gsap.set(capRef.current.position, { x: 30, y: 0, z: 0 });
      gsap.set(capRef.current.scale, { x: 0, y: 0, z: 0 });

      // ── 1. Intro: scale in + fly into RIGHT 50% slot ─────────────────────
      gsap.to(capRef.current.position, {
        x: () => getResponsiveX(),
        z: 0,
        duration: 1.5,
        ease: "power3.inOut",
        invalidateOnRefresh: true,
      });
      gsap.to(capRef.current.scale, {
        x: 1.98, y: 1.98, z: 1.98,
        duration: 1.5,
        ease: "power3.inOut",
      });

      // ── 2. About: model sweeps LEFT ───────────────────────────────────────
      gsap.timeline({
        scrollTrigger: {
          trigger: "#about",
          start: "top bottom",
          end: "top top",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      }).to(capRef.current.position, {
        x: () => -getResponsiveX(),
        ease: "none",
        invalidateOnRefresh: true,
      });

      // ── 3. Clients section: sweep model back to right side ──────────────
      gsap.timeline({
        scrollTrigger: {
          trigger: "#clients",
          start: "top bottom",
          end: "top top",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      }).to(capRef.current.position, {
        x: () => getResponsiveX(),
        ease: "none",
        invalidateOnRefresh: true,
      });

      // ── 4. Products section enters: model stays right ───────────────────
      gsap.timeline({
        scrollTrigger: {
          trigger: "#product-section",
          start: "top bottom",
          end: "top top",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      }).to(capRef.current.position, {
        x: () => getResponsiveX(),
        ease: "none",
        invalidateOnRefresh: true,
      });

      // ── 5. THE FIX: Move the entire HTML wrapper up, NOT the 3D model ───
      if (canvasWrapperRef.current) {
        gsap.to(canvasWrapperRef.current, {
          yPercent: -100, // Slides the entire fixed canvas div up by 100% of its height
          ease: "none",
          scrollTrigger: {
            trigger: "#footer-tripwire",
            start: "top bottom", 
            end: () => `+=${window.innerHeight}`, 
            scrub: true, // No delay, strictly locked to scroll
            invalidateOnRefresh: true,
          },
        });
      }

    }, mainRef);

    return () => ctx.revert();
  }, [isModelReady]);

  return (
    <Routes>
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/clients" element={<ClientsSection />} />
      <Route path="/about" element={<AboutSection />} />

      <Route
        path="*"
        element={
          <div ref={mainRef} className="relative w-full bg-black text-white">
            <Overlay />

            {/* NEW: Attached the ref directly to the HTML container */}
            <div ref={canvasWrapperRef} className="fixed inset-0 z-0 pointer-events-none">
              <Canvas
                shadows
                camera={{ position: [0, 6, 27], fov: 30 }}
                gl={{
                  antialias: true,
                  toneMapping: THREE.ACESFilmicToneMapping,
                  toneMappingExposure: 1.0,
                }}
              >
                <Scene
                  capRef={capRef}
                  onModelReady={() => setIsModelReady(true)}
                />
              </Canvas>
            </div>

            <main className="relative z-10">
              {/* Hero */}
              <section
                id="hero"
                className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pointer-events-none"
              >
                <HeroSection isModelReady={isModelReady} />
              </section>

              {/* About */}
              <section
                id="about"
                className="min-h-screen pointer-events-auto overflow-hidden pt-[100px] flex items-center bg-transparent"
              >
                <AboutSection />
              </section>

              {/* Clients */}
              <ClientsSection capRef={capRef} />

              {/* Products */}
              <ProductGateway />

              {/* 🚨 THE TRIPWIRE 🚨 */}
              <div id="footer-tripwire" className="h-[1px] w-full bg-transparent pointer-events-none" />

              {/* Footer */}
              <Footer />

            </main>
          </div>
        }
      />
    </Routes>
  );
}

export default App;