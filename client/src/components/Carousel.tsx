import { useState, useEffect, useCallback } from 'react'
import { URL } from '../config'
import { listImages } from '@/api/images'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'
import Spinner from './common/Spinner'
import video from '../assets/videos/home.mp4'

type CarouselSlide = {
  readonly _id: string
  filename: string
  type: 'image' | 'video'
  pathname?: string
  featured?: boolean
  title?: string
}

type CarouselProps = {
  images?: string[]
  title?: string
  subtitle?: string
  autoplay?: boolean
  interval?: number
  showTitle?: boolean
  hasVideo?: boolean
}

// Home video as the first slide
const videoSlideFor = (title?: string): CarouselSlide => ({ _id: 'video-slide', filename: video, type: 'video', title })

const Carousel = ({ images, title, subtitle, autoplay = false, interval = 5000, showTitle = true, hasVideo = false }: CarouselProps) => {
  const [slideItems, setSlideItems] = useState<Array<CarouselSlide>>(hasVideo ? [videoSlideFor(title)] : [])
  const [slideIndex, setSlideIndex] = useState<number>(0)
  const [prevSlideIndex, setPrevSlideIndex] = useState<number | null>(null)
  // Autoplay keeps running after manual navigation
  const [isAutoplayOn, setIsAutoplayOn] = useState<boolean>(true)
  const [transitioning, setTransitioning] = useState<boolean>(false)
  const [entering, setEntering] = useState<boolean>(false)
  const numSlides = slideItems.length

  const options = {
    autoplay,
    time: interval,
    transition: 600
  }

  useEffect(() => {
    if (images && images.length > 0) {
      const validImages = images
        .filter((item) => item.trim().length > 0)
        .map((filename, index): CarouselSlide => ({ _id: `image-${index}`, filename, type: 'image' }))
      setSlideItems([...(hasVideo ? [videoSlideFor(title)] : []), ...validImages])
      setSlideIndex(0)
      return
    }

    const fetchImages = async () => {
      try {
        const imagesFeatured = (await listImages())
          .filter((item) => item.featured)
          .map((image, index): CarouselSlide => ({
            _id: `image-${index}`,
            filename: image.filename,
            type: 'image',
            title: image.title,
            featured: image.featured
          })) || []
        setSlideItems([...(hasVideo ? [videoSlideFor(title)] : []), ...imagesFeatured])
      } catch (error) {
        // The carousel just shows the video if the images cannot be loaded
        console.error(error)
      }
    }

    fetchImages()
  }, [images, title, hasVideo])

  useEffect(() => {
    if (!transitioning) return
    const timeout = window.setTimeout(() => {
      setPrevSlideIndex(null)
      setTransitioning(false)
    }, options.transition)

    return () => window.clearTimeout(timeout)
  }, [transitioning, options.transition])

  useEffect(() => {
    if (entering) {
      // Force re-render to change class from --entering to --active
      setEntering(false)
    }
  }, [entering])

  const getUrlForSlide = (index = slideIndex) => {
    const slide = slideItems[index]
    if (!slide || !slide.filename) return ''

    return slide.type === 'image' ? `${URL}/static/images/${slide.filename}` : slide.filename
  }

  const getTitleForSlide = (index = slideIndex) => {
    return slideItems[index]?.title || title || ''
  }

  const isPrevDisabled = slideIndex === 0 || numSlides <= 1
  const isNextDisabled = slideIndex === numSlides - 1 || numSlides <= 1

  const changeSlide = useCallback((nextIndex: number) => {
    if (nextIndex === slideIndex || numSlides === 0 || nextIndex < 0 || nextIndex >= numSlides) return

    if ('startViewTransition' in document) {
      // Use View Transition API for smooth transition
      document.startViewTransition(() => {
        setSlideIndex(nextIndex)
      })
    } else {
      // Fallback to manual fade
      setPrevSlideIndex(slideIndex)
      setSlideIndex(nextIndex)
      setTransitioning(true)
      setEntering(true)
    }
    setIsAutoplayOn(true)
  }, [slideIndex, numSlides])

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (isAutoplayOn && options.autoplay && numSlides > 0) {
        const nextIndex = (slideIndex + 1) % numSlides
        changeSlide(nextIndex)
      }
    }, options.time)

    return () => window.clearInterval(interval)
  }, [slideIndex, isAutoplayOn, numSlides, options.autoplay, options.time, changeSlide])

  const handleClickPrev = () => {
    if (isPrevDisabled) return
    changeSlide(slideIndex - 1)
  }

  const handleClickNext = () => {
    if (isNextDisabled) return
    changeSlide(slideIndex + 1)
  }

  const onClickDot = (i: number) => {
    changeSlide(i)
  }

  return <div className="carousel">
    <div className="carousel_wrapper">
      {showTitle && (
        <div className="carousel_title">
          <h2>{title || 'Score Travels'}</h2>
          <p>{subtitle || 'Help the trips to highlight!'}</p>
        </div>
      )}

      <div className="carousel_images">
        {prevSlideIndex !== null && (() => {
          const prevSlide = slideItems[prevSlideIndex]
          if (!prevSlide) return null

          return prevSlide.type === 'video' ? (
            <video
              src={prevSlide.filename}
              className="carousel_image carousel_image--fade-out"
              autoPlay
              muted
              loop
              playsInline
              aria-label={getTitleForSlide(prevSlideIndex)}
            />
          ) : (
            <img
              src={getUrlForSlide(prevSlideIndex)}
              className="carousel_image carousel_image--fade-out"
              alt={getTitleForSlide(prevSlideIndex)}
            />
          )
        })()}

        {slideItems.length > 0 ? (() => {
          const activeSlide = slideItems[slideIndex]
          if (!activeSlide) return null

          return activeSlide.type === 'video' ? (
            <video
              src={activeSlide.filename}
              className={`carousel_image ${entering ? 'carousel_image--entering' : 'carousel_image--active'}`}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-label={getTitleForSlide()}
            />
          ) : (
            <img
              src={getUrlForSlide()}
              className={`carousel_image ${entering ? 'carousel_image--entering' : 'carousel_image--active'}`}
              alt={getTitleForSlide()}
              fetchPriority="high"
            />
          )
        })() : (
          <Spinner />
        )}
      </div>
    </div>

    {numSlides > 1 && (
      <div className="carousel_navs">
        <button className={`carousel_nav prev ${isPrevDisabled ? 'disabled' : ''}`} onClick={handleClickPrev} disabled={isPrevDisabled}>
          <MdChevronLeft />
        </button>
        <button className={`carousel_nav next ${isNextDisabled ? 'disabled' : ''}`} onClick={handleClickNext} disabled={isNextDisabled}>
          <MdChevronRight />
        </button>
      </div>
    )}

    {numSlides > 1 && (
      <div className="carousel_dots">
        {slideItems.map((ele: CarouselSlide, i: number) => {
          return (
            <button
              key={ele._id}
              className={`carousel_dot ${slideIndex === i ? 'active' : ''}`}
              onClick={() => onClickDot(i)}></button>
          )
        })}
      </div>
    )}
  </div>
}

export default Carousel
