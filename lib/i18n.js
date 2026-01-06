import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

// Essential check to differentiate between Browser and Server (Build time)
const isBrowser = typeof window !== 'undefined';

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
      // Static files are served from the public folder
      loadPath: '/locales/{{lng}}/common.json',
    },
    detection: {
      order: ['localStorage', 'cookie', 'htmlTag'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
    /**
     * Critical for Next.js Static Generation:
     * Disabling suspense prevents the build worker from waiting for translation files,
     * which was causing the 60s timeout error on Vercel.
     */
    react: {
      useSuspense: false,
    },
    // Only fetch resources on the client side
    initImmediate: isBrowser,
  });

export default i18n;