import { useState, useEffect, useCallback, useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { MdDelete } from 'react-icons/md'
import { listImageLibrary, setImageFeatured, deleteImage } from '@/api/images'
import type { LibraryImage } from '@/api/types'
import { URL } from '../../config'
import { useMessage } from '@/hooks/useMessage'
import ImageUpload from './ImageUpload'
import Msgbox from '@common/Msgbox'
import Pagination from '@/components/common/Pagination'

// Five full rows of the five-column grid
const PAGE_SIZE = 25

// Most experience photos never need the admin: the carousel and the unused ones come first
const TABS = [
  { key: 'featured', label: 'Carousel', matches: (image: LibraryImage) => image.featured },
  { key: 'unused', label: 'Unused', matches: (image: LibraryImage) => !image.featured && !image.experience },
  { key: 'used', label: 'In experiences', matches: (image: LibraryImage) => Boolean(image.experience) },
  { key: 'all', label: 'All', matches: () => true },
] as const

type TabKey = (typeof TABS)[number]['key']

const Images = () => {
  const [images, setImages] = useState<LibraryImage[]>([])
  const [tab, setTab] = useState<TabKey>('featured')
  const [page, setPage] = useState(1)
  const { message, showOk, showError } = useMessage()

  const loadImages = useCallback(async () => {
    try {
      setImages(await listImageLibrary())
    } catch (error) {
      showError(error, 'Could not load images')
    }
  }, [showError])

  useEffect(() => {
    loadImages()
  }, [loadImages])

  const counts = useMemo(
    () => Object.fromEntries(TABS.map((t) => [t.key, images.filter(t.matches).length])) as Record<TabKey, number>,
    [images]
  )
  const visible = useMemo(() => images.filter(TABS.find((t) => t.key === tab)!.matches), [images, tab])
  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE))

  // A page that no longer exists (after deleting the last image of it) goes back to the last one
  useEffect(() => {
    if (page > pages) setPage(pages)
  }, [page, pages])

  const onChangeTab = (key: TabKey) => {
    setTab(key)
    setPage(1)
  }

  // Featured images appear in the home carousel; the switch saves at once
  const onToggleFeatured = async (image: LibraryImage) => {
    try {
      await setImageFeatured(image._id, !image.featured)
      setImages((list) => list.map((item) => (item._id === image._id ? { ...item, featured: !image.featured } : item)))
      showOk(image.featured ? 'Image removed from the carousel' : 'Image added to the carousel')
    } catch (error) {
      showError(error, 'Could not update the image')
    }
  }

  const onClickDelete = async (image: LibraryImage) => {
    try {
      await deleteImage(image._id)
      await loadImages()
      showOk('Image removed!')
    } catch (error) {
      showError(error, 'Could not remove the image')
    }
  }

  return <div className="content images">
    <div className="content_top">
      <h2 className="content_top_title">Images</h2>

      <ImageUpload fetch_images={loadImages} isImageWithTitle={true} />
    </div>

    <div className="image_tabs" role="tablist" aria-label="Images">
      {TABS.map((t) => (
        <button key={t.key} type="button" role="tab" aria-selected={tab === t.key}
          className={`image_tab ${tab === t.key ? 'active' : ''}`} onClick={() => onChangeTab(t.key)}>
          {t.label} <span className="image_tab_count">{counts[t.key]}</span>
        </button>
      ))}
    </div>

    {visible.length === 0
      ? <p className="msg">No images here.</p>
      : <ul className="image_grid" role="tabpanel">
        {visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((image) => (
          <li key={image._id} className="image_card">
            <img className="image_card_img" loading="lazy" src={`${URL}/static/images/${image.filename}`} alt={image.title || image.experience?.title || ''} />

            <div className="image_card_body">
              {image.experience
                ? <NavLink to={`/experience/${image.experience._id}`} target="_blank" className="image_card_link">{image.experience.title}</NavLink>
                : <span className="image_card_link unused">{image.title || 'Not used by any experience'}</span>}

              <div className="image_card_actions">
                <div className="switch">
                  <input
                    type="checkbox"
                    id={`switch-${image._id}`}
                    className="switch_checkbox"
                    checked={image.featured}
                    onChange={() => onToggleFeatured(image)}
                    aria-label={`Show ${image.title || image.experience?.title || 'image'} in the home carousel`}
                  />
                  <label htmlFor={`switch-${image._id}`} className="switch_label"></label>
                </div>

                {/* The server refuses (409) while an experience uses the image */}
                {!image.experience && (
                  <button type="button" className="btn_icon btn_action" title="Remove" aria-label="Remove image" onClick={() => onClickDelete(image)}>
                    <MdDelete />
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>}

    {visible.length > PAGE_SIZE && (
      <Pagination itemsPerPage={PAGE_SIZE} currentPage={page} totalItems={visible.length} paginate={setPage} />
    )}

    <Msgbox {...message} />
  </div>
}

export default Images
