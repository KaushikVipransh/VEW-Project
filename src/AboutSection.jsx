import React, { useRef, useEffect } from "react";
import gsap from "gsap";

const AboutSection = () => {
  const sectionRef = useRef(null);
  const leftPanelRef = useRef(null);
  const headingRef = useRef(null);
  const bodyRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const leftPanel = leftPanelRef.current;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        end: "top top",
        scrub: 1,
      },
    });

    tl.fromTo(
      leftPanel,
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 1 }
    );
  }, []);

  return (
    <div ref={sectionRef} className="w-full h-full flex">
      <div
        ref={leftPanelRef}
        className="w-1/2 h-full flex items-center justify-center p-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 to-transparent"
      >
        <div className="group w-full bg-white/[0.03] backdrop-blur-md border border-white/10 shadow-2xl p-10 text-white transition-all duration-500 group-hover:border-white/30 group-hover:backdrop-blur-lg">
          <h2 ref={headingRef} className="text-4xl font-bold font-serif">
            Engineering Precision Since 2002
          </h2>
          <p ref={bodyRef} className="mt-4">
            At Vardhman Engineering Works, we specialize in high-tolerance
            plastic closure systems. Our commitment to 0.01mm accuracy ensures
            that every cap we manufacture meets global standards for the
            beverage and medical industries. lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel sapien nec ipsum efficitur tincidunt. Curabitur ac ligula a nunc
            efficitur commodo. Donec in felis at enim efficitur convallis.
          </p>
        </div>
      </div>
      <div className="w-1/2"></div>
    </div>
  );
};

export default AboutSection;
