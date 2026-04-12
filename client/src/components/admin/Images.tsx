import { useState, useEffect, useMemo, FormEvent } from 'react'
import { deleteData, getData, postData } from '@utils/utils'
import { MdDelete, MdEdit, MdClose, MdCheckCircleOutline } from 'react-icons/md'
import { URL } from '../../config'
import ImageUpload from './ImageUpload'
import Msgbox from '@common/Msgbox'
import Table from '@/components/common/Table'
import TableActions from '@/components/common/TableActions'

const Images = () => {
  const [images, setImages] = useState([])
  const [selectedFilename, setSelectedFilename] = useState(null)
  const [featured, setFeatured] = useState(null)
  const [updateActive, setUpdateActive] = useState<string | null>(null)
  const [message, setMessage] = useState({ body: '', classname: '' })

  useEffect(() => {
    console.log(selectedFilename)
    fetch_images()
  }, [])

  const fetch_images = async () => {
    try {
      const res = await getData(`${URL}/images/fetch_images`)
      const dataImages = res.data.images
      setImages(dataImages.reverse())
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
    !updateActive && setUpdateActive(idx)
    const target = e.currentTarget
    let featured = target.checked
    setFeatured(featured)
  }

  const onClickUpdate = async (idx: string) => {
    try {
      let url = `${URL}/images/update_image`
      await postData(url, { _id: idx, featured: featured })
      fetch_images()
      setMessage({ body: `Image updated!`, classname: 'msg_ok' })
    } catch (error) {
      console.log(error)
    }
  }

  const onClickDelete = async (idx: string, filename: string) => {
    console.log(message)
    try {
      let url = `${URL}/images/delete_image/${idx}/${filename}`
      await deleteData(url)
      fetch_images()
      setMessage({ body: `Image removed!`, classname: 'msg_ok' })
    } catch (error) {
      console.log("error ==>", error)
    }
  }

  const [sortColumn, setSortColumn] = useState<string | null>('title')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const itemsPerPage = 10

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(key)
      setSortDirection('asc')
    }
  }

  const sortedImages = useMemo(() => {
    if (!sortColumn) return [...images].reverse()
    return [...images].sort((a, b) => {
      const aVal = (a as any)[sortColumn]
      const bVal = (b as any)[sortColumn]
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [images, sortColumn, sortDirection])

  const columns = [
    { key: 'featured', label: 'Featured', sortable: false, width: 'w15', align: 'center' },
    { key: 'image', label: 'Image', sortable: false, width: 'w25' },
    { key: 'title', label: 'Title', sortable: true, width: 'w25' },
    { key: 'actions', label: 'Action', sortable: false, width: 'w15', align: 'right' }
  ]

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
        onClick: () => onClickDelete(item._id, item.filename),
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
                defaultChecked={item.featured}
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
              <ImageUpload setSelectedFilename={setSelectedFilename} isImageWithTitle={false} />
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

      <ImageUpload setSelectedFilename={setSelectedFilename} fetch_images={fetch_images} isImageWithTitle={true} />
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
