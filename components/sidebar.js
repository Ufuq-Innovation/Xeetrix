"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Wallet, Package, Truck, Megaphone, BarChart, Settings } from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Orders', path: '/history', icon: ShoppingCart }, // history পেজকে অর্ডার হিসেবে দেখাচ্ছি
  { name: 'Inventory', path: '/inventory', icon: Package },
  { name: 'Finance', path: '/finance', icon: Wallet },
  { name: 'Courier', path: '/courier', icon: Truck },
  { name: 'Marketing', path: '/marketing', icon: Megaphone },
  { name: 'Reports', path: '/reports', icon: BarChart },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-[#11161D] border-r border-white/5 flex flex-col p-6 space-y-8 min-h-screen sticky top-0">
      <div className="text-2xl font-black italic tracking-tighter text-blue-500 uppercase">Xeetrix</div>
      
      <nav className="flex flex-col space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <Link key={item.path} href={item.path} className={`flex items-center space-x-3 p-4 rounded-2xl transition-all ${isActive ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:bg-white/5'}`}>
              <Icon size={20} />
              <span className="text-sm uppercase tracking-wider">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}