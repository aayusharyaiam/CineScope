import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className="pointer-events-auto animate-slide-up cursor-pointer"
          >
            <div className={`backdrop-blur-md text-white px-6 py-3 rounded-full shadow-lg font-body text-sm font-semibold flex items-center gap-2 border border-white/10 ${
              toast.type === 'success' ? 'bg-brand-deep-purple/90 shadow-[0_10px_30px_rgba(132,94,194,0.3)]' :
              toast.type === 'error' ? 'bg-red-500/90 shadow-[0_10px_30px_rgba(239,68,68,0.3)]' :
              'bg-brand-coral-pink/90 shadow-[0_10px_30px_rgba(255,111,145,0.3)]'
            }`}>
              <span className="material-symbols-outlined text-[18px]">
                {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'favorite'}
              </span>
              {toast.message}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
