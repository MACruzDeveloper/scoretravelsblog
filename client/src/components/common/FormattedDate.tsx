import { formatDate } from '@/utils/format'

type PropsFormattedDate = {
  date?: Date | string | number | null
}

const FormattedDate = ({ date }: PropsFormattedDate) => {
  const text = formatDate(date)
  if (!text) return null
  return <time dateTime={new Date(date as Date | string | number).toISOString()}>{text}</time>
}

export default FormattedDate
