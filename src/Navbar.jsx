/* eslint-disable react/no-unknown-property */
const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-8 flex justify-between items-center pointer-events-auto backdrop-blur-sm h-20 border-b border-white/10">
      {/* Left Side: Logo */}
      <p className="text-white font-bold uppercase tracking-[0.3em]">VEW</p>

      {/* Right Side: Navigation Links */}
      <div className="flex items-center gap-8">
        <a href="#about" className="text-white/70 hover:text-white transition-colors duration-300">
          About Us
        </a>
        <a href="#" className="text-white/70 hover:text-white transition-colors duration-300">
          Our Products
        </a>
        <a href="#" className="text-white/70 hover:text-white transition-colors duration-300">
          Our Clients
        </a>
        <button className="px-4 py-2 border border-white/20 text-white/70 rounded-md hover:bg-white hover:text-black transition-colors duration-300">
          Contact
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
