
import { lazy, Suspense } from 'react'
import Spinner from './common/Spinner'
import Carousel from '@/components/Carousel'

const LastExperiences = lazy(() => import('@/components/experiences/LastExperiences.js'))
const Timeline = lazy(() => import('@/components/Timeline.js'))
const BestExperiences = lazy(() => import('@/components/experiences/BestExperiences.js'))
const MapExperiences = lazy(() => import('@/components/MapExperiences.js'))

const Home = () => {
  return <div className="page home">
    <Carousel hasVideo />

    <div className="block">
      <div className="container">
        <Suspense fallback={<Spinner />}>
          <BestExperiences />
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
          <LastExperiences />
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