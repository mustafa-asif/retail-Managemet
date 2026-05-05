import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  label: string;
  type?: 'success' | 'warning' | 'danger' | 'info' | 'default';
}

export function Badge({ label, type = 'default' }: BadgeProps) {
  const types = {
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    default: 'bg-slate-100 text-slate-800 border-slate-200'
  };

  return (
    <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-medium border", types[type])}>
      {label}
    </span>
  );
}
