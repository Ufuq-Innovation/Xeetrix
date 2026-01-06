"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../lib/i18n'; 

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);
  // Default currency state
  const [currency, setCurrency] = useState({ code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' });

  useEffect(() => {
    const savedLang = localStorage.getItem('xeetrix_lang') || 'bn';
    const savedTheme = localStorage.getItem('xeetrix_theme') || 'dark';
    const savedCurrency = localStorage.getItem('xeetrix_currency');
    
    i18n.changeLanguage(savedLang);
    setTheme(savedTheme);
    
    if (savedCurrency) {
      setCurrency(JSON.parse(savedCurrency));
    }

    setMounted(true);
  }, [i18n]);

  const toggleLang = (l) => {
    i18n.changeLanguage(l);
    localStorage.setItem('xeetrix_lang', l);
  };

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('xeetrix_theme', newTheme);
    
    // Applying to document for Tailwind
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(newTheme);
    }
  };

  const updateCurrency = (c) => {
    setCurrency(c);
    localStorage.setItem('xeetrix_currency', JSON.stringify(c));
  };

  if (!mounted) return null;

  const isRTL = ['ar', 'ur', 'ps'].includes(i18n.language);

  return (
    <AppContext.Provider value={{ t, lang: i18n.language, toggleLang, theme, toggleTheme, currency, updateCurrency }}>
      <div dir={isRTL ? 'rtl' : 'ltr'} className={theme}>
        <div className="bg-[#F8FAFC] dark:bg-[#090E14] min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-300">
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