"use client";

import { useState, useEffect, createContext, useContext } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  toast: (message: string, type?: 'success' | 'error' | 'info') => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  return (
    <ToastContext.Provider value={{ 
      toast: addToast,
      success: (m) => addToast(m, 'success'),
      error: (m) => addToast(m, 'error'),
    }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
        {toasts.map(t => (
          <div 
            key={t.id}
            className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-right-full transition-all border ${
              t.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
              t.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' :
              'bg-gray-800 border-gray-700 text-white'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
