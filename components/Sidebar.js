"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from "@/context/AppContext";
import { 
  LayoutDashboard, ShoppingCart, Wallet, Package, 
  Truck, Megaphone, BarChart, Settings, Menu, X, PlusCircle 
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useApp();

  /**
   * Menu items configuration using translation keys.
   * Icons are mapped to each route accordingly.
   */
  const menuItems = [
    { key: 'dashboard', path: '/dashboard', icon: LayoutDashboard },
    { key: 'new_order', path: '/orders', icon: PlusCircle },
    { key: 'history', path: '/history', icon: ShoppingCart },
    { key: 'inventory', path: '/inventory', icon: Package },
    { key: 'finance', path: '/finance', icon: Wallet },
    { key: 'courier', path: '/courier', icon: Truck },
    { key: 'marketing', path: '/marketing', icon: Megaphone },
    { key: 'reports', path: '/reports', icon: BarChart },
    { key: 'settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Launcher for small screens */}
      <div className="lg:hidden fixed top-6 left-6 z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 p-3 rounded-2xl shadow-xl text-white active:scale-95 transition-all"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Main Navigation Drawer */}
      <aside className={`
        fixed lg:relative top-0 left-0 z-40
        w-72 h-screen bg-[#11161D] border-r border-white/5 
        flex flex-col p-8 space-y-10 transition-transform duration-500 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Branding Section */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white italic shadow-lg shadow-blue-900/20">X</div>
          <div>
            <h2 className="text-xl font-black italic tracking-tighter text-white uppercase">Xeetrix</h2>
            <p className="text-[9px] font-bold text-slate-500 tracking-[0.2em] uppercase">
              {t('control_room') || "Control Room"}
            </p>
          </div>
        </div>
        
        {/* Dynamic Navigation Menu */}
        <nav className="flex flex-col space-y-1.5 overflow-y-auto flex-1 no-scrollbar pr-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <Link 
                key={item.path} 
                href={item.path} 
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 group ${
                  isActive 
                  ? 'bg-blue-600 text-white font-bold shadow-2xl shadow-blue-900/40' 
                  : 'text-slate-500 hover:bg-white/3 hover:text-slate-200'
                }`}
              >
                <Icon size={18} className={`${isActive ? 'text-white' : 'text-slate-600 group-hover:text-blue-500'} transition-colors`} />
                <span className="text-[11px] uppercase font-black tracking-widest">
                  {t(item.key) || item.key.replace('_', ' ')}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Operational Status Section */}
        <div className="pt-6 border-t border-white/5">
          <div className="flex items-center space-x-4 px-2">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-slate-700 to-slate-900 border border-white/10"></div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-[#11161D] rounded-full"></div>
            </div>
            <div>
              <p className="text-[10px] font-black text-white uppercase tracking-tight">
                {t('system_status') || "System Status"}
              </p>
              <p className="text-[9px] text-green-500 font-black uppercase tracking-widest animate-pulse italic">
                {t('operational') || "Operational"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile interaction */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-30 lg:hidden transition-opacity duration-500"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}