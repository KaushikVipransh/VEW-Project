import React from "react";

export function HeroSection({ isModelReady }) {
  return (
    /**
     * Outer wrapper:
     *  - isModelReady=false  → justify-center   (text dead-center on screen)
     *  - isModelReady=true   → justify-start    (block anchors to the left edge,
     *                                             occupying the Left 50% partition)
     *
     * Note: justify-content doesn't animate, but the INNER block's transition
     * (width / padding / alignment) still creates a smooth visual shift.
     */
    <div
      className={`
        relative w-full h-full flex items-center pointer-events-none
        ${isModelReady ? "justify-start" : "justify-center"}
      `}
    >
      {/* Inner content block */}
      <div
        className={`
          flex flex-col transition-all duration-1000 ease-in-out
          ${isModelReady
            ? "items-start text-left w-[50vw] pl-16 pr-8"   /* fills the left 50% slot */
            : "items-center text-center w-[90vw] mx-auto"    /* full-width centred state */
          }
        `}
      >
        {/* Industrial Tag */}
        <div className="mb-6">
          <span className="text-[11px] font-black tracking-[0.5em] text-white/70 uppercase">
            Industrial Precision
          </span>
        </div>

        {/* Main Heading — wide, expansive, all-caps */}
        <h1
          className={`
            font-sans font-black uppercase text-white
            leading-[1.05] tracking-tight
            transition-all duration-1000 ease-in-out
            ${isModelReady
              ? "text-5xl lg:text-6xl xl:text-7xl"
              : "text-6xl md:text-8xl lg:text-9xl"
            }
          `}
        >
          {isModelReady ? (
            <>Vardhman<br />Engineering<br />Works</>
          ) : (
            "Vardhman Engineering Works"
          )}
        </h1>

        {/* Description */}
        <p
          className={`
            mt-8 text-gray-400 font-light leading-relaxed tracking-wide
            transition-all duration-1000 ease-in-out
            ${isModelReady ? "text-base max-w-xs" : "text-lg max-w-2xl"}
          `}
        >
          Explore the pinnacle of Bottle Caps Manufacturing.
          {isModelReady ? <><br />In-house assembly, durable, and uniquely yours.</> : " In-house assembly, durable, and uniquely yours."}
        </p>

        {/* Ghost Button */}
        <button
          className="
            pointer-events-auto
            mt-12 px-10 py-3 border border-white/30 rounded-lg
            text-xs font-bold text-white uppercase tracking-widest
            hover:bg-white hover:text-black
            transition-all duration-300
          "
        >
          View Products
        </button>
      </div>
    </div>
  );
}
