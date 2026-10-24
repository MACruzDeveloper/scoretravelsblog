import { useTranslation } from 'react-i18next'
import type { Language } from '@/i18n'
import type { Milestone } from '@/data/career'
import { formatPeriod } from './period'
import { TYPE_ICONS } from './milestoneTypes'

type PropsMilestoneCard = {
  milestone: Milestone
}

// Details of the milestone under the car. Screen readers announce each change
const MilestoneCard = ({ milestone }: PropsMilestoneCard) => {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as Language
  const Icon = TYPE_ICONS[milestone.type]

  return (
    <div className="milestone_card_wrapper" aria-live="polite">
      {/* The key restarts the fade-in animation on every milestone */}
      <article key={milestone.id} className={`milestone_card type_${milestone.type}`}>
        <p className="milestone_meta">
          <span className="milestone_type">
            <Icon aria-hidden /> {t(`about.types.${milestone.type}`)}
          </span>
          <span className="milestone_period">{formatPeriod(milestone, lang, t('about.present'))}</span>
        </p>
        <h2 className="milestone_title">{milestone.title[lang]}</h2>
        <p className="milestone_organization">
          {milestone.organization}
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
            {t('about.link')} ↗
          </a>
        )}
      </article>
    </div>
  )
}

export default MilestoneCard
