"use client";
import { useApp } from "../../context/AppContext"; // ২টি ডট হবে
import { LayoutDashboard, ShoppingCart, Package, Wallet, Globe, Moon, Sun, Zap } from 'lucide-react';

import Link from 'next/link';

export default function DashboardLayout({ children }) {
  const { t, lang, toggleLang, theme, toggleTheme } = useApp();

  const menu = [
    { name: t.dashboard, path: '/dashboard', icon: <LayoutDashboard size={20}/> },
    { name: t.orders, path: '/orders', icon: <ShoppingCart size={20}/> },
    { name: t.inventory, path: '/inventory', icon: <Package size={20}/> },
    { name: t.finance, path: '/finance', icon: <Wallet size={20}/> },
  ];

  return (
    <div className={`flex min-h-screen ${theme === 'dark' ? 'bg-[#07090E] text-white' : 'bg-gray-50 text-black'}`}>
      {/* Sidebar */}
      <aside className={`w-72 border-r ${theme === 'dark' ? 'border-white/5 bg-[#0A0C10]' : 'border-gray-200 bg-white'} fixed h-full flex flex-col`}>
        <div className="p-8 flex items-center gap-3">
          <Zap className="text-blue-600 fill-blue-600" />
          <span className="text-2xl font-black italic tracking-tighter">XEETRIX</span>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menu.map((item) => (
            <Link key={item.path} href={item.path} className="flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-blue-600/10 hover:text-blue-500 font-bold transition-all">
              {item.icon} {item.name}
            </Link>
          ))}
        </nav>

        {/* Controls: Language & Theme */}
        <div className="p-6 border-t border-white/5 space-y-4">
          <div className="flex gap-2 p-1 bg-black/20 rounded-xl">
             <button onClick={() => toggleLang('bn')} className={`flex-1 py-2 text-[10px] font-black rounded-lg ${lang === 'bn' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>বাংলা</button>
             <button onClick={() => toggleLang('en')} className={`flex-1 py-2 text-[10px] font-black rounded-lg ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>ENGLISH</button>
          </div>
          <button onClick={toggleTheme} className="w-full py-3 bg-white/5 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase">
            {theme === 'dark' ? <><Sun size={14}/> Light Mode</> : <><Moon size={14}/> Dark Mode</>}
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-10">{children}</main>
    </div>
  );
}