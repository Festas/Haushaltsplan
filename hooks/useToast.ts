'use client';

import { useState, useCallback } from 'react';
import type { Toast, ToastType } from '@/components/Toast';

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = crypto.randomUUID();
    const newToast: Toast = { id, type, message };
    
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message: string) => {
    showToast('success', message);
  }, [showToast]);

  const error = useCallback((message: string) => {
    showToast('error', message);
  }, [showToast]);

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
  };
}
