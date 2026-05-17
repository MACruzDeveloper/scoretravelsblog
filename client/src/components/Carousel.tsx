import { useState, useEffect } from 'react'
import { getData } from '@utils/utils'
import { URL } from '../config'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'
import Spinner from './common/Spinner'

type CarouselImage = {
  readonly _id?: string,
  filename?: string,
  pathname?: string,
  featured?: boolean,
  title?: string
}

type CarouselProps = {
  images?: string[]
  title?: string
  subtitle?: string
  autoplay?: boolean
  interval?: number
  showTitle?: boolean
}

const Carousel = ({ images, title, subtitle, autoplay = false, interval = 5000, showTitle = true }: CarouselProps) => {
  const [slideImages, setSlideImages] = useState<Array<CarouselImage>>([])
  const [slideIndex, setSlideIndex] = useState<number>(0)
  const [prevSlideIndex, setPrevSlideIndex] = useState<number | null>(null)
  const [slideStop, setSlideStop] = useState<boolean>(true)
  const [transitioning, setTransitioning] = useState<boolean>(false)
  const [entering, setEntering] = useState<boolean>(false)
  const numSlides = slideImages.length

  const options = {
    autoplay,
    time: interval,
    transition: 600
  }

  useEffect(() => {
    if (images && images.length > 0) {
      const validImages = images
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0 && item !== 'null')
        .map((filename, index) => ({ _id: `image-${index}`, filename }))
      setSlideImages(validImages)
      setSlideIndex(0)
      return
    }

    const fetchImages = async () => {
      try {
        const res = await getData(`${URL}/images/fetch_images`)
        const data = res.data.images
        const imagesFeatured = data?.filter((item: CarouselImage) => item.featured)
        setSlideImages(imagesFeatured)
      } catch (error) {
        console.log('error =>', error)
      }
    }

    fetchImages()
  }, [images])

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

  const getUrlImage = (index = slideIndex) => {
    const image = slideImages[index]
    return image && image.filename ? `${URL}/static/images/${image.filename}` : ''
  }

  const getTitleImage = (index = slideIndex) => {
    return slideImages[index]?.title || title || ''
  }

  const isPrevDisabled = slideIndex === 0 || numSlides <= 1
  const isNextDisabled = slideIndex === numSlides - 1 || numSlides <= 1

  const changeSlide = (nextIndex: number) => {
    if (nextIndex === slideIndex || numSlides === 0 || nextIndex < 0 || nextIndex >= numSlides) return

    if ('startViewTransition' in document) {
      // Use View Transition API for smooth transition
      (document as any).startViewTransition(() => {
        setSlideIndex(nextIndex)
      })
    } else {
      // Fallback to manual fade
      setPrevSlideIndex(slideIndex)
      setSlideIndex(nextIndex)
      setTransitioning(true)
      setEntering(true)
    }
    setSlideStop(true)
  }

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (slideStop && options.autoplay && numSlides > 0) {
        const nextIndex = slideIndex === numSlides - 1 ? slideIndex : slideIndex + 1
        changeSlide(nextIndex)
      }
    }, options.time)

    return () => window.clearInterval(interval)
  }, [slideIndex, slideStop, numSlides, options.autoplay, options.time])

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
        {prevSlideIndex !== null && (
          <img
            src={getUrlImage(prevSlideIndex)}
            className="carousel_image carousel_image--fade-out"
            alt={getTitleImage(prevSlideIndex)}
          />
        )}

        {slideImages.length > 0 ? (
          <img
            src={getUrlImage()}
            className={`carousel_image ${entering ? 'carousel_image--entering' : 'carousel_image--active'}`}
            alt={getTitleImage()}
          />
        ) : (
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
        {slideImages.map((ele: CarouselImage, i: number) => {
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
