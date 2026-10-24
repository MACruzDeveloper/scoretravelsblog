import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import es from './locales/es.json'
import en from './locales/en.json'

export const LANGUAGES = ['es', 'en'] as const
export type Language = (typeof LANGUAGES)[number]
const STORAGE_KEY = 'lang'

// The visitor's last choice; Spanish by default
const savedLanguage = (): Language => {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return LANGUAGES.includes(value as Language) ? (value as Language) : 'es'
  } catch {
    return 'es'
  }
}

i18n.use(initReactI18next).init({
  resources: { es: { translation: es }, en: { translation: en } },
  lng: savedLanguage(),
  fallbackLng: 'es',
  // Resources are bundled, so there is nothing to wait for
  initAsync: false,
  interpolation: { escapeValue: false },
})

export const changeLanguage = (language: Language) => {
  try {
    localStorage.setItem(STORAGE_KEY, language)
  } catch {
    // Private mode: the choice lasts until the page reloads
  }
  return i18n.changeLanguage(language)
}

export default i18n
