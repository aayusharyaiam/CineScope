import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageTransition({ children }) {
  const location = useLocation();
  const divRef = useRef(null);

  useEffect(() => {
    if (divRef.current) {
      divRef.current.style.opacity = '0';
      divRef.current.style.transform = 'translateY(12px)';
      requestAnimationFrame(() => {
        if (divRef.current) {
          divRef.current.style.transition = 'opacity 0.35s ease-out, transform 0.35s ease-out';
          divRef.current.style.opacity = '1';
          divRef.current.style.transform = 'translateY(0)';
        }
      });
    }
  }, [location.pathname]);

  return (
    <div ref={divRef} style={{ opacity: 0, transform: 'translateY(12px)' }}>
      {children}
    </div>
  );
}
