// lib/i18n.js
"use client"; // 🔥 must be at top for Next.js client-only

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Only import these in browser
let LanguageDetector, HttpApi;
if (typeof window !== 'undefined') {
  LanguageDetector = require('i18next-browser-languagedetector').default;
  HttpApi = require('i18next-http-backend').default;

  i18n
    .use(HttpApi)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      supportedLngs: ['en', 'bn', 'ar', 'ur', 'ps', 'hi', 'ru', 'zh', 'es', 'ja'],
      ns: ['common'],
      defaultNS: 'common',
      backend: {
        loadPath: '/locales/{{lng}}/common.json',
      },
      detection: {
        order: ['localStorage', 'cookie', 'htmlTag'],
        caches: ['localStorage'],
      },
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false, // Prevents build errors
      },
      initImmediate: true,
    });
}

export default i18n;
