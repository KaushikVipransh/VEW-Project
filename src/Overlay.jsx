import Navbar from "./Navbar";

const Overlay = ({ heroTitleRef, heroSublineRef }) => {
  return (
    <div className="absolute inset-0 z-10 w-full h-full pointer-events-none">
      <Navbar />
      <div className="grid grid-cols-2 h-full">
        <div></div>
        <div className="flex flex-col justify-center items-start h-full text-left pointer-events-auto">
          <h1
            ref={heroTitleRef}
            className="text-white text-7xl font-serif tracking-tighter opacity-0"
          >
            VARDHMAN ENGINEERING WORKS
          </h1>
          <h2
            ref={heroSublineRef}
            className="text-white text-xl mt-4 opacity-0"
          >
            Pioneering the future of precision closure systems.
          </h2>
        </div>
      </div>
    </div>
  );
};

export default Overlay;