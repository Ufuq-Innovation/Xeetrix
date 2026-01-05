import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// এখানে আমরা পরে ব্যাকেন্ড থেকে বা লোকাল ফাইল থেকে ডাটা লোড করব
const resources = {
  en: { common: require('../public/locales/en/common.json') },
  bn: { common: require('../public/locales/bn/common.json') },
  ar: { common: require('../public/locales/ar/common.json') }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false }
  });

export default i18n;