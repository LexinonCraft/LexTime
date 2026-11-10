import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import deTranslations from '@/locales/de/translation.json'
import enTranslations from '@/locales/en/translation.json'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslations },
    de: { translation: deTranslations },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
})

export const languages = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' }
]

export default i18n
