import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import '@/i18n'
import type { Language } from '@/i18n'
import { milestones, profile } from '@/data/career'
import Seo from '@/components/common/Seo'
import LanguageSwitch from '@/components/common/LanguageSwitch'
import CareerRoad from '@/components/about/CareerRoad'
import MilestoneCard from '@/components/about/MilestoneCard'

// Portfolio page: the author's career as a road trip, in Spanish or English
const About = () => {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as Language
  // The trip starts at the first milestone
  const [active, setActive] = useState(0)

  return (
    <div className="page about" lang={lang}>
      <Seo title={t('about.seoTitle')} description={t('about.seoDescription')} />

      <header className="about_intro">
        <div>
          <h1 className="about_name">{profile.name}</h1>
          <p className="about_headline">
            {profile.headline[lang]} · {profile.place[lang]}
          </p>
        </div>
        <div className="about_actions">
          <nav className="about_links" aria-label={t('about.links')}>
            {profile.links.map((link) => (
              <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            ))}
          </nav>
          <LanguageSwitch />
        </div>
      </header>

      <CareerRoad milestones={milestones} active={active} onChange={setActive} />
      <MilestoneCard milestone={milestones[active]} />
    </div>
  )
}

export default About
