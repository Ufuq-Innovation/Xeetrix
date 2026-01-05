"use client";

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; // Reactive i18n hook
import { useApp } from "@/context/AppContext";
import { Settings, Globe, Building2, User, Save, ShieldCheck } from 'lucide-react';

// Standardized language configuration to match i18next resources
const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
  { code: 'ps', name: 'پښتو', flag: '🇦🇫' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

export default function SettingsPage() {
  const { lang, toggleLang } = useApp();
  const { t } = useTranslation('common'); // Hook for real-time translation
  const [loading, setLoading] = useState(false);
  
  const [profile, setProfile] = useState({
    businessName: "Xeetrix E-commerce",
    owner: "Shaikh Baset",
    email: "admin@xeetrix.com",
    currency: "BDT"
  });

  /**
   * Orchestrates the settings synchronization process.
   * Dispatches localized notifications based on the current active locale.
   */
  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulating API Latency
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Localized Success Alerts using i18n translation keys
      alert(t('settings_saved_success'));
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
          <Settings size={40} className="text-blue-500 animate-spin-slow" /> 
          {t('settings')}
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Business Profile Configuration */}
        <div className="lg:col-span-2 bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 space-y-8 shadow-2xl">
          <section className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2">
              <Building2 size={16} /> {t('business_profile')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="text-[10px] uppercase font-black text-slate-500 ml-2 tracking-widest">{t('company_title')}</label>
                <input 
                  type="text" 
                  className="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none text-white focus:border-blue-600 transition-all mt-1"
                  value={profile.businessName}
                  onChange={(e) => setProfile({...profile, businessName: e.target.value})}
                />
              </div>
              <div className="group">
                <label className="text-[10px] uppercase font-black text-slate-500 ml-2 tracking-widest">{t('base_currency')}</label>
                <select 
                  className="w-full bg-[#090E14] p-4 rounded-xl border border-white/10 outline-none text-white mt-1 appearance-none focus:border-blue-600 transition-all cursor-pointer"
                  value={profile.currency}
                  onChange={(e) => setProfile({...profile, currency: e.target.value})}
                >
                  <option value="BDT">BDT (৳) - Bangladeshi Taka</option>
                  <option value="USD">USD ($) - US Dollar</option>
                </select>
              </div>
            </div>
          </section>

          {/* Identity & Access Management */}
          <section className="space-y-6 pt-6 border-t border-white/5">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2">
              <User size={16} /> {t('identity_access')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-600 ml-2">{t('full_name')}</label>
                <input 
                  type="text" 
                  className="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none text-white focus:border-blue-600 transition-all"
                  value={profile.owner}
                  onChange={(e) => setProfile({...profile, owner: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-600 ml-2">{t('email_address')}</label>
                <input 
                  type="email" 
                  className="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none text-white focus:border-blue-600 transition-all"
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Global Localization Panel */}
        <div className="space-y-8">
          <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 space-y-6 shadow-xl">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2">
              <Globe size={16} /> {t('localization')}
            </h3>
            <div className="grid grid-cols-1 gap-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
              {languages.map((item) => (
                <button 
                  key={item.code}
                  onClick={() => toggleLang(item.code)}
                  className={`w-full p-4 rounded-xl font-black uppercase text-[10px] tracking-widest border transition-all duration-300 flex items-center justify-between ${
                    lang === item.code 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'
                  }`}
                >
                  <span>{item.name}</span>
                  <span className="text-lg grayscale-0">{item.flag}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 justify-center text-[9px] text-slate-500 font-black uppercase tracking-widest opacity-60">
              <ShieldCheck size={12} /> {t('auto_sync_enabled')}
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-blue-600 p-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-xl shadow-blue-900/20 text-white disabled:bg-slate-800 disabled:text-slate-500"
          >
            <Save size={20} />
            {loading ? t('syncing') : t('save_settings')}
          </button>
        </div>

      </div>
    </div>
  );
}