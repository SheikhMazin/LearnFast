import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import zh from './locales/zh.json';
import ar from './locales/ar.json';
import hi from './locales/hi.json';
import pt from './locales/pt.json';
import sw from './locales/sw.json';

export const LANG_TO_I18N = {
  English: 'en', Spanish: 'es', French: 'fr', Mandarin: 'zh',
  Arabic: 'ar', Hindi: 'hi', Portuguese: 'pt', Swahili: 'sw',
};

const savedLang = localStorage.getItem('selectedLanguage');

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    fr: { translation: fr },
    zh: { translation: zh },
    ar: { translation: ar },
    hi: { translation: hi },
    pt: { translation: pt },
    sw: { translation: sw },
  },
  lng: LANG_TO_I18N[savedLang] || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
