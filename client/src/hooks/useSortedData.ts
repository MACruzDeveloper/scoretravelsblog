import { useMemo, useState } from 'react'

export type SortDirection = 'asc' | 'desc'
export type SortValue = string | number | boolean | Date | null | undefined

// Empty values always go last, whatever the direction
const isEmpty = (value: SortValue) => value === null || value === undefined || value === ''

const toComparable = (value: SortValue): string | number => {
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'boolean') return Number(value)
  return value as string | number
}

export const compareValues = (a: SortValue, b: SortValue): number => {
  const left = toComparable(a)
  const right = toComparable(b)
  if (typeof left === 'string' && typeof right === 'string') {
    // Case and accent insensitive, numbers inside text in natural order
    return left.localeCompare(right, undefined, { sensitivity: 'base', numeric: true })
  }
  return left < right ? -1 : left > right ? 1 : 0
}

type Options<T> = {
  initialKey?: string | null
  initialDirection?: SortDirection
  // For columns that are not a plain field (e.g. the city name of an experience)
  getValue?: (item: T, key: string) => SortValue
}

const readField = <T,>(item: T, key: string): SortValue => (item as Record<string, SortValue>)[key]

/** Sort state for a table: click a column to sort by it, click again to reverse. */
export const useSortedData = <T,>(data: T[], { initialKey = null, initialDirection = 'asc', getValue }: Options<T> = {}) => {
  const [sortColumn, setSortColumn] = useState<string | null>(initialKey)
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialDirection)

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(key)
      setSortDirection('asc')
    }
  }

  const sorted = useMemo(() => {
    if (!sortColumn) return data
    const read = getValue ?? readField
    const direction = sortDirection === 'asc' ? 1 : -1
    return [...data].sort((a, b) => {
      const left = read(a, sortColumn)
      const right = read(b, sortColumn)
      if (isEmpty(left) || isEmpty(right)) return Number(isEmpty(left)) - Number(isEmpty(right))
      return compareValues(left, right) * direction
    })
  }, [data, sortColumn, sortDirection, getValue])

  return { sorted, sortColumn, sortDirection, handleSort }
}
