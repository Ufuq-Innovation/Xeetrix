"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from "@/context/AppContext";
import { Settings, Globe, Building2, User, Save, ShieldCheck, Sun, Moon, Monitor } from 'lucide-react';
import { toast } from "sonner";

/**
 * Available languages with flags.
 */
const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
];

/**
 * Settings Page Component
 * Handles Business Profile, Localization, and Theme Preferences.
 */
export default function SettingsPage() {
  const { lang, toggleLang } = useApp();
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('dark');

  /**
   * Mock profile state.
   */
  const [profile, setProfile] = useState({
    businessName: "Xeetrix E-commerce",
    owner: "Shaikh Baset",
    email: "admin@xeetrix.com",
    currency: "BDT"
  });

  /**
   * Handle theme changes and persist preference.
   * @param {string} theme - 'light' | 'dark' | 'system'
   */
  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
    const root = window.document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      // System Default Logic
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      systemTheme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
      localStorage.removeItem('theme');
    }
    toast.success(`${t('theme')} ${t('syncing')}`);
  };

  /**
   * Save configuration to backend.
   */
  const handleSave = async () => {
    setLoading(true);
    const toastId = toast.loading(t('syncing'));

    try {
      // Simulating API synchronization
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(t('settings_saved_success'), { id: toastId });
    } catch (error) {
      toast.error(t('something_went_wrong'), { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 md:space-y-12 pb-20 p-4 md:p-0 transition-colors duration-300">
      <header>
        <h1 className="text-3xl md:text-5xl font-black italic tracking-tight text-slate-900 dark:text-white flex items-center gap-4">
          <Settings size={44} className="text-blue-600 dark:text-blue-500" />
          {t('settings')}
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Configuration Section */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Business Profile Card */}
          <div className="bg-white dark:bg-[#11161D] p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-200 dark:border-white/5 space-y-8 shadow-sm">
            <section className="space-y-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-500 flex items-center gap-2">
                <Building2 size={16} /> {t('business_profile')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-2 uppercase tracking-widest">{t('business_name')}</label>
                  <input
                    className="w-full bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all"
                    value={profile.businessName}
                    onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-2 uppercase tracking-widest">{t('currency')}</label>
                  <select
                    className="w-full bg-slate-50 dark:bg-[#090E14] p-4 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                    value={profile.currency}
                    onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                  >
                    <option value="BDT">BDT (৳) - Bangladeshi Taka</option>
                    <option value="USD">USD ($) - US Dollar</option>
                  </select>
                </div>
              </div>
            </section>

            {/* User Identity Card */}
            <section className="space-y-6 pt-8 border-t border-slate-100 dark:border-white/5">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-500 flex items-center gap-2">
                <User size={16} /> {t('identity_access')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input
                  className="w-full bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                  value={profile.owner}
                  onChange={(e) => setProfile({ ...profile, owner: e.target.value })}
                />
                <input
                  type="email"
                  className="w-full bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
            </section>
          </div>

          {/* Theme Selector Section */}
          <div className="bg-white dark:bg-[#11161D] p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-sm">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-500 flex items-center gap-2 mb-8">
              <Sun size={16} /> {t('theme')}
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'light', icon: Sun, label: 'light_mode' },
                { id: 'dark', icon: Moon, label: 'dark_mode' },
                { id: 'system', icon: Monitor, label: 'system_default' }
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all gap-3 ${
                    currentTheme === theme.id 
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-600/10 text-blue-600' 
                    : 'border-slate-100 dark:border-white/5 text-slate-400'
                  }`}
                >
                  <theme.icon size={24} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{t(theme.label)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Localization & Action */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-[#11161D] p-8 rounded-[2.5rem] md:rounded-[3rem] border border-slate-200 dark:border-white/5 space-y-6 shadow-sm">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-500 flex items-center gap-2">
              <Globe size={16} /> {t('localization')}
            </h3>

            <div className="space-y-3">
              {languages.map(item => (
                <button
                  key={item.code}
                  onClick={() => {
                    toggleLang(item.code);
                    toast.success(`${item.name} Selected`);
                  }}
                  className={`w-full p-4 rounded-2xl text-[12px] font-bold flex justify-between items-center transition-all ${
                    lang === item.code
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  <span>{item.name}</span>
                  <span className="text-lg">{item.flag}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-center items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-4 opacity-60">
              <ShieldCheck size={14} /> {t('auto_sync_enabled')}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 p-6 rounded-[2.5rem] font-black text-white flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-600/20 disabled:bg-slate-300 dark:disabled:bg-slate-800"
          >
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Save size={20} />}
            <span className="uppercase tracking-widest">{loading ? t('syncing') : t('save_settings')}</span>
          </button>
        </div>

      </div>
    </div>
  );
}