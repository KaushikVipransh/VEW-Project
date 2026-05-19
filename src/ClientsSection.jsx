import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Client Logo Data ─────────────────────────────────────────────────────────
// Using SVG text-based logos since external images may not be available.
// Each entry has a name and a brand colour (used on hover).
const CLIENTS = [
  { name: "MILTON",      color: "#e63946", abbr: "Milton"     },
  { name: "CELLO",       color: "#2563eb", abbr: "cello"      },
  { name: "TUPPERWARE",  color: "#e07b00", abbr: "Tupperware®"},
  { name: "NAYASA",      color: "#16a34a", abbr: "NAYASA"     },
  { name: "PRINCEWARE",  color: "#7c3aed", abbr: "Princeware®"},
  { name: "NEELAM",      color: "#dc2626", abbr: "नीलम"       },
  { name: "HAPPY HOME",  color: "#0284c7", abbr: "HappyHome"  },
  { name: "VARMORA",     color: "#b45309", abbr: "Varmora"    },
];

// Duplicate the array so the marquee loops seamlessly
const MARQUEE_ITEMS = [...CLIENTS, ...CLIENTS, ...CLIENTS];

// ─── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ target, suffix, label, inView }) {
  const [value, setValue] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (!inView) return;
    const duration = 1800; // ms
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // ease out expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Math.floor(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [inView, target]);

  return (
    <div className="flex flex-col items-center gap-2">
      <span
        style={{
          fontFamily: "'Geist Variable', sans-serif",
          fontSize: "clamp(3rem, 6vw, 4.5rem)",
          fontWeight: 900,
          color: "#ffffff",
          lineHeight: 1,
          letterSpacing: "-0.03em",
        }}
      >
        {value}{suffix}
      </span>
      <span
        style={{
          fontSize: "0.65rem",
          letterSpacing: "0.22em",
          color: "rgba(255,255,255,0.38)",
          textTransform: "uppercase",
          fontWeight: 700,
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Logo Chip ────────────────────────────────────────────────────────────────
function LogoChip({ client }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 160,
        height: 64,
        padding: "0 28px",
        margin: "0 16px",
        border: `1px solid ${hovered ? client.color + "55" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 6,
        cursor: "default",
        transition: "border-color 0.35s, filter 0.35s, background 0.35s",
        background: hovered ? client.color + "0d" : "transparent",
        filter: hovered ? "grayscale(0%)" : "grayscale(100%)",
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      <span
        style={{
          fontFamily: "'Geist Variable', sans-serif",
          fontWeight: 800,
          fontSize: "1.05rem",
          letterSpacing: "0.06em",
          color: hovered ? client.color : "rgba(255,255,255,0.55)",
          transition: "color 0.35s",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {client.abbr}
      </span>
    </div>
  );
}

// ─── ClientsSection ───────────────────────────────────────────────────────────
/**
 * Props:
 *   capRef  — the top-level Three.js group ref from App.jsx
 *             We use a ScrollTrigger here to drive a 360° Y-rotation
 *             on the 3D model as the user scrolls through this section.
 */
const ClientsSection = ({ capRef }) => {
  const sectionRef    = useRef(null);
  const trackRef      = useRef(null);   // inner marquee track (animated via CSS)
  const statsRef      = useRef(null);
  const [inView, setInView] = useState(false);

  // ── 1. Text reveal on scroll ──────────────────────────────────────────────
  useEffect(() => {
    const heading = sectionRef.current?.querySelector(".clients-heading");
    const sub     = sectionRef.current?.querySelector(".clients-sub");

    if (!heading || !sub) return;

    gsap.fromTo(
      [heading, sub],
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.18,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );
  }, []);

  // ── 2. Stats appear + counter starts ─────────────────────────────────────
  useEffect(() => {
    if (!statsRef.current) return;

    ScrollTrigger.create({
      trigger: statsRef.current,
      start: "top 85%",
      onEnter: () => setInView(true),
    });
  }, []);

  // ── 3. 3D model: 360° Y-rotation while scrolling through this section ─────
  useEffect(() => {
    if (!capRef?.current) return;

    // Store the original Y rotation so we can return to it after leaving
    const originalRotationY = capRef.current.rotation.y; // 0.7 from Scene.jsx

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.2,
        invalidateOnRefresh: true,
        onLeaveBack: () => {
          // Snap back to original rotation when scrolling back above the section
          gsap.to(capRef.current.rotation, {
            y: originalRotationY,
            duration: 0.8,
            ease: "power2.out",
          });
        },
      },
    });

    // Full 360° rotation (2π radians) + keep original offset
    tl.to(capRef.current.rotation, {
      y: originalRotationY + Math.PI * 2,
      ease: "none",
    });

    return () => {
      tl.kill();
    };
  }, [capRef]);

  return (
    <section
      ref={sectionRef}
      id="clients"
      className="relative w-full bg-black overflow-hidden"
      style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
    >
      {/* ── Heading ── */}
      <div className="flex flex-col items-center pt-20 pb-12 px-6 pointer-events-none">
        <h2
          className="clients-heading"
          style={{
            fontFamily: "'Geist Variable', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(2rem, 5.5vw, 4rem)",
            textTransform: "uppercase",
            color: "#ffffff",
            letterSpacing: "-0.02em",
            textAlign: "center",
            opacity: 0,
          }}
        >
          Trusted by Industry Leaders
        </h2>
        <p
          className="clients-sub"
          style={{
            marginTop: 18,
            fontSize: "0.68rem",
            letterSpacing: "0.22em",
            color: "rgba(255,255,255,0.36)",
            textTransform: "uppercase",
            textAlign: "center",
            maxWidth: 560,
            lineHeight: 1.8,
            opacity: 0,
          }}
        >
          Powering the supply chains of India's most recognized brands
          for over two decades.
        </p>
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />

      {/* ── Logo Marquee ── */}
      <div
        style={{
          width: "100%",
          overflow: "hidden",
          padding: "36px 0",
          // Fade edges
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)",
          maskImage:
            "linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)",
        }}
      >
        <style>{`
          @keyframes marquee-scroll {
            from { transform: translateX(0); }
            to   { transform: translateX(-33.3333%); }
          }
          .marquee-track {
            display: inline-flex;
            animation: marquee-scroll 28s linear infinite;
            will-change: transform;
          }
          .marquee-track:hover {
            animation-play-state: paused;
          }
        `}</style>
        <div className="marquee-track" ref={trackRef}>
          {MARQUEE_ITEMS.map((client, i) => (
            <LogoChip key={`${client.name}-${i}`} client={client} />
          ))}
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />

      {/* ── Stats Row ── */}
      <div
        ref={statsRef}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          padding: "52px 6vw 64px",
        }}
      >
        {[
          { target: 100, suffix: "+", label: "Enterprise Clients"       },
          { target: 1,   suffix: "M+", label: "Caps Manufactured Monthly" },
          { target: 25,  suffix: "+", label: "Years of Excellence"       },
        ].map((stat, i) => (
          <React.Fragment key={stat.label}>
            <Counter {...stat} inView={inView} />
            {/* Vertical divider between stats */}
            {i < 2 && (
              <div
                style={{
                  position: "absolute",
                  // handled via grid gap — use border instead
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

export default ClientsSection;