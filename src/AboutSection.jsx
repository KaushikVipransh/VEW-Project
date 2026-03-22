import React, { useRef, useEffect } from "react";
import gsap from "gsap";

const AboutSection = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const bodyRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const body = bodyRef.current;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        end: "top top",
        scrub: 1,
      },
    });

    tl.fromTo(
      [heading, body],
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, stagger: 0.2, duration: 1 }
    );
  }, []);

  return (
    <div
      ref={sectionRef}
      className="w-full h-full flex items-center justify-center"
    >
      <div className="w-1/2 text-white">
        <h2 ref={headingRef} className="text-4xl font-bold font-serif">
          Engineering Precision Since 2002
        </h2>
        <p ref={bodyRef} className="mt-4">
          At Vardhman Engineering Works, we specialize in high-tolerance plastic
          closure systems. Our commitment to 0.01mm accuracy ensures that every
          cap we manufacture meets global standards for the beverage and
          medical industries.
        </p>
      </div>
      <div className="w-1/2"></div>
    </div>
  );
};

export default AboutSection;
