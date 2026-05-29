import React, { useState, useEffect } from 'react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-24 md:bottom-8 right-6 z-50 w-12 h-12 rounded-full glass-panel flex items-center justify-center text-gray-400 hover:text-white hover:bg-brand-deep-purple transition-all duration-300 shadow-lg ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label="Back to top"
    >
      <span className="material-symbols-outlined">arrow_upward</span>
    </button>
  );
}
