import { useState, useEffect, useCallback } from 'react'
import { MdDelete } from 'react-icons/md'
import { listImages, setImageFeatured, deleteImage } from '@/api/images'
import type { Image } from '@/api/types'
import { URL } from '../../config'
import { useSortedData } from '@/hooks/useSortedData'
import { useMessage } from '@/hooks/useMessage'
import ImageUpload from './ImageUpload'
import Msgbox from '@common/Msgbox'
import Table, { Column } from '@/components/common/Table'
import TableActions from '@/components/common/TableActions'

const COLUMNS: Column[] = [
  { key: 'featured', label: 'Featured', sortable: true, width: 'w10', align: 'center' },
  { key: 'image', label: 'Image', sortable: false, width: 'w30' },
  { key: 'title', label: 'Title', sortable: true, width: 'w40' },
  { key: 'actions', label: 'Action', sortable: false, width: 'w20', align: 'right' },
]

const Images = () => {
  const [images, setImages] = useState<Image[]>([])
  const { message, showOk, showError } = useMessage()
  // No column by default: newest images first, as returned by the server
  const sort = useSortedData(images)

  const loadImages = useCallback(async () => {
    try {
      setImages(await listImages())
    } catch (error) {
      showError(error, 'Could not load images')
    }
  }, [showError])

  useEffect(() => {
    loadImages()
  }, [loadImages])

  // Featured images appear in the home carousel; the switch saves at once
  const onToggleFeatured = async (image: Image) => {
    try {
      await setImageFeatured(image._id, !image.featured)
      setImages((list) => list.map((item) => (item._id === image._id ? { ...item, featured: !image.featured } : item)))
      showOk(image.featured ? 'Image removed from the carousel' : 'Image added to the carousel')
    } catch (error) {
      showError(error, 'Could not update the image')
    }
  }

  // The server refuses (409) while an experience uses the image
  const onClickDelete = async (image: Image) => {
    try {
      await deleteImage(image._id)
      await loadImages()
      showOk('Image removed!')
    } catch (error) {
      showError(error, 'Could not remove the image')
    }
  }

  const renderRow = (image: Image) => (
    <div className="tGroup" role="rowgroup" key={image._id}>
      <div className="tRow" role="row">
        <div className="tCol center" role="cell">
          <div className="switch">
            <input
              type="checkbox"
              id={`switch-${image._id}`}
              className="switch_checkbox"
              checked={image.featured}
              onChange={() => onToggleFeatured(image)}
              aria-label={`Show ${image.title || 'image'} in the home carousel`}
            />
            <label htmlFor={`switch-${image._id}`} className="switch_label"></label>
          </div>
        </div>
        <div className="tCol" role="cell">
          <img className="image" src={`${URL}/static/images/${image.filename}`} alt={image.title || ''} />
        </div>
        <div className="tCol" role="cell">
          <span>{image.title || '-'}</span>
        </div>
        <div className="tCol" role="cell">
          <TableActions
            item={image}
            actions={[{ key: 'delete', icon: <MdDelete />, title: 'Remove', onClick: onClickDelete }]}
          />
        </div>
      </div>
    </div>
  )

  return <div className="content images">
    <div className="content_top">
      <h2 className="content_top_title">Images</h2>

      <ImageUpload fetch_images={loadImages} isImageWithTitle={true} />
    </div>

    <Table label="Images" columns={COLUMNS} data={sort.sorted} renderRow={renderRow} sort={sort} hasPagination itemsPerPage={10} />

    <Msgbox {...message} />
  </div>
}

export default Images
