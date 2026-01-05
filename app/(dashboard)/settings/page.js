"use client";

import React, { useState } from 'react';
import { useApp } from "@/context/AppContext";
import { Settings, Globe, Building2, User, Save } from 'lucide-react';

/**
 * Settings Page
 * Manages business profile, localization, and system preferences.
 */
export default function SettingsPage() {
  const { t, language, setLanguage } = useApp();
  const [loading, setLoading] = useState(false);
  
  // Local state for profile (Will be synced with DB/localStorage in future)
  const [profile, setProfile] = useState({
    businessName: "Xeetrix E-commerce",
    owner: "Admin User",
    email: "admin@xeetrix.com",
    currency: "BDT"
  });

  /** Sync settings with the backend or local storage */
  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API Call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Settings synchronized successfully", profile);
    } catch (error) {
      console.error("Failed to sync settings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20 p-4 md:p-0">
      <header>
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3">
          <Settings size={40} className="text-slate-400" /> System Settings
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Business & Profile Configuration */}
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 space-y-8">
          <section className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2">
              <Building2 size={16} /> Business Profile
            </h3>
            
            <div className="space-y-4">
              <div className="group">
                <label className="text-[10px] uppercase font-black text-slate-500 ml-2 tracking-widest">Company Title</label>
                <input 
                  type="text" 
                  className="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none text-white focus:border-blue-600 transition-all mt-1"
                  value={profile.businessName}
                  onChange={(e) => setProfile({...profile, businessName: e.target.value})}
                />
              </div>
              <div className="group">
                <label className="text-[10px] uppercase font-black text-slate-500 ml-2 tracking-widest">Base Currency</label>
                <select 
                  className="w-full bg-[#090E14] p-4 rounded-xl border border-white/10 outline-none text-white mt-1 appearance-none focus:border-blue-600 transition-all"
                  value={profile.currency}
                  onChange={(e) => setProfile({...profile, currency: e.target.value})}
                >
                  <option value="BDT">BDT (৳) - Bangladeshi Taka</option>
                  <option value="USD">USD ($) - US Dollar</option>
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-6 pt-4 border-t border-white/5">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2">
              <User size={16} /> Identity & Access
            </h3>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Full Name"
                className="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none text-white focus:border-blue-600 transition-all"
                value={profile.owner}
                onChange={(e) => setProfile({...profile, owner: e.target.value})}
              />
              <input 
                type="email" 
                placeholder="Email Address"
                className="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none text-white focus:border-blue-600 transition-all"
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
              />
            </div>
          </section>
        </div>

        {/* System Customization & Localization */}
        <div className="space-y-8">
          <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2">
              <Globe size={16} /> Localization
            </h3>
            <div className="flex gap-4">
              <button 
                onClick={() => setLanguage('bn')}
                className={`flex-1 p-4 rounded-xl font-black uppercase text-xs tracking-tighter border transition-all duration-300 ${language === 'bn' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'}`}
              >
                Bengali (বাংলা)
              </button>
              <button 
                onClick={() => setLanguage('en')}
                className={`flex-1 p-4 rounded-xl font-black uppercase text-xs tracking-tighter border transition-all duration-300 ${language === 'en' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'}`}
              >
                English (Global)
              </button>
            </div>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest text-center opacity-60">
              Language changes will propagate across the entire control room.
            </p>
          </div>

          <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-green-600 p-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-3 hover:bg-green-700 active:scale-[0.98] transition-all shadow-xl shadow-green-900/10 text-white"
          >
            <Save size={20} />
            {loading ? "Synchronizing..." : "Commit Changes"}
          </button>
        </div>

      </div>
    </div>
  );
}