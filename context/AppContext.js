"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { dictionary } from '@/lib/dictionary';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [lang, setLang] = useState('bn');
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // হাইড্রেশন এরর এড়াতে
  }, []);

  const t = dictionary[lang] || dictionary['en'];

  const toggleLang = (l) => setLang(l);
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  if (!mounted) return null;

  return (
    <AppContext.Provider value={{ t, lang, toggleLang, theme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);