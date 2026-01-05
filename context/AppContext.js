"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { dictionary } from '@/lib/dictionary';

const AppContext = createContext(null);

/**
 * AppProvider provides global state for language and theme management.
 */
export function AppProvider({ children }) {
  const [lang, setLang] = useState('bn');
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    /** Ensure the component is mounted to prevent hydration mismatch */
    setMounted(true);
  }, []);

  const t = dictionary[lang] || dictionary['bn'];

  const toggleLang = (l) => setLang(l);
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  /** Return null during SSR to avoid hydration errors */
  if (!mounted) {
    return null;
  }

  return (
    <AppContext.Provider value={{ t, lang, toggleLang, theme, toggleTheme }}>
      <div className={theme}>
        <div className="bg-white dark:bg-[#0f172a] min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-300">
          {children}
        </div>
      </div>
    </AppContext.Provider>
  );
}

/**
 * Custom hook to use the AppContext
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};