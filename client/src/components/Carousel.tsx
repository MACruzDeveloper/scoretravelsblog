import { useState, useEffect } from 'react'
import { getData } from '../utils/utils'
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

const Carousel = () => {
  const [slideImages, setSlideImages] = useState<Array<CarouselImage>>([])
  const [slideIndex, setSlideIndex] = useState<number>(0)
  const [prevSlideIndex, setPrevSlideIndex] = useState<number | null>(null)
  const [slideStop, setSlideStop] = useState<boolean>(true)
  const [transitioning, setTransitioning] = useState<boolean>(false)
  const [entering, setEntering] = useState<boolean>(false)
  const numSlides = slideImages.length

  const options = {
    autoplay: false,
    time: 5000,
    transition: 600
  }

  useEffect(() => {
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
  }, [])

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
    return image ? `${URL}/static/images/${image.filename}` : ''
  }

  const getTitleImage = (index = slideIndex) => {
    return slideImages[index]?.title
  }

  const changeSlide = (nextIndex: number) => {
    if (nextIndex === slideIndex || numSlides === 0) return

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
        const nextIndex = slideIndex === numSlides - 1 ? 0 : slideIndex + 1
        changeSlide(nextIndex)
      }
    }, options.time)

    return () => window.clearInterval(interval)
  }, [slideIndex, slideStop, numSlides, options.autoplay, options.time])

  const handleClickPrev = () => {
    if (numSlides === 0) return
    const nextIndex = slideIndex === 0 ? numSlides - 1 : slideIndex - 1
    changeSlide(nextIndex)
  }

  const handleClickNext = () => {
    if (numSlides === 0) return
    const nextIndex = slideIndex === numSlides - 1 ? 0 : slideIndex + 1
    changeSlide(nextIndex)
  }

  const onClickDot = (i: number) => {
    changeSlide(i)
  }

  return <div className="carousel">
    <div className="carousel_wrapper">
      <div className="carousel_title">
        <h2>Score Travels</h2>
        <p>Help the trips to highlight!</p>
      </div>

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

    <div className="carousel_navs">
      <button className="carousel_nav prev" onClick={handleClickPrev}>
        <MdChevronLeft />
      </button>
      <button className="carousel_nav next" onClick={handleClickNext}>
        <MdChevronRight />
      </button>
    </div>

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
  </div>
}

export default Carousel
