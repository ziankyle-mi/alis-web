'use client';

import { LucideIcon, FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="py-16 text-center flex flex-col items-center justify-center p-6 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-[#10312B] mb-4 border border-emerald-100">
        <Icon className="w-8 h-8 text-[#10312B]/70" />
      </div>
      <h3 className="text-base font-extrabold text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-[#10312B] hover:bg-[#1b5349] text-white text-xs font-bold rounded-xl shadow transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
