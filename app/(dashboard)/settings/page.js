"use client";

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from "@/context/AppContext";
import { Settings, Globe, Building2, User, Save, ShieldCheck } from 'lucide-react';
import { toast } from "sonner"; // ✅ toast only

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
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    businessName: "Xeetrix E-commerce",
    owner: "Shaikh Baset",
    email: "admin@xeetrix.com",
    currency: "BDT"
  });

  const handleSave = async () => {
    setLoading(true);

    const toastId = toast.loading(t('syncing'));

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(t('settings_saved_success'), {
        id: toastId,
      });
    } catch (error) {
      console.error("Failed to sync settings:", error);

      toast.error(t('something_went_wrong'), {
        id: toastId,
      });
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

        {/* Business Profile */}
        <div className="lg:col-span-2 bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 space-y-8 shadow-2xl">
          <section className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2">
              <Building2 size={16} /> {t('business_profile')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                className="w-full bg-white/5 p-4 rounded-xl border border-white/10 text-white"
                value={profile.businessName}
                onChange={(e) =>
                  setProfile({ ...profile, businessName: e.target.value })
                }
              />

              <select
                className="w-full bg-[#090E14] p-4 rounded-xl border border-white/10 text-white"
                value={profile.currency}
                onChange={(e) =>
                  setProfile({ ...profile, currency: e.target.value })
                }
              >
                
 <option value="BDT">BDT (৳) - Bangladeshi Taka</option>
                  <option value="USD">USD ($) - US Dollar</option>
              </select>
            </div>
          </section>

          {/* Identity */}
          <section className="space-y-6 pt-6 border-t border-white/5">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2">
              <User size={16} /> {t('identity_access')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                className="w-full bg-white/5 p-4 rounded-xl border border-white/10 text-white"
                value={profile.owner}
                onChange={(e) =>
                  setProfile({ ...profile, owner: e.target.value })
                }
              />
              <input
                type="email"
                className="w-full bg-white/5 p-4 rounded-xl border border-white/10 text-white"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
              />
            </div>
          </section>
        </div>

        {/* Localization */}
        <div className="space-y-8">
          <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 space-y-6 shadow-xl">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2">
              <Globe size={16} /> {t('localization')}
            </h3>

            {languages.map(item => (
              <button
                key={item.code}
                onClick={() => {
                  toggleLang(item.code);
                  toast.success(`${item.name} selected`);
                }}
                className={`w-full p-4 rounded-xl text-[10px] uppercase font-black flex justify-between ${
                  lang === item.code
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/5 text-slate-400'
                }`}
              >
                <span>{item.name}</span>
                <span>{item.flag}</span>
              </button>
            ))}

            <div className="flex justify-center text-[9px] text-slate-500">
              <ShieldCheck size={12} /> {t('auto_sync_enabled')}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-blue-600 p-6 rounded-[2rem] font-black uppercase tracking-widest text-white disabled:bg-slate-800"
          >
            <Save size={20} />
            {loading ? t('syncing') : t('save_settings')}
          </button>
        </div>

      </div>
    </div>
  );
}


