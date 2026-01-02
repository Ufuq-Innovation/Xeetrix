"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Wallet, 
  Truck, 
  BarChart3, 
  Settings, 
  Zap, 
  ChevronRight,
  Bell
} from 'lucide-react';

const menuItems = [
  { name: 'ড্যাশবোর্ড', icon: <LayoutDashboard size={18}/>, path: '/dashboard' },
  { name: 'অর্ডার লিস্ট', icon: <ShoppingCart size={18}/>, path: '/orders' },
  { name: 'ইনভেন্টরি', icon: <Package size={18}/>, path: '/inventory' },
  { name: 'ফিন্যান্স', icon: <Wallet size={18}/>, path: '/finance' },
  { name: 'কুরিয়ার', icon: <Truck size={18}/>, path: '/courier' },
  { name: 'রিপোর্টস', icon: <BarChart3 size={18}/>, path: '/reports' },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#07090E] text-slate-300">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0A0C10] flex flex-col fixed h-full z-50">
        <div className="p-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Zap className="text-white fill-white" size={18} />
          </div>
          <span className="text-xl font-black text-white tracking-tighter uppercase italic">Xeetrix</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <p className="text-[10px] font-bold text-slate-600 uppercase px-4 mb-4 tracking-[0.2em]">Main Menu</p>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path} 
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                  isActive 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/10' 
                  : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 font-bold text-[13px]">
                  {item.icon} {item.name}
                </div>
                {isActive && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-1">
          <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-slate-500 text-[13px] font-bold hover:text-white transition-all">
            <Settings size={18}/> সেটিংস
          </Link>
        </div>
      </aside>

      {/* Content Area */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Top Header */}
        <header className="h-20 border-b border-white/5 bg-[#0A0C10]/50 backdrop-blur-md px-10 flex items-center justify-between sticky top-0 z-40">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            {menuItems.find(i => i.path === pathname)?.name || 'Control Room'}
          </h2>
          <div className="flex items-center gap-6">
            <button className="relative text-slate-500 hover:text-white">
              <Bell size={20}/>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 border-l border-white/10 pl-6">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-black text-white uppercase leading-none">Admin User</p>
                <p className="text-[9px] font-bold text-emerald-500 uppercase mt-1">Owner Access</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl border border-white/10"></div>
            </div>
          </div>
        </header>

        <main className="p-10">
          {children}
        </main>
      </div>
    </div>
  );
}