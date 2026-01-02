"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { dictionary } from '@/lib/dictionary';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [lang, setLang] = useState('bn'); // Default Bangla
  const [theme, setTheme] = useState('dark');
  const t = dictionary[lang];

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') || 'bn';
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setLang(savedLang);
    setTheme(savedTheme);
  }, []);

  const toggleLang = (l) => {
    setLang(l);
    localStorage.setItem('lang', l);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <AppContext.Provider value={{ lang, t, toggleLang, theme, toggleTheme }}>
      <div className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
        {children}
      </div>
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);