import React, { useRef, useEffect } from "react";
import gsap from "gsap";

const AboutSection = () => {
  const sectionRef = useRef(null);
  const leftPanelRef = useRef(null);

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
  }, []);

  return (
    <div ref={sectionRef} className="w-full flex flex-col md:flex-row min-h-screen items-center px-10 gap-10 relative z-20 bg-transparent pointer-events-none">

      {/* Left slot — intentionally empty; the 3D model scroll-swaps into here */}
      <div className="w-full md:w-1/2 h-[650px] relative z-10 pointer-events-none" />

      {/* Right slot — text content */}
      <div ref={leftPanelRef} className="w-full md:w-1/2 flex items-center justify-start p-6 z-20 pointer-events-auto">
        <div className="w-full max-w-lg bg-white/[0.03] backdrop-blur-md border border-white/10 p-10 text-white rounded-xl shadow-2xl">
          <h2 className="text-4xl font-bold font-serif leading-tight">
            25 Years of Excellence
          </h2>
          <p className="mt-6 text-gray-400 leading-relaxed text-lg">
            Vardhman Engineering Works began with a simple vision: to provide high-quality plastic bottle caps to India's growing bottle manufacturing industry.
            Starting from a small workshop in Delhi’s Bawana Industrial Area, we have grown into a trusted partner for major bottle manufacturers across the country.
            Our 25 years of experience has taught us that success in this business isn't just about making caps-it’s about understanding our clients' needs and delivering reliable, consistent quality at scale.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;