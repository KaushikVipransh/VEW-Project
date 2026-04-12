import React from 'react';
import { Link } from 'react-router-dom';

/**
 * ProductsPage — Placeholder for the product catalog.
 * We'll flesh this out in a future session.
 */
const ProductsPage = () => {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-white"
      style={{ fontFamily: 'inherit' }}
    >
      <h1
        className="font-black uppercase text-center"
        style={{
          fontSize: 'clamp(3rem, 8vw, 7rem)',
          lineHeight: '0.92',
          letterSpacing: '-0.02em',
          marginBottom: '1.5rem',
        }}
      >
        PRODUCT<br />CATALOG
      </h1>
      <p className="text-white/50 text-lg uppercase tracking-widest mb-10">
        Coming Soon
      </p>
      <Link
        to="/"
        className="
          inline-flex items-center justify-center
          bg-white text-black
          font-bold uppercase tracking-widest text-sm
          px-10 py-4 rounded-full
          border-2 border-white
          transition-all duration-300
          hover:bg-black hover:text-white
          cursor-pointer
        "
        style={{ letterSpacing: '0.2em' }}
      >
        ← BACK
      </Link>
    </div>
  );
};

export default ProductsPage;
