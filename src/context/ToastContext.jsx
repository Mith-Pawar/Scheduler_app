import React, { createContext, useContext, useState } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();

    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              background:
                t.type === 'error'
                  ? '#f44336'
                  : t.type === 'success'
                  ? '#2e7d64'
                  : '#2c7da0',
              color: 'white',
              padding: '10px 18px',
              borderRadius: '40px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              fontSize: '0.85rem',
              fontWeight: 500,
              maxWidth: '280px'
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};