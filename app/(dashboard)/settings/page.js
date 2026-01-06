"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from "@/context/AppContext";
import { Settings, Globe, Building2, User, Save, ShieldCheck, Sun, Moon, Monitor } from 'lucide-react';
import { toast } from "sonner";

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

export default function SettingsPage() {
  const { lang, toggleLang } = useApp();
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('dark');

  // পেজ লোড হওয়ার সময় বর্তমান থিম সেট করা
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'system';
    setCurrentTheme(savedTheme);
  }, []);

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    const applyTheme = (target) => {
      root.classList.add(target);
      root.style.colorScheme = target;
    };

    if (theme === 'system') {
      localStorage.removeItem('theme');
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      applyTheme(systemTheme);
    } else {
      localStorage.setItem('theme', theme);
      applyTheme(theme);
    }
    toast.success(t('settings_saved_success'));
  };

  return (
    <div className="space-y-10 pb-20 p-4 md:p-0">
      <header>
        <h1 className="text-3xl md:text-5xl font-black italic tracking-tight text-slate-900 dark:text-white flex items-center gap-4">
          <Settings size={44} className="text-blue-600" />
          {t('settings')}
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Theme Selector */}
          <div className="theme-card p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-sm">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2 mb-8">
              <Sun size={16} /> {t('theme')}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'light', icon: Sun, label: 'light_mode' },
                { id: 'dark', icon: Moon, label: 'dark_mode' },
                { id: 'system', icon: Monitor, label: 'system_default' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleThemeChange(item.id)}
                  className={`flex flex-col items-center p-5 rounded-3xl border-2 transition-all gap-3 ${
                    currentTheme === item.id 
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-600/10 text-blue-600' 
                    : 'border-transparent bg-slate-100 dark:bg-white/5 text-slate-400'
                  }`}
                >
                  <item.icon size={24} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{t(item.label)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Localization */}
        <div className="theme-card p-8 rounded-[2.5rem] space-y-6 shadow-sm">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
            <Globe size={16} /> {t('localization')}
          </h3>
          <div className="space-y-3">
            {languages.map(item => (
              <button
                key={item.code}
                onClick={() => toggleLang(item.code)}
                className={`w-full p-4 rounded-2xl text-[12px] font-bold flex justify-between items-center ${
                  lang === item.code ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500'
                }`}
              >
                <span>{item.name}</span>
                <span>{item.flag}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}