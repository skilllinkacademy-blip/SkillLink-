import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-md px-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`pointer-events-auto flex items-center gap-3 p-4 rounded shadow-[0_4px_12px_rgba(0,0,0,0.15)] border ${
                toast.type === 'success' ? 'bg-[#EEF3F8] dark:bg-[#38434F] border-[#0A66C2]/20 text-[#0A66C2] dark:text-[#70B5F9]' :
                toast.type === 'error' ? 'bg-[#FCE8E8] dark:bg-[#CC1016]/20 border-[#CC1016]/20 text-[#CC1016] dark:text-[#FF8A8A]' :
                'bg-white dark:bg-[#1D2226] border-[#E0DFDC] dark:border-[#38434F] text-primary'
              }`}
            >
              {toast.type === 'success' && <CheckCircle2 className="text-[#0A66C2] dark:text-[#70B5F9] shrink-0" size={20} />}
              {toast.type === 'error' && <XCircle className="text-[#CC1016] dark:text-[#FF8A8A] shrink-0" size={20} />}
              <p className="text-sm font-semibold flex-1">{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className="opacity-50 hover:opacity-100 transition-opacity">
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
