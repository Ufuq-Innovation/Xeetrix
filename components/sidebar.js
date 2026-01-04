"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, ShoppingCart, Wallet, Package, 
  Truck, Megaphone, BarChart, Settings, Menu, X, PlusCircle 
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'New Order', path: '/orders', icon: PlusCircle }, // এন্ট্রি পেজ
  { name: 'Order History', path: '/history', icon: ShoppingCart }, // হিস্ট্রি পেজ
  { name: 'Inventory', path: '/inventory', icon: Package },
  { name: 'Finance', path: '/finance', icon: Wallet },
  { name: 'Courier', path: '/courier', icon: Truck },
  { name: 'Marketing', path: '/marketing', icon: Megaphone },
  { name: 'Reports', path: '/reports', icon: BarChart },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); // মোবাইলের জন্য স্টেট

  return (
    <>
      {/* মোবাইল মেনু বাটন (শুধু মোবাইলে দেখাবে) */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 p-3 rounded-full shadow-lg text-white"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* সাইডবার কন্টেইনার */}
      <div className={`
        fixed lg:sticky top-0 left-0 z-40
        w-64 h-screen bg-[#11161D] border-r border-white/5 
        flex flex-col p-6 space-y-8 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="text-2xl font-black italic tracking-tighter text-blue-500 uppercase flex items-center justify-between">
          Xeetrix
          <span className="text-[10px] bg-blue-500/10 px-2 py-1 rounded text-blue-300 ml-2">v1.0</span>
        </div>
        
        <nav className="flex flex-col space-y-1 overflow-y-auto custom-scrollbar pr-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <Link 
                key={item.path} 
                href={item.path} 
                onClick={() => setIsOpen(false)} // মোবাইলে ক্লিক করলে মেনু বন্ধ হবে
                className={`flex items-center space-x-3 p-4 rounded-2xl transition-all group ${
                  isActive 
                  ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={18} className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} />
                <span className="text-xs uppercase tracking-widest font-bold">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* নিচের অংশে ছোট্ট একটি প্রোফাইল বা স্ট্যাটাস */}
        <div className="mt-auto pt-6 border-t border-white/5">
            <div className="flex items-center space-x-3 p-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600"></div>
                <div>
                    <p className="text-[10px] font-bold text-white uppercase">Admin Mode</p>
                    <p className="text-[9px] text-green-500 font-bold uppercase tracking-tighter italic">● System Online</p>
                </div>
            </div>
        </div>
      </div>

      {/* মোবাইল মেনু খোলা থাকলে ব্যাকগ্রাউন্ড আবছা করা */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}