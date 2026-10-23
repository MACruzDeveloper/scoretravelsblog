const pad = (value: number) => String(value).padStart(2, '0')

/** Formats a date as YYYY/MM/DD in local time. Returns '' for missing or invalid dates. */
export const formatDate = (value?: Date | string | number | null): string => {
  if (value == null || value === '') return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`
}
