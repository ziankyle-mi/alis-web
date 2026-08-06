'use client';

import { AlertTriangle, Info, HelpCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-2" />,
      btn: 'bg-red-600 hover:bg-red-700 text-white',
    },
    warning: {
      icon: <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />,
      btn: 'bg-[#10312B] hover:bg-[#1b5349] text-white',
    },
    info: {
      icon: <HelpCircle className="w-10 h-10 text-blue-500 mx-auto mb-2" />,
      btn: 'bg-[#10312B] hover:bg-[#1b5349] text-white',
    },
  };

  const current = typeConfig[type];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-gray-100 animate-scale-up">
        {current.icon}
        <h3 className="text-lg font-extrabold text-gray-900 mb-1">{title}</h3>
        <p className="text-xs text-gray-600 mb-6 leading-relaxed">{message}</p>

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl shadow transition-all ${current.btn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
