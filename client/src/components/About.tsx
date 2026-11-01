import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import '@/i18n'
import type { Language } from '@/i18n'
import { milestones, profile, startIndex } from '@/data/career'
import Seo from '@/components/common/Seo'
import LanguageSwitch from '@/components/common/LanguageSwitch'
import CareerRoad from '@/components/about/CareerRoad'
import MilestoneCard, { type SlideDirection } from '@/components/about/MilestoneCard'
import Projects from '@/components/about/Projects'

// Portfolio page: the author's career as a road trip, in Spanish or English
const About = () => {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as Language
  const [active, setActive] = useState(startIndex)
  // The milestone in the card, and where it comes from: it slides in the way the car drives
  const [card, setCard] = useState({ index: startIndex, direction: 'forward' as SlideDirection })
  const showMilestone = useCallback((index: number) => {
    setCard((current) =>
      current.index === index ? current : { index, direction: index < current.index ? 'backward' : 'forward' }
    )
  }, [])

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

      <CareerRoad milestones={milestones} active={active} onChange={setActive} onSettle={showMilestone} />
      {/* Screen readers announce each milestone the car stops at */}
      <div className="milestone_card_wrapper" aria-live="polite">
        <MilestoneCard key={milestones[card.index].id} milestone={milestones[card.index]} direction={card.direction} />
      </div>

      <Projects />
    </div>
  )
}

export default About
