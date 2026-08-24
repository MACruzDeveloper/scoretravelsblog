import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import {
  useBestExperiences,
  useLastExperiences,
  useTimelineExperiences,
} from '@hooks/useExperienceHooks'
import { useExperienceStore } from '@store/experienceStore'

const experiences = [
  { _id: 'old', title: 'Old', date: new Date('2022-01-01'), score: 3 },
  { _id: 'recent', title: 'Recent', date: new Date('2024-01-01'), score: 4 },
  { _id: 'best', title: 'Best', date: new Date('2023-01-01'), score: 5 },
  { _id: 'middle', title: 'Middle', date: new Date('2021-01-01'), score: 2 },
]

afterEach(() => {
  useExperienceStore.setState({
    experiences: [],
    loading: false,
    error: undefined,
    hasFetched: false,
  })
})

describe('useExperienceHooks', () => {
  it('returns the three most recent experiences', () => {
    useExperienceStore.setState({ experiences })

    const { result } = renderHook(() => useLastExperiences())

    expect(result.current.lastExperiences.map(({ _id }) => _id)).toEqual([
      'recent',
      'best',
      'old',
    ])
  })

  it('returns the three highest scored experiences', () => {
    useExperienceStore.setState({ experiences })

    const { result } = renderHook(() => useBestExperiences())

    expect(result.current.bestExperiences.map(({ _id }) => _id)).toEqual([
      'best',
      'recent',
      'old',
    ])
  })

  it('returns the highest scored experience for each year', () => {
    useExperienceStore.setState({
      experiences: [
        ...experiences,
        { _id: 'same-year-best', title: 'Same year best', date: new Date('2024-05-01'), score: 5 },
      ],
    })

    const { result } = renderHook(() => useTimelineExperiences())

    expect(result.current.timelineExperiences.map(({ _id }) => _id)).toEqual([
      'middle',
      'old',
      'best',
      'same-year-best',
    ])
  })
})
