"use client";
import React, { useState } from 'react';
import { useApp } from "@/context/AppContext";
import { Settings, Globe, Building2, User, Save } from 'lucide-react';

export default function SettingsPage() {
  const { t, language, setLanguage } = useApp();
  const [loading, setLoading] = useState(false);
  
  // ডামি ডাটা (পরবর্তীতে ডাটাবেস থেকে আসবে)
  const [profile, setProfile] = useState({
    businessName: "Xeetrix E-commerce",
    owner: "Admin User",
    email: "admin@xeetrix.com",
    currency: "BDT (৳)"
  });

  const handleSave = () => {
    setLoading(true);
    // এখানে সেটিংস সেভ করার লজিক (localStorage বা DB তে)
    setTimeout(() => {
      setLoading(false);
      alert("Settings Saved Successfully!");
    }, 1000);
  };

  return (
    <div className="space-y-10 pb-20">
      <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3">
        <Settings size={40} className="text-slate-400" /> System Settings
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Business & Profile Settings */}
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 space-y-8">
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-blue-500 flex items-center gap-2">
              <Building2 size={18} /> Business Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-2">Business Name</label>
                <input 
                  type="text" 
                  className="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none text-white focus:border-blue-600 mt-1"
                  value={profile.businessName}
                  onChange={(e) => setProfile({...profile, businessName: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-2">Default Currency</label>
                <select className="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none text-white mt-1">
                  <option value="BDT">BDT (৳) - Bangladeshi Taka</option>
                  <option value="USD">USD ($) - US Dollar</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-blue-500 flex items-center gap-2">
              <User size={18} /> Admin Profile
            </h3>
            <div className="space-y-4">
              <input 
                type="text" 
                className="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none text-white focus:border-blue-600"
                value={profile.owner}
                onChange={(e) => setProfile({...profile, owner: e.target.value})}
              />
              <input 
                type="email" 
                className="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none text-white focus:border-blue-600"
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* System & Localization Settings */}
        <div className="space-y-8">
          <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-blue-500 flex items-center gap-2">
              <Globe size={18} /> Localization (Language)
            </h3>
            <div className="flex gap-4">
              <button 
                onClick={() => setLanguage('bn')}
                className={`flex-1 p-4 rounded-xl font-bold border transition-all ${language === 'bn' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}
              >
                বাংলা
              </button>
              <button 
                onClick={() => setLanguage('en')}
                className={`flex-1 p-4 rounded-xl font-bold border transition-all ${language === 'en' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}
              >
                English
              </button>
            </div>
            <p className="text-[10px] text-slate-500 italic">সিস্টেমের ভাষা পরিবর্তন করলে ড্যাশবোর্ডের টেক্সট আপডেট হয়ে যাবে।</p>
          </div>

          <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-green-600 p-6 rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-green-700 transition-all shadow-xl shadow-green-900/20"
          >
            <Save size={20} />
            {loading ? "Saving Changes..." : "Save Settings"}
          </button>
        </div>

      </div>
    </div>
  );
}