"use client";
import { useApp } from "@/context/AppContext";
import { LayoutDashboard, ShoppingCart, Package, Wallet, Zap, Moon, Sun } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children }) {
  const context = useApp();

  if (!context) return null; 

  const { t, lang, toggleLang, theme, toggleTheme } = context;

  const menu = [
    { name: t?.dashboard || "Dashboard", path: '/dashboard', icon: <LayoutDashboard size={20}/> },
    { name: t?.orders || "Orders", path: '/orders', icon: <ShoppingCart size={20}/> },
    { name: t?.inventory || "Inventory", path: '/inventory', icon: <Package size={20}/> },
    { name: t?.finance || "Finance", path: '/finance', icon: <Wallet size={20}/> },
  ];

  return (
    <div className={`flex min-h-screen ${theme === 'dark' ? 'bg-[#07090E] text-white' : 'bg-gray-50 text-black'}`}>
      <aside className={`w-72 border-r ${theme === 'dark' ? 'border-white/5 bg-[#0A0C10]' : 'border-gray-200 bg-white'} fixed h-full flex flex-col transition-all`}>
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
        <div className="p-6 border-t border-white/5 space-y-4">
          <div className="flex gap-2 p-1 bg-black/10 dark:bg-black/40 rounded-xl">
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