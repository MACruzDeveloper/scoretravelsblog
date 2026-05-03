
import { lazy, Suspense, useEffect } from 'react'
import { useExperienceStore } from '@/store/experienceStore'
import Spinner from './common/Spinner'

const Carousel = lazy(() => import('@/components/Carousel.js'))
const LastExperiences = lazy(() => import('@/components/experiences/LastExperiences.js'))
const Timeline = lazy(() => import('@/components/Timeline.js'))
const BestExperiences = lazy(() => import('@/components/experiences/BestExperiences.js'))
const MapExperiences = lazy(() => import('@/components/MapExperiences.js'))

const Home = () => {
  const fetchExperiences = useExperienceStore(state => state.fetchExperiences)

  useEffect(() => {
    fetchExperiences()
  }, [fetchExperiences])

  return <div className="page home">
    <Suspense fallback={<Spinner />}>
      <Carousel />
    </Suspense>

    <div className="block">
      <div className="container">
        <Suspense fallback={<Spinner />}>
          <LastExperiences />
        </Suspense>
      </div>
    </div>

    <div className="block">
      <div className="container full">
        <Suspense fallback={<Spinner />}>
          <MapExperiences />
        </Suspense>
      </div>
    </div>

    <div className="block">
      <div className="container">
        <Suspense fallback={<Spinner />}>
          <BestExperiences />
        </Suspense>
      </div>
    </div>

    <div className="block">
      <Suspense fallback={<Spinner />}>
        <Timeline />
      </Suspense>
    </div>
  </div>
}

export default Home