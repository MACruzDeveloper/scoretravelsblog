type SortKey<T> = keyof T | ((item: T) => unknown)

/**
 * Stable ascending sort that returns a new array, like lodash `sortBy`.
 * Null and undefined values go last.
 */
export const sortBy = <T>(items: readonly T[], key: SortKey<T>): T[] => {
  const getValue = typeof key === 'function' ? key : (item: T) => item[key]
  return items
    .map((item, index) => ({ item, index, value: getValue(item) as string | number | null | undefined }))
    .sort((a, b) => {
      if (a.value == null || b.value == null) {
        if (a.value == null && b.value == null) return a.index - b.index
        return a.value == null ? 1 : -1
      }
      if (a.value < b.value) return -1
      if (a.value > b.value) return 1
      return a.index - b.index
    })
    .map(({ item }) => item)
}

/** Splits an array into groups of `size` items, like lodash `chunk`. */
export const chunk = <T>(items: readonly T[], size: number): T[][] => {
  const groups: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    groups.push(items.slice(i, i + size))
  }
  return groups
}
