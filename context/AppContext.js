"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../lib/i18n'; 

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('xeetrix_lang') || 'bn';
    const savedTheme = localStorage.getItem('xeetrix_theme') || 'dark';
    
    i18n.changeLanguage(savedLang);
    setTheme(savedTheme);
    setMounted(true);
  }, [i18n]);

  const toggleLang = (l) => {
    i18n.changeLanguage(l);
    localStorage.setItem('xeetrix_lang', l);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('xeetrix_theme', newTheme);
  };

  if (!mounted) return null;


  const isRTL = ['ar', 'ur', 'ps'].includes(i18n.language);

  return (
    <AppContext.Provider value={{ t, lang: i18n.language, toggleLang, theme, toggleTheme }}>
      <div dir={isRTL ? 'rtl' : 'ltr'} className={theme}>
        <div className="bg-[#090E14] dark:bg-[#090E14] min-h-screen text-slate-100 transition-colors duration-300">
          {children}
        </div>
      </div>
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};