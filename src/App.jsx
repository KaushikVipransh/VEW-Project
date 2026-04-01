import { useState } from "react";
import Overlay from "./Overlay";
import AboutSection from "./AboutSection";
import { CTASection } from "./components/ui/hero-dithering-card";

function App() {
  const [isModelReady, setIsModelReady] = useState(false);

  return (
    <>
      <Overlay />
      
      <section id="hero" className="relative z-10 overflow-hidden w-full min-h-screen flex flex-col justify-center items-center px-4 py-12 md:py-16 pointer-events-none">
        <div className="relative z-10 pointer-events-none w-full flex-grow flex items-center justify-center">
          <CTASection isModelReady={isModelReady} />
        </div>
      </section>

      <div className="relative z-20 pointer-events-none bg-black">
        <section id="about" className="min-h-screen pointer-events-auto overflow-hidden pt-[100px]">
          <AboutSection isModelReady={isModelReady} setIsModelReady={setIsModelReady} />
        </section>
      </div>
    </>
  );
}

export default App;