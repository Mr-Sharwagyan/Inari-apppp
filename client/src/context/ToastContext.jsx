import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      
      {/* Toast Render Node */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
              className="pointer-events-auto w-full"
            >
              <div className={`p-4 rounded-xl shadow-lg border backdrop-blur-md flex items-start gap-3 ${
                toast.type === 'success'
                  ? 'bg-emerald-50/90 border-emerald-250/50 text-emerald-900'
                  : toast.type === 'error'
                  ? 'bg-red-50/90 border-red-200/50 text-red-900'
                  : toast.type === 'warning'
                  ? 'bg-amber-50/90 border-amber-200/50 text-amber-900'
                  : 'bg-stone-50/90 border-stone-200/50 text-stone-900'
              }`}>
                <div className="mt-0.5 flex-shrink-0">
                  {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                  {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-650" />}
                  {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-600" />}
                  {toast.type === 'info' && <Info className="w-5 h-5 text-stone-605" />}
                </div>

                <div className="flex-1 text-sm font-medium pr-2 leading-relaxed">
                  {toast.message}
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-sage-400 hover:text-sage-700 hover:bg-stone-200/50 p-1 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
