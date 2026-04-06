import { useState, useEffect, FormEvent } from 'react'
import { deleteData, getData, postData } from '../utils/utils'
import { MdDelete, MdEdit, MdClose, MdCheckCircleOutline } from 'react-icons/md'
import { URL } from '../config'
import ImageUpload from './ImageUpload'
import Pagination from '../components/common/Pagination'
import Msgbox from '../components/common/Msgbox'

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
  
  // pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentImages = images.slice(indexOfFirstItem, indexOfLastItem)
  const paginate = (i: number) => setCurrentPage(i)

  return <div className="content images">
    <div className="content_top">
      <h2 className="content_top_title">Images</h2>

      <ImageUpload setSelectedFilename={setSelectedFilename} fetch_images={fetch_images} isImageWithTitle={true} />
    </div>

    <div className="table_scroll">
      <div className="table">
        <div className="tGroup tHead">
          <div className="tRow">
            <div className="tCol center"><span><strong>Featured</strong></span></div>
            <div className="tCol"><span><strong>Image</strong></span></div>
            <div className="tCol"><span><strong>Title</strong></span></div>
            <div className="tCol right"><span><strong>Action</strong></span></div>
          </div>
        </div>

        {currentImages.map((item) => {

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
                  <span>{item.title || 'No title'}</span>
                </div>

                <div className="tCol">
                  <div className="icons">
                    {updateActive !== item._id ?
                      <button
                        type="button"
                        className="btn_action"
                        onClick={() => onClickShowUpdate(item._id)}
                        title="Edit"
                      >
                        <MdEdit />
                      </button>
                      : null}
                    {updateActive === item._id ?
                      <>
                        <button
                          type="button"
                          className="btn_action green"
                          onClick={() => onClickUpdate(item)}
                          title="Save"
                        >
                          <MdCheckCircleOutline />
                        </button>
                        <button
                          type="button"
                          className="btn_action"
                          onClick={onClickCloseUpdate}
                          title="Close"
                        >
                          <MdClose />
                        </button>
                      </> : null}

                    <button
                      className="btn_action"
                      onClick={() => onClickDelete(item._id, item.filename)}
                    >
                      <MdDelete />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        <Msgbox body={message.body} classname={message.classname} />
      </div>
    </div>

    {
      images.length > 0 && images.length > itemsPerPage &&

      <Pagination
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        totalItems={images.length}
        paginate={paginate}
      />
    }
  </div>
}

export default Images
