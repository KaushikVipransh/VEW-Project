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

gsap.registerPlugin(ScrollTrigger);

// ─── Responsive X helper ─────────────────────────────────────────────────────
// Camera: fov=30, z=27.  Visible-width math gives us the world-unit centre of
// each 50% screen partition so the model lands exactly in the slot.
const getResponsiveX = () => {
  const distance = 27;
  const fov = 30;
  const visibleHeight = 2 * Math.tan((fov * Math.PI) / 360) * distance;
  const visibleWidth = visibleHeight * (window.innerWidth / window.innerHeight);
  return visibleWidth * 0.25; // centre of either the left or right 50%
};

function App() {
  const [isModelReady, setIsModelReady] = useState(false);

  // ── Refs ────────────────────────────────────────────────────────────────
  const mainRef = useRef(null); // GSAP context scope
  const capRef = useRef(null); // top-level Three.js group for the cap assembly

  // ── All GSAP timelines ────────────────────────────────────────────────────
  useLayoutEffect(() => {
    if (!capRef.current || !isModelReady) return;

    const ctx = gsap.context(() => {

      // ── 0. Initial state ─────────────────────────────────────────────────
      gsap.set(capRef.current.position, { x: 30, z: 0 });
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

      // ── 3. Products section enters: model sweeps to x=5.5 (right slot) ───
      gsap.timeline({
        scrollTrigger: {
          trigger: "#product-section",
          start: "top bottom",
          end: "top top",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      }).to(capRef.current.position, {
        x: () => getResponsiveX(),   // exact centre of the right 50% slot
        ease: "none",
        invalidateOnRefresh: true,
      });

      // ── 4. Explosion: traverse the cap group to find meshes by userData ──
      // This avoids the timing race where mesh refs are null during useLayoutEffect.
      // By this point (after onModelReady fires from a useEffect), meshes are
      // guaranteed to exist in the Three.js scene graph.
      let topMesh = null, bodyMesh = null, bandMesh = null, ridgesMesh = null;
      capRef.current.traverse((child) => {
        if (!child.isMesh) return;
        if (child.userData.explodePart === 'top') topMesh = child;
        if (child.userData.explodePart === 'body') bodyMesh = child;
        if (child.userData.explodePart === 'band') bandMesh = child;
        if (child.userData.explodePart === 'ridges') ridgesMesh = child;
      });

      if (!topMesh || !bodyMesh || !bandMesh) {
        console.warn('[App] Explosion: could not find all part meshes via traverse.');
        return;
      }

      // Record the band's resting y so we offset from it correctly
      const bandRestY = bandMesh.position.y; // -0.35

      // Reset all parts to assembled state
      gsap.set(topMesh.position, { y: 0 });
      gsap.set(bodyMesh.position, { y: 0 });
      gsap.set(bandMesh.position, { y: bandRestY });
      if (ridgesMesh) gsap.set(ridgesMesh.position, { y: 0 });

      // Explosion layers (local units × scale 1.98 = world units):
      //   Top cap    +EXPLODE      ↑ fully up
      //   Ridges     +EXPLODE*0.5  ↑ halfway — the grip ring separates from the skirt
      //   Body skirt  0             stays centre
      //   Blue band  −EXPLODE      ↓ fully down
      const EXPLODE = 3.0;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#product-section",
          start: "top 60%",
          end: "bottom 40%",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(topMesh.position, { y: EXPLODE, ease: "power2.inOut" }, 0)
        .to(bodyMesh.position, { y: 0, ease: "none" }, 0)
        .to(bandMesh.position, { y: bandRestY - EXPLODE, ease: "power2.inOut" }, 0);

      if (ridgesMesh) {
        tl.to(ridgesMesh.position, { y: EXPLODE * 0.5, ease: "power2.inOut" }, 0);
      }

    }, mainRef);

    return () => ctx.revert();
  }, [isModelReady]);

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <Routes>
      {/* ── /products → catalog page (placeholder) ── */}
      <Route path="/products" element={<ProductsPage />} />

      {/* ── / (and all other paths) → main landing ── */}
      <Route
        path="*"
        element={
          <div ref={mainRef} className="relative w-full bg-black text-white">
            <Overlay />

            {/* Fixed full-screen Canvas — sits beneath everything */}
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
                <Scene
                  capRef={capRef}
                  onModelReady={() => setIsModelReady(true)}
                />
              </Canvas>
            </div>

            <main className="relative z-10">
              {/* Hero — 3D model is in the RIGHT 50% slot */}
              <section
                id="hero"
                className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pointer-events-none"
              >
                <HeroSection isModelReady={isModelReady} />
              </section>

              {/* About — 3D model sweeps to the LEFT 50% slot */}
              <section
                id="about"
                className="min-h-screen pointer-events-auto overflow-hidden pt-[100px] flex items-center bg-transparent"
              >
                <AboutSection />
              </section>

              {/* Products — 3D model returns RIGHT and explodes */}
              <ProductGateway />
            </main>
          </div>
        }
      />
    </Routes>
  );
}

export default App;