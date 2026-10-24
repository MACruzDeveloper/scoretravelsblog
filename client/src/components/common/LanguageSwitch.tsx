import { useTranslation } from 'react-i18next'
import { LANGUAGES, changeLanguage } from '@/i18n'

// ES | EN toggle; the choice is remembered for the next visit
const LanguageSwitch = () => {
  const { t, i18n } = useTranslation()

  return (
    <div className="language_switch" role="group" aria-label={t('language.label')}>
      {LANGUAGES.map((language) => (
        <button
          key={language}
          type="button"
          lang={language}
          className={i18n.language === language ? 'active' : ''}
          aria-pressed={i18n.language === language}
          aria-label={t(`language.${language}`)}
          onClick={() => changeLanguage(language)}
        >
          {language.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export default LanguageSwitch
