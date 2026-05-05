import React from 'react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string; // Optional custom color class
  subtitle?: string;
  className?: string;
}

export function StatCard({ title, value, icon, color, subtitle, className }: StatCardProps) {
  return (
    <div className={cn("bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col", className)}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <div className={cn("p-2 rounded-lg", color || "bg-slate-100 text-slate-600")}>
          {icon}
        </div>
      </div>
      <div className="flex-1">
        <div className="text-2xl font-semibold text-slate-900 font-mono">{value}</div>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
