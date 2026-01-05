"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../lib/i18n'; // Importing the i18n configuration

const AppContext = createContext(null);

/**
 * AppProvider: Global State Management
 * Integrated with i18next for multi-language scaling and RTL support.
 */
export function AppProvider({ children }) {
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Sync language and theme from localStorage on initial mount
    const savedLang = localStorage.getItem('xeetrix_lang') || 'bn';
    const savedTheme = localStorage.getItem('xeetrix_theme') || 'dark';
    
    i18n.changeLanguage(savedLang);
    setTheme(savedTheme);
    setMounted(true);
  }, [i18n]);

  // Handle language switching with persistence
  const toggleLang = (l) => {
    i18n.changeLanguage(l);
    localStorage.setItem('xeetrix_lang', l);
  };

  // Handle theme switching with persistence
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('xeetrix_theme', newTheme);
  };

  // Prevent hydration mismatch
  if (!mounted) return null;

  return (
    <AppContext.Provider value={{ t, lang: i18n.language, toggleLang, theme, toggleTheme }}>
      {/* The 'dir' attribute automatically handles RTL for Arabic, Urdu, Pashto */}
      <div dir={i18n.dir()} className={theme}>
        <div className="bg-[#090E14] dark:bg-[#090E14] min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-300">
          {children}
        </div>
      </div>
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};