"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { dictionary } from '@/lib/dictionary';

const AppContext = createContext(null);

/**
 * AppProvider: Global State Management
 * Handles Language Persistence and Theme switching.
 */
export function AppProvider({ children }) {
  const [lang, setLang] = useState('bn');
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 1. Load saved preferences from LocalStorage on mount
    const savedLang = localStorage.getItem('xeetrix_lang');
    const savedTheme = localStorage.getItem('xeetrix_theme');

    if (savedLang) setLang(savedLang);
    if (savedTheme) setTheme(savedTheme);

    setMounted(true);
  }, []);

  // 2. Persist language changes
  const toggleLang = (l) => {
    setLang(l);
    localStorage.setItem('xeetrix_lang', l);
  };

  // 3. Persist theme changes
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('xeetrix_theme', newTheme);
  };

  const t = dictionary[lang] || dictionary['bn'];

  // Prevent Hydration mismatch by not rendering until mounted
  if (!mounted) return null;

  return (
    <AppContext.Provider value={{ t, lang, toggleLang, theme, toggleTheme }}>
      <div className={theme}>
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