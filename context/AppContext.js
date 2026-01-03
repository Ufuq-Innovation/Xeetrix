"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { dictionary } from '@/lib/dictionary';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [lang, setLang] = useState('bn');
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // ব্রাউজার লোড হওয়া নিশ্চিত করা
    setMounted(true);
  }, []);

  const t = dictionary[lang] || dictionary['bn'];

  const toggleLang = (l) => setLang(l);
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // বিল্ড এবং হাইড্রেশন এরর থেকে বাঁচার একমাত্র উপায়
  if (!mounted) {
    return null;
  }

  return (
    <AppContext.Provider value={{ t, lang, toggleLang, theme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  return context;
};