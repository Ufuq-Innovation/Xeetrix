"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, ShoppingCart, Wallet, Package, 
  Truck, Megaphone, BarChart, Settings, Menu, X, PlusCircle 
} from 'lucide-react';

/**
 * Sidebar Component
 * Provides primary navigation with mobile-responsive drawer and theme support.
 * Features: ARIA labels, Dynamic Case styling, and Right-aligned mobile menu.
 */
export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation('common'); 

  /**
   * Navigation items configuration
   */
  const menuItems = [
    { key: 'dashboard', path: '/dashboard', icon: LayoutDashboard },
    { key: 'create_new_order', path: '/orders', icon: PlusCircle },
    { key: 'order_history', path: '/history', icon: ShoppingCart },
    { key: 'inventory', path: '/inventory', icon: Package },
    { key: 'finance_control', path: '/finance', icon: Wallet },
    { key: 'courier_management', path: '/courier', icon: Truck },
    { key: 'marketing_center', path: '/marketing', icon: Megaphone },
    { key: 'business_analytics', path: '/reports', icon: BarChart },
    { key: 'settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Trigger Button - Positioned Top-Right */}
      <div className="lg:hidden fixed top-5 right-5 z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Toggle Navigation Menu"
          className="bg-blue-600 hover:bg-blue-700 p-3 rounded-2xl shadow-lg text-white active:scale-95 transition-all duration-200"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed lg:relative top-0 right-0 lg:left-0 z-40
          w-72 h-screen flex flex-col p-6 md:p-8 space-y-10 
          transition-transform duration-500 ease-in-out
          bg-white dark:bg-[#11161D] border-l lg:border-r border-slate-200 dark:border-white/5
          ${isOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand/Logo Section */}
        <div className="flex items-center space-x-4">
          <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-white italic shadow-lg shadow-blue-500/20">
            X
          </div>
          <div>
            <h2 className="text-xl font-black italic tracking-tighter text-slate-900 dark:text-white">
              Xeetrix
            </h2>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-[0.15em] uppercase opacity-80">
              {t('control_room')}
            </p>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav 
          className="flex flex-col space-y-2 overflow-y-auto flex-1 no-scrollbar pr-1"
          role="navigation"
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <Link 
                key={item.path} 
                href={item.path} 
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 group
                  ${isActive 
                    ? 'bg-blue-600 text-white font-bold shadow-xl shadow-blue-500/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-slate-200'
                  }
                `}
              >
                <Icon 
                  size={20} 
                  className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'} transition-colors`} 
                />
                <span className="text-[13px] font-bold tracking-tight">
                  {t(item.key)}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Operational Status Footer */}
        <div className="pt-6 border-t border-slate-200 dark:border-white/5">
          <div className="flex items-center space-x-4 px-2">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10"></div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-[3px] border-white dark:border-[#11161D] rounded-full"></div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t('system_status')}
              </p>
              <p className="text-[11px] text-green-600 dark:text-green-500 font-black italic">
                {t('operational')}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay with Backdrop Blur */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-500"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        ></div>
      )}
    </>
  );
}