import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8">
      <div className="flex items-center gap-4 text-slate-400 w-full sm:w-96">
        <button onClick={onMenuClick} className="p-2 -ml-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-lg lg:hidden">
          <Menu className="w-5 h-5" />
        </button>
        <Search className="w-5 h-5 hidden sm:block" />
        <input 
          type="text" 
          placeholder="Search products, orders..." 
          className="bg-transparent border-none outline-none text-sm text-slate-700 w-full placeholder:text-slate-400 hidden sm:block"
        />
      </div>
      <div className="flex items-center gap-4 text-slate-400">
        <button className="p-2 hover:bg-slate-50 rounded-full transition-colors relative">
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          <Bell className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold text-sm">
          SM
        </div>
      </div>
    </header>
  );
}
