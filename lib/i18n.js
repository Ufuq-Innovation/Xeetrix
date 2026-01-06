import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend'; //  npm install i18next-http-backend

i18n
  .use(HttpApi) // Dynamic loading from locales folder
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'bn', 'ar', 'ur', 'ps', 'hi', 'ru', 'zh', 'es', 'ja'],
    backend: {
      loadPath: '/locales/{{lng}}/common.json', // Pick files from public/locales folder
    },
    detection: {
      order: ['localStorage', 'cookie', 'htmlTag'],
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false }
  });

export default i18n;