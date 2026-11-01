import { useTranslation } from 'react-i18next'
import type { Language } from '@/i18n'
import { organizationOf, type Milestone } from '@/data/career'
import { formatPeriod } from './period'
import { TYPE_ICONS } from './milestoneTypes'

// Forward: the card comes from the right, like the road ahead of the car
export type SlideDirection = 'forward' | 'backward'

type PropsMilestoneCard = {
  milestone: Milestone
  direction?: SlideDirection
}

// Details of the milestone the car is going to. A new milestone mounts a new card, which slides
// in the way the car drives (About gives it the milestone id as key)
const MilestoneCard = ({ milestone, direction = 'forward' }: PropsMilestoneCard) => {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as Language
  const Icon = TYPE_ICONS[milestone.type]

  return (
    <article className={`milestone_card type_${milestone.type}`} data-direction={direction}>
      <p className="milestone_meta">
        <span className="milestone_type">
          <Icon aria-hidden /> {t(`about.types.${milestone.type}`)}
        </span>
        <span className="milestone_period">{formatPeriod(milestone, lang, t('about.present'))}</span>
      </p>
      <h2 className="milestone_title">{milestone.title[lang]}</h2>
      <p className="milestone_organization">
        {organizationOf(milestone, lang)}
        {milestone.place && <span> · {milestone.place[lang]}</span>}
      </p>
      {milestone.description && <p className="milestone_description">{milestone.description[lang]}</p>}
      {milestone.tags && milestone.tags.length > 0 && (
        <ul className="milestone_tags">
          {milestone.tags.map((tag) => <li key={tag}>{tag}</li>)}
        </ul>
      )}
      {milestone.link && (
        <a className="milestone_link" href={milestone.link} target="_blank" rel="noopener noreferrer">
          {t('about.link')} →
        </a>
      )}
    </article>
  )
}

export default MilestoneCard
