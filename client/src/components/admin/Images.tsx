import { useState, useEffect, useMemo, FormEvent } from 'react'
import { getErrorMessage } from '@/utils/errors'
import { deleteData, getData, patchData } from '@utils/utils'
import { MdDelete, MdEdit, MdClose, MdCheckCircleOutline } from 'react-icons/md'
import { URL, API } from '../../config'
import ImageUpload from './ImageUpload'
import Msgbox from '@common/Msgbox'
import Table from '@/components/common/Table'
import TableActions from '@/components/common/TableActions'

const Images = () => {
  const [images, setImages] = useState([])
  const [featuredValues, setFeaturedValues] = useState<Record<string, boolean>>({})

  // No column by default: newest images first, as returned by the server
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const itemsPerPage = 10

  const [updateActive, setUpdateActive] = useState<string | null>(null)
  const [message, setMessage] = useState({ body: '', classname: '' })

  // table columns
  const columns = [
    { key: 'featured', label: 'Featured', sortable: true, width: 'w10', align: 'center' },
    { key: 'image', label: 'Image', sortable: false, width: 'w30' },
    { key: 'title', label: 'Title', sortable: true, width: 'w40' },
    { key: 'actions', label: 'Action', sortable: false, width: 'w20', align: 'right' }
  ]

  useEffect(() => {
    fetch_images()
  }, [])

  const fetch_images = async () => {
    try {
      const res = await getData(`${API}/images`)
      const dataImages = res.data.images
      setImages(dataImages)
    } catch (error) {
      console.log("error ==>", error)
    }
  }

  const onClickShowUpdate = async (idx: string) => {
    setUpdateActive(idx)
  }

  const onClickCloseUpdate = async () => {
    setUpdateActive(null)
  }

  const handleChangeSwitch = (e: FormEvent<HTMLInputElement>, idx: string) => {
    setUpdateActive(idx)
    const target = e.currentTarget
    setFeaturedValues(prev => ({ ...prev, [idx]: target.checked }))
  }

  const onClickUpdate = async (idx: string) => {
    try {
      await patchData(`${API}/images/${idx}`, { featured: featuredValues[idx] ?? false })
      setUpdateActive(null)
      setFeaturedValues(prev => {
        const next = { ...prev }
        delete next[idx]
        return next
      })
      await fetch_images()
      setMessage({ body: `Image updated!`, classname: 'msg_ok' })
    } catch (error) {
      console.log(error)
    }
  }

  const onClickDelete = async (idx: string) => {
    try {
      await deleteData(`${API}/images/${idx}`)
      fetch_images()
      setMessage({ body: `Image removed!`, classname: 'msg_ok' })
    } catch (error) {
      console.log("error ==>", error)
      setMessage({ body: getErrorMessage(error, 'Could not remove the image'), classname: 'msg_error' })
    }
  }

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(key)
      setSortDirection('asc')
    }
  }

  const sortedImages = useMemo(() => {
    if (!sortColumn) return images
    return [...images].sort((a, b) => {
      const aVal = (a as any)[sortColumn]
      const bVal = (b as any)[sortColumn]

      if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        return sortDirection === 'asc' ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal)
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [images, sortColumn, sortDirection])

  const renderRow = (item: any) => {
    const actions = [
      {
        key: 'edit',
        icon: <MdEdit />,
        title: 'Edit',
        onClick: () => onClickShowUpdate(item._id),
        show: () => updateActive !== item._id,
      },
      {
        key: 'save',
        icon: <MdCheckCircleOutline />,
        title: 'Save',
        onClick: () => onClickUpdate(item._id),
        show: () => updateActive === item._id,
        className: 'btn_action green',
      },
      {
        key: 'close',
        icon: <MdClose />,
        title: 'Close',
        onClick: onClickCloseUpdate,
        show: () => updateActive === item._id,
      },
      {
        key: 'delete',
        icon: <MdDelete />,
        title: 'Remove',
        onClick: () => onClickDelete(item._id),
      },
    ]

    return (
      <div className="tGroup" key={item._id}>
        <div className="tRow">
          <div className="tCol center">
            <div className="switch">
              <input
                type="checkbox"
                id={`switch-${item._id}`}
                className="switch_checkbox"
                checked={featuredValues[item._id] ?? item.featured}
                onChange={(e) => handleChangeSwitch(e, item._id)}
              />
              <label htmlFor={`switch-${item._id}`} className="switch_label"></label>
            </div>
          </div>
          <div className="tCol">
            <img
              className="image"
              src={`${URL}/static/images/${item.filename}`}
              alt={item.title}
            />
          </div>
          <div className="tCol">
            <span>{item.title || '-'}</span>
          </div>
          <div className="tCol">
            <TableActions actions={actions} item={item} />
          </div>
        </div>
        {updateActive === item._id ? (
          <div className="tRow sup">
            <div className="tCol"></div>
            <div className="tCol">
              <ImageUpload fetch_images={fetch_images} isImageWithTitle={false} />
            </div>
            <div className="tCol"></div>
            <div className="tCol"></div>
          </div>
        ) : null}
      </div>
    )
  }

  return <div className="content images">
    <div className="content_top">
      <h2 className="content_top_title">Images</h2>

      <ImageUpload fetch_images={fetch_images} isImageWithTitle={true} />
    </div>

    <Table
      columns={columns}
      data={sortedImages}
      renderRow={renderRow}
      onSort={handleSort}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      hasPagination={true}
      itemsPerPage={itemsPerPage}
    />

    <Msgbox body={message.body} classname={message.classname} />
  </div>
}

export default Images
