'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const isSuccess = toast.type === 'success';

  return (
    <div
      className={`
        flex items-center gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-xl
        border animate-slide-in-right
        ${isSuccess 
          ? 'bg-gradient-to-r from-green-900/90 to-emerald-900/90 border-green-500/50' 
          : 'bg-gradient-to-r from-red-900/90 to-rose-900/90 border-red-500/50'
        }
      `}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
        {isSuccess ? (
          <CheckCircle className="w-6 h-6" />
        ) : (
          <XCircle className="w-6 h-6" />
        )}
      </div>

      {/* Message */}
      <div className="flex-1 text-white font-medium">
        {toast.message}
      </div>

      {/* Close button */}
      <button
        onClick={() => onClose(toast.id)}
        className={`
          flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
          transition-smooth hover:scale-110
          ${isSuccess 
            ? 'hover:bg-green-800/50' 
            : 'hover:bg-red-800/50'
          }
        `}
        aria-label="Schließen"
      >
        <X className="w-4 h-4 text-white/80" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export default function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      <div className="pointer-events-auto space-y-3">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </div>
    </div>
  );
}
