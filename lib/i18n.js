import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: { common: require('../public/locales/en/common.json') },
  bn: { common: require('../public/locales/bn/common.json') },
  ar: { common: require('../public/locales/ar/common.json') },
  ur: { common: require('../public/locales/ur/common.json') },
  ps: { common: require('../public/locales/ps/common.json') },
  hi: { common: require('../public/locales/hi/common.json') },
  ru: { common: require('../public/locales/ru/common.json') },
  zh: { common: require('../public/locales/zh/common.json') },
  es: { common: require('../public/locales/es/common.json') },
  ja: { common: require('../public/locales/ja/common.json') }
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