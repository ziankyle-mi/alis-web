'use client';

import { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />,
    error: <XCircle className="w-6 h-6 text-red-500 shrink-0" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />,
    info: <Info className="w-6 h-6 text-blue-500 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-white/95 text-emerald-950',
    error: 'border-red-200 bg-white/95 text-red-950',
    warning: 'border-amber-200 bg-white/95 text-amber-950',
    info: 'border-blue-200 bg-white/95 text-blue-950',
  };

  return (
    <div
      className={`pointer-events-auto flex items-start space-x-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-slide-in ${borders[toast.type]}`}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0 pr-2">
        <h4 className="text-sm font-extrabold">{toast.title}</h4>
        {toast.message && <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{toast.message}</p>}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-gray-400 hover:text-gray-700 p-0.5 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
