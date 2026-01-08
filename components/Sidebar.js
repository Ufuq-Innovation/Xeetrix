"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useApp } from "@/context/AppContext";
import { 
  LayoutDashboard, ShoppingCart, Wallet, Package, 
  Truck, Megaphone, Settings, Menu, X, PlusCircle, CircleDot
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation(); 
  const { lang, theme } = useApp();

  const menuItems = [
    { key: 'dashboard', path: '/dashboard', icon: LayoutDashboard },
    { key: 'orders', path: '/orders', icon: PlusCircle },
    { key: 'inventory', path: '/inventory', icon: Package },
    { key: 'finance', path: '/finance', icon: Wallet },
    { key: 'courier', path: '/courier', icon: Truck },
    { key: 'marketing', path: '/marketing', icon: Megaphone },
    { key: 'settings', path: '/settings', icon: Settings },
  ];

  const isRTL = ['ar', 'ur', 'ps'].includes(lang);

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-5 right-5 z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 hover:bg-blue-700 p-3 rounded-2xl shadow-xl text-white transition-all active:scale-90"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <aside 
        className={`
          fixed lg:relative top-0 z-40
          w-72 h-screen flex flex-col p-6 space-y-8
          transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          bg-white/80 dark:bg-[#0B0F15]/90 backdrop-blur-xl
          border-slate-200 dark:border-white/5
          ${isRTL 
            ? (isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0')
            : (isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')
          }
          ${isRTL ? 'right-0 border-l' : 'left-0 border-r'}
        `}
      >
        {/* Header/Logo */}
        <div className="flex items-center space-x-4 rtl:space-x-reverse px-2">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-white italic shadow-2xl">
              X
            </div>
          </div>
          <div className="overflow-hidden">
            <h2 className="text-xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
              Xeetrix
            </h2>
            <span className="text-[9px] font-black text-blue-500 dark:text-blue-400 tracking-[0.2em] uppercase">
              {t('control_room')}
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex flex-col flex-1 space-y-1 overflow-y-auto no-scrollbar">
          <p className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-4">
            {t('main_menu')}
          </p>
          
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              
              return (
                <Link 
                  key={item.path} 
                  href={item.path} 
                  onClick={() => setIsOpen(false)}
                  className={`
                    relative flex items-center space-x-4 rtl:space-x-reverse px-4 py-3.5 rounded-2xl transition-all duration-300 group
                    ${isActive 
                      ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                    }
                  `}
                >
                  {/* Active Indicator Dot */}
                  {isActive && (
                    <div className="absolute left-0 rtl:left-auto rtl:right-0 w-1.5 h-6 bg-blue-600 rounded-r-full rtl:rounded-l-full rtl:rounded-r-none" />
                  )}

                  <Icon size={20} className={`${isActive ? 'stroke-[2.5px]' : 'group-hover:text-blue-600 transition-colors'}`} />
                  
                  <span className="text-[13px] font-bold tracking-tight">
                    {t(item.key)}
                  </span>

                  {isActive && (
                    <CircleDot size={12} className="ml-auto opacity-50 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Status */}
        <div className="p-4 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 transition-all">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center">
                <LayoutDashboard size={18} className="text-blue-600" />
              </div>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-[#0B0F15] rounded-full animate-bounce"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase truncate">
                {t('system_status')}
              </p>
              <p className="text-[11px] text-green-600 dark:text-green-500 font-black italic">
                {t('operational')}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md z-30 lg:hidden transition-opacity duration-300" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}