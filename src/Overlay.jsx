import Navbar from "./Navbar";

const Overlay = () => {
  return (
    <div className="fixed top-0 left-0 z-[100] w-full pointer-events-none">
      <Navbar />
    </div>
  );
};

export default Overlay;