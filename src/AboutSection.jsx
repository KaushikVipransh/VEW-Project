import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const AboutSection = () => {
  const sectionRef = useRef(null);
  const headingWrapperRef = useRef(null);
  const paragraphRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      
      // 1. Heading Masked Reveal
      gsap.from("h2", {
        yPercent: 120,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        scrollTrigger: {
          trigger: headingWrapperRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      // 2. Paragraph Staggered Fade
      gsap.from(paragraphRef.current.children, {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: paragraphRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={sectionRef} 
      // The wrapper takes the full width and height
      className="w-full h-full relative z-10 flex"
    >
      {/* This container strictly forces itself to the right 50% on desktop.
        On mobile (where the 3D model might be hidden or rearranged), it takes full width.
      */}
      <div className="w-full lg:w-1/2 ml-auto h-full flex flex-col justify-center px-8 md:px-16 lg:pr-[10%] gap-8">
        
        {/* HEADING */}
        <div ref={headingWrapperRef} className="overflow-hidden pb-2">
          <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white uppercase">
            25 Years of
            <br />
            <span className="text-white uppercase">Excellence</span>
          </h2>
        </div>

        {/* PARAGRAPH */}
        <div ref={paragraphRef} className="flex flex-col gap-6 text-gray-400 text-lg md:text-xl font-light leading-relaxed">
          <p>
            Vardhman Engineering Works began with a simple vision: to provide high-quality plastic bottle caps to India’s growing bottle manufacturing industry. 
          </p>
          <p>
            Starting from a small workshop in Delhi's Bawana Industrial Area, we have grown into a trusted partner for major brands across the country. 
          </p>
          <p>
            Our quarter-century of experience has taught us that success in this business is about understanding our clients’ needs and delivering reliable, consistent quality at scale.
          </p>
        </div>

      </div>
    </div>
  );
};

export default AboutSection;