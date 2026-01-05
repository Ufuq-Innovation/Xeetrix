"use client";

import React, { useState } from 'react';
import { useApp } from "@/context/AppContext";
import { Settings, Globe, Building2, User, Save, ShieldCheck } from 'lucide-react';

// Added all 10 languages to sync with our i18n setup
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
  const { t, lang, toggleLang } = useApp();
  const [loading, setLoading] = useState(false);
  
  const [profile, setProfile] = useState({
    businessName: "Xeetrix E-commerce",
    owner: "Shaikh Baset",
    email: "admin@xeetrix.com",
    currency: "BDT"
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Multi-language notification support
      const successMsg = {
        en: "Settings saved successfully!",
        bn: "সেটিংস সফলভাবে সংরক্ষিত হয়েছে!",
        ar: "تم حفظ الإعدادات بنجاح!",
        ur: "ترتیبات کامیابی سے محفوظ ہوگئیں!",
        ps: "تنظیمات په بریالیتوب سره خوندي شول!",
        ja: "設定が正常に保存されました！",
        ru: "Настройки успешно сохранены!",
        hi: "सेटिंग्स सफलतापूर्वक सहेजी गईं!",
        zh: "设置保存成功！",
        es: "¡Configuración guardada con éxito!"
      };
      alert(successMsg[lang] || successMsg['en']);
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
          {t?.settings || "System Settings"}
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Business Profile Section */}
        <div className="lg:col-span-2 bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 space-y-8 shadow-2xl">
          <section className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2">
              <Building2 size={16} /> {t?.business_profile || "Business Profile"}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <section className="space-y-6 pt-6 border-t border-white/5">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2">
              <User size={16} /> {t?.identity_access || "Identity & Access"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Localization & Global Reach Section */}
        <div className="space-y-8">
          <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 space-y-6 shadow-xl">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2">
              <Globe size={16} /> {t?.localization || "Global Reach"}
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
              <ShieldCheck size={12} /> Auto-Sync Enabled
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-blue-600 p-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-xl shadow-blue-900/20 text-white"
          >
            <Save size={20} />
            {loading ? "SYNCING..." : t?.save || "SAVE SETTINGS"}
          </button>
        </div>

      </div>
    </div>
  );
}