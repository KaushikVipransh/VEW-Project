import React from 'react';
import { Link } from 'react-router-dom';

const ProductGateway = () => {
  return (
    <section
      id="product-section"
      className="relative w-full min-h-screen flex items-center pointer-events-auto overflow-hidden bg-transparent"
    >
      {/* Left half — text content, sits on the site's global black background */}
      <div className="w-full md:w-1/2 flex flex-col justify-center pl-[6vw] pr-12 py-16 z-10">

        {/* Eyebrow label */}
        <p
          className="text-white uppercase font-bold mb-6"
          style={{ fontSize: '0.7rem', letterSpacing: '0.22em' }}
        >
          REQUEST CUSTOM QUOTE TODAY!
        </p>

        {/* Hero headline */}
        <h2
          className="text-white font-black uppercase leading-none mb-10"
          style={{
            fontSize: 'clamp(3.5rem, 7vw, 7.5rem)',
            lineHeight: '0.92',
            letterSpacing: '-0.02em',
          }}
        >
          VIEW OUR<br />PRODUCTS
        </h2>

        {/* Pill CTA */}
        <Link
          to="/products"
          className="
            self-start
            inline-flex items-center justify-center
            bg-white text-black
            font-bold uppercase
            text-sm
            px-14 py-4
            rounded-full
            border-2 border-white
            transition-all duration-300
            hover:bg-black hover:text-white
            cursor-pointer select-none
          "
          style={{ letterSpacing: '0.25em' }}
        >
          HERE
        </Link>
      </div>

      {/* Right half — transparent window into the canvas; 3D model explodes here */}
      <div className="hidden md:block md:w-1/2 h-screen pointer-events-none bg-transparent" />
    </section>
  );
};

export default ProductGateway;