import React, { useRef, useEffect } from "react";
import gsap from "gsap";

const AboutSection = () => {
  const sectionRef = useRef(null);
  const rightPanelRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        end: "top top",
        scrub: 1,
      },
    });

    tl.fromTo(rightPanelRef.current, { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 1 });
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="about"
      className="relative w-full min-h-screen flex items-center pointer-events-none overflow-hidden bg-transparent pt-[100px]"
    >
      {/* Left slot — transparent window into the 3D canvas/model */}
      <div className="hidden md:block md:w-1/2 h-screen pointer-events-none bg-transparent" />

      {/* Right slot — text content, right-aligned, centered vertically in right half */}
      <div 
        ref={rightPanelRef}
        className="w-full md:w-1/2 flex flex-col items-end justify-center pr-[6vw] pl-12 py-16 z-20 pointer-events-auto"
      >
        <h2 className="text-white font-black uppercase text-right leading-tight mb-10 text-5xl md:text-6xl lg:text-7xl tracking-tight">
          25 Years<br />
          of Excellence
        </h2>
        <p className="text-gray-400 text-lg leading-relaxed max-w-md text-right">
          Vardhman Engineering Works began with a simple vision: to provide high-quality plastic bottle caps to India's growing bottle manufacturing industry.
          Starting from a small workshop in Delhi’s Bawana Industrial Area, we have grown into a trusted partner for major bottle manufacturers across the country.
          Our 25 years of experience has taught us that success in this business isn't just about making caps—it's about understanding our clients' needs and delivering reliable, consistent quality at scale.
        </p>
      </div>
    </section>
  );
};

export default AboutSection;

