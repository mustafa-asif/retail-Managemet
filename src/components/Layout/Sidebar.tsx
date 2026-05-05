import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Package, 
  Boxes, 
  ShoppingCart, 
  BarChart3, 
  ClipboardList, 
  LayoutDashboard,
  PlusCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/stores', label: 'Stores', icon: Building2 },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/inventory', label: 'Inventory', icon: Boxes },
  { path: '/sales', label: 'Sales', icon: ShoppingCart },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/audit', label: 'Audit Log', icon: ClipboardList },
];

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) {
  return (
    <>
      <div 
        className={cn("fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity", isOpen ? "opacity-100" : "opacity-0 pointer-events-none")} 
        onClick={onClose} 
      />
      <aside className={cn(
        "w-64 bg-slate-900 border-r border-slate-800 text-white flex flex-col h-screen fixed top-0 left-0 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
      <div className="p-6">
        <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-emerald-400" />
          Save Mart
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                isActive 
                  ? "bg-emerald-500/10 text-emerald-400" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}

        <div className="pt-4 mt-4 border-t border-slate-800">
          <NavLink
            to="/sales/new"
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
              isActive 
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" 
                : "bg-slate-800 text-white hover:bg-slate-700 hover:text-white"
            )}
          >
            <PlusCircle className="w-5 h-5" />
            Process New Sale
          </NavLink>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center">
        <span>v1.0.0</span>
        <span>Save Mart POS</span>
      </div>
    </aside>
    </>
  );
}
