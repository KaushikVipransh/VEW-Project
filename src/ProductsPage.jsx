import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

import MoldedPart from './MoldedPart';
import ExplodeLines from './ExplodeLines';
import products from './products';

/* ─────────────────────────────────────────────────────────────────────────────
   ProductScene  — self-contained Three.js scene for the catalogue viewer.
   Receives explodeProgress [0..1] via prop and drives the 4-part disassembly.
   Camera: position [0, 0, 30], fov 30  (matches the spec)
   Model:  position [0, 0, 0],  rotation [0, 0.7, 0]
   Light:  Studio Yellow Spotlight
   ───────────────────────────────────────────────────────────────────────────── */
const EXPLODE_AMT = 3.0;
const BAND_REST_Y = -0.35;

function ProductScene({ explodeProgress, capRef, onModelReady }) {
  const blackMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#050505',
    roughness: 0.75,
    metalness: 0.05,
    ior: 1.46,
    clearcoat: 0.4,
    clearcoatRoughness: 0.2,
    envMapIntensity: 0.2,
  }), []);

  const blueMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#2563eb',
    roughness: 0.6,
    metalness: 0.0,
    envMapIntensity: 0.5,
  }), []);

  // Idle bob
  useFrame((state) => {
    if (!capRef.current) return;
    const t = state.clock.getElapsedTime();
    capRef.current.position.y = Math.sin(t * 1.2) * 0.15;
  });

  // Drive explosion from prop
  useEffect(() => {
    if (!capRef.current) return;
    let topMesh = null, bodyMesh = null, bandMesh = null, ridgesMesh = null;
    capRef.current.traverse((child) => {
      if (!child.isMesh) return;
      if (child.userData.explodePart === 'top')    topMesh    = child;
      if (child.userData.explodePart === 'body')   bodyMesh   = child;
      if (child.userData.explodePart === 'band')   bandMesh   = child;
      if (child.userData.explodePart === 'ridges') ridgesMesh = child;
    });
    if (!topMesh || !bodyMesh || !bandMesh) return;

    const p = explodeProgress;
    topMesh.position.y    = p * EXPLODE_AMT;
    bodyMesh.position.y   = 0;
    bandMesh.position.y   = BAND_REST_Y - p * EXPLODE_AMT;
    if (ridgesMesh) ridgesMesh.position.y = p * EXPLODE_AMT * 0.5;
  }, [explodeProgress, capRef]);

  return (
    <>
      {/* Studio Yellow Spotlight */}
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
        scale={1.98}
        rotation={[0, 0.7, 0]}
      >
        <MoldedPart
          blackPlasticMaterial={blackMat}
          blueBandMaterial={blueMat}
          onModelReady={onModelReady}
        />
        <ExplodeLines capRef={capRef} />
      </group>

      <ContactShadows opacity={0.4} scale={10} blur={2.0} far={4} position={[0, -2.2, 0]} />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ProductsPage
   ───────────────────────────────────────────────────────────────────────────── */
export default function ProductsPage() {
  const [activeId, setActiveId]               = useState(1);
  const [isModelReady, setIsModelReady]       = useState(false);
  const [explodeProgress, setExplodeProgress] = useState(0);

  const capRef   = useRef(null);
  const tweenRef = useRef({ val: 0 });

  const activeProduct = products.find((p) => p.id === activeId) ?? products[0];

  // ── Trigger explosion when model is ready (auto-explode once) ─────────────
  useLayoutEffect(() => {
    if (!isModelReady) return;
    // Animate to 0.65 exploded so parts are visibly separated but not too far
    gsap.to(tweenRef.current, {
      val: 0.65,
      duration: 2.2,
      ease: 'power3.inOut',
      onUpdate: () => setExplodeProgress(tweenRef.current.val),
    });
  }, [isModelReady]);

  // ── Hover on card re-triggers a little "burst" animation ──────────────────
  const handleCardClick = (id) => {
    setActiveId(id);
    gsap.killTweensOf(tweenRef.current);
    gsap.to(tweenRef.current, {
      val: 0,
      duration: 0.4,
      ease: 'power2.in',
      onUpdate: () => setExplodeProgress(tweenRef.current.val),
      onComplete: () => {
        gsap.to(tweenRef.current, {
          val: 0.65,
          duration: 1.6,
          ease: 'power3.out',
          onUpdate: () => setExplodeProgress(tweenRef.current.val),
        });
      },
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#050505',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: "'Geist Variable', sans-serif",
      }}
    >
      {/* ── Google Fonts: JetBrains Mono ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');

        .card-thumb {
          aspect-ratio: 1 / 1;
          background: #0e0e0e;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          overflow: hidden;
          cursor: pointer;
          transition: border-color 0.25s, box-shadow 0.25s, transform 0.2s;
          position: relative;
        }
        .card-thumb:hover {
          border-color: rgba(212,175,55,0.4);
          transform: scale(1.03);
        }
        .card-thumb.active {
          border-color: rgba(212,175,55,0.85);
          box-shadow: 0 0 18px rgba(212,175,55,0.25);
        }
        .card-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .card-label {
          font-size: 10px;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.55);
          text-align: center;
          margin-top: 6px;
          text-transform: uppercase;
        }
        .spec-key {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .spec-val {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: rgba(255,255,255,0.88);
          margin-bottom: 14px;
          line-height: 1.4;
        }
        .corner-dot::before {
          content: '';
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(212,175,55,0.7);
        }
        .corner-tl::before { top: 6px; left: 6px; }
        .corner-tr::before { top: 6px; right: 6px; }
        .corner-bl::before { bottom: 6px; left: 6px; }
        .corner-br::before { bottom: 6px; right: 6px; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .fade-in-up {
          animation: fadeInUp 0.45s ease forwards;
        }

        /* Scrollbar for gallery */
        .gallery-scroll::-webkit-scrollbar { width: 3px; }
        .gallery-scroll::-webkit-scrollbar-track { background: transparent; }
        .gallery-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
      `}</style>

      {/* ── GLOBAL HEADER ─────────────────────────────────────────────────── */}
      <header
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 28px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        {/* Back link */}
        <Link
          to="/"
          style={{
            fontSize: 11,
            letterSpacing: '0.18em',
            color: 'rgba(255,255,255,0.45)',
            textDecoration: 'none',
            textTransform: 'uppercase',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(212,175,55,0.85)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
        >
          ← BACK
        </Link>

        {/* Centred title */}
        <h1
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            margin: 0,
            fontWeight: 800,
            fontSize: 'clamp(14px, 1.5vw, 20px)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#fff',
            whiteSpace: 'nowrap',
          }}
        >
          PRODUCT&nbsp;CATALOGUE
        </h1>

        {/* Vardhman brand */}
        <span
          style={{
            fontSize: 11,
            letterSpacing: '0.14em',
            color: 'rgba(255,255,255,0.35)',
            textTransform: 'uppercase',
          }}
        >
          VEW
        </span>
      </header>

      {/* ── THREE-COLUMN BODY ─────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          paddingTop: 70,   // header height
          paddingBottom: 52, // footer height
          overflow: 'hidden',
        }}
      >
        {/* ── LEFT: Product Gallery (25%) ─────────────────────────────────── */}
        <aside
          className="gallery-scroll"
          style={{
            width: '25%',
            padding: '20px 16px 20px 20px',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
          }}
        >
          {/* Section label */}
          <p
            style={{
              fontSize: 9,
              letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.25)',
              textTransform: 'uppercase',
              marginBottom: 14,
            }}
          >
            SELECT&nbsp;PRODUCT
          </p>

          {/* 2-column grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
            }}
          >
            {products.map((product) => (
              <div key={product.id}>
                <div
                  className={`card-thumb corner-dot corner-tl corner-tr corner-bl corner-br${activeId === product.id ? ' active' : ''}`}
                  style={{ position: 'relative' }}
                  onClick={() => handleCardClick(product.id)}
                  role="button"
                  aria-label={`Select ${product.name}`}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleCardClick(product.id)}
                >
                  <img
                    src={`/src/assets/catalogue/${product.image}`}
                    alt={product.name}
                    loading="lazy"
                  />
                  {/* Gold shimmer overlay on active */}
                  {activeId === product.id && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, transparent 60%)',
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                </div>
                <p className="card-label">{product.name}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* ── CENTER: 3D Viewer (50%) ─────────────────────────────────────── */}
        <main
          style={{
            width: '50%',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Corner bracket decorations */}
          {[
            { top: 12, left: 12, borderTop: '1.5px solid rgba(212,175,55,0.35)', borderLeft: '1.5px solid rgba(212,175,55,0.35)' },
            { top: 12, right: 12, borderTop: '1.5px solid rgba(212,175,55,0.35)', borderRight: '1.5px solid rgba(212,175,55,0.35)' },
            { bottom: 12, left: 12, borderBottom: '1.5px solid rgba(212,175,55,0.35)', borderLeft: '1.5px solid rgba(212,175,55,0.35)' },
            { bottom: 12, right: 12, borderBottom: '1.5px solid rgba(212,175,55,0.35)', borderRight: '1.5px solid rgba(212,175,55,0.35)' },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: 16,
                height: 16,
                zIndex: 10,
                ...s,
              }}
            />
          ))}

          {/* Crosshair centre point */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              width: 20,
              height: 20,
              pointerEvents: 'none',
            }}
          >
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(212,175,55,0.2)' }} />
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(212,175,55,0.2)' }} />
          </div>

          {/* Loading indicator */}
          {!isModelReady && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 20,
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  border: '2px solid rgba(255,255,255,0.1)',
                  borderTop: '2px solid rgba(212,175,55,0.8)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <p style={{ fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
                Loading Model…
              </p>
            </div>
          )}

          {/* Three.js Canvas */}
          <Canvas
            shadows
            camera={{ position: [0, 0, 30], fov: 30 }}
            gl={{
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.0,
            }}
            style={{ width: '100%', height: '100%', display: 'block' }}
          >
            <ProductScene
              explodeProgress={explodeProgress}
              capRef={capRef}
              onModelReady={() => setIsModelReady(true)}
            />
          </Canvas>

          {/* Blueprint label */}
          <div
            style={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 9,
              letterSpacing: '0.22em',
              color: 'rgba(255,255,255,0.18)',
              textTransform: 'uppercase',
              pointerEvents: 'none',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            EXPLODED VIEW — {activeProduct.code}
          </div>

          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
        </main>

        {/* ── RIGHT: Tech Specs Panel (25%) ──────────────────────────────── */}
        <aside
          style={{
            width: '25%',
            padding: '20px 20px 20px 24px',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflowY: 'auto',
          }}
        >
          <div key={activeProduct.id} className="fade-in-up">
            {/* Section label */}
            <p style={{
              fontSize: 9,
              letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.22)',
              textTransform: 'uppercase',
              marginBottom: 22,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              Technical Data
            </p>

            {/* Spec Header */}
            <div style={{ marginBottom: 26 }}>
              <p className="spec-key">SPECIFICATIONS</p>
              <p
                className="spec-val"
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#fff',
                  letterSpacing: '0.06em',
                  marginBottom: 0,
                }}
              >
                {activeProduct.code}
              </p>
              <div style={{ marginTop: 6, width: 32, height: 2, background: 'rgba(212,175,55,0.6)', borderRadius: 1 }} />
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: 22 }} />

            {/* Spec rows */}
            {[
              { key: 'MATERIAL',     val: activeProduct.material },
              { key: 'WEIGHT',       val: `${activeProduct.weight}g ± 0.05g` },
              { key: 'NECK FINISH',  val: activeProduct.neckFinish },
              { key: 'APPLICATION',  val: activeProduct.application },
              { key: 'LINER',        val: activeProduct.liner },
              { key: 'TORQUE RANGE', val: `${activeProduct.torque} Nm` },
            ].map(({ key, val }) => (
              <div key={key}>
                <p className="spec-key">{key}</p>
                <p className="spec-val">{val}</p>
              </div>
            ))}
          </div>

          {/* REQUEST QUOTE button */}
          <div style={{ paddingTop: 16 }}>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: 18 }} />
            <button
              id="request-quote-btn"
              style={{
                width: '100%',
                padding: '14px 0',
                background: 'linear-gradient(100deg, #c9982a 0%, #e8c95a 50%, #c9982a 100%)',
                backgroundSize: '200% 100%',
                color: '#0a0800',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                border: 'none',
                borderRadius: 100,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                transition: 'background-position 0.5s, box-shadow 0.3s, transform 0.2s',
                boxShadow: '0 4px 24px rgba(212,175,55,0.25)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundPosition = '100% 0';
                e.currentTarget.style.boxShadow = '0 6px 32px rgba(212,175,55,0.45)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundPosition = '0% 0';
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(212,175,55,0.25)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              REQUEST QUOTE
              {/* Small diamond icon */}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 0L8 5H12L8.5 8L10 12L6 9.5L2 12L3.5 8L0 5H4L6 0Z" fill="#0a0800" fillOpacity="0.7" />
              </svg>
            </button>

            {/* Sub-note */}
            <p
              style={{
                textAlign: 'center',
                fontSize: 9,
                letterSpacing: '0.12em',
                color: 'rgba(255,255,255,0.2)',
                textTransform: 'uppercase',
                marginTop: 10,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              0.01mm Precision Engineering
            </p>
          </div>
        </aside>
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 50,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <p
          style={{
            fontSize: 9,
            letterSpacing: '0.18em',
            color: 'rgba(255,255,255,0.2)',
            textTransform: 'uppercase',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          Copyright © 2026 Vardhman Engineering Works&nbsp;|&nbsp;Bawana, Delhi
          &nbsp;|&nbsp;0.01mm Precision Engineering
        </p>
      </footer>
    </div>
  );
}
