import type { Language } from '@/i18n'
import type { Milestone } from '@/data/career'

// 'YYYY' stays as is; 'YYYY-MM' becomes "oct 2008" / "Oct 2008"
const formatDate = (value: string, lang: Language) => {
  const [year, month] = value.split('-').map(Number)
  if (!month) return String(year)
  return new Intl.DateTimeFormat(lang, { month: 'short', year: 'numeric' }).format(new Date(year, month - 1))
}

// "oct 2008 – ago 2012", "sept 2020 – actualidad" or a single date
export const formatPeriod = ({ start, end }: Pick<Milestone, 'start' | 'end'>, lang: Language, presentLabel: string) => {
  const from = formatDate(start, lang)
  if (!end || end === start) return from
  return `${from} – ${end === 'present' ? presentLabel : formatDate(end, lang)}`
}
