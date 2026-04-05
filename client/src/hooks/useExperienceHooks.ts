import { useMemo } from 'react'
import { useExperienceStore, Experience } from '../store/experienceStore'
import { sortBy } from 'lodash'

export const useLastExperiences = () => {
  const { experiences, loading, error } = useExperienceStore()
  const lastExperiences = useMemo(() => {
    const numDisplay = 3
    const sortedExps = sortBy(experiences, ['date']).reverse()
    return sortedExps.slice(0, numDisplay)
  }, [experiences])

  return { lastExperiences, loading, error }
}

export const useBestExperiences = () => {
  const { experiences, loading, error } = useExperienceStore()
  const bestExperiences = useMemo(() => {
    const numDisplay = 3
    const sortedExps = sortBy(experiences, ['date'])
    const expsWithScore = sortedExps.filter(item => item.score)
    let bestExps = sortBy(expsWithScore, ['score']).reverse()
    bestExps = bestExps.slice(0, numDisplay)
    return bestExps
  }, [experiences])

  return { bestExperiences, loading, error }
}

export const useTimelineExperiences = () => {
  const { experiences, loading, error } = useExperienceStore()
  const timelineExperiences = useMemo(() => {
    const filteredExpsWithScore = experiences?.filter((elem: Experience) => elem.score)
    const sortedExperiences = sortBy(filteredExpsWithScore, ['date'])

    let tempExps: Array<Experience & { year: number }> = []
    for (let ele of sortedExperiences) {
      const date = new Date(ele.date || '')
      tempExps.push({
        ...ele,
        year: date.getFullYear()
      })
    }

    const groupBy = (array: any[], key: string) => {
      return array.reduce((result, currentValue) => {
        (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue)
        return result
      }, {})
    }

    const expsByDate = groupBy(tempExps, 'year')
    const tempExpsByDateAsArray: Experience[] = []
    Object.values(expsByDate).forEach((element: any) => {
      const filteredExpsByDate = element.reduce((prev: any, current: any) => (prev && prev.score > current.score) ? prev : current)
      tempExpsByDateAsArray.push(filteredExpsByDate)
    })

    return tempExpsByDateAsArray
  }, [experiences])

  return { timelineExperiences, loading, error }
}