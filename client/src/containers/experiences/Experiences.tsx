import { useState, useEffect, useContext, ChangeEvent, MouseEvent } from 'react'
import axios from 'axios'
import Moment from 'react-moment'
import { sortBy } from "lodash"
import { MdDelete, MdEdit, MdClose, MdCheckCircle } from 'react-icons/md'
import { useExperienceStore, Experience } from '../../store/experienceStore'
import { URL } from '../../config'
import { MyGlobalContext } from '../../App'
import AddExperience from './AddExperience'
import SelectCategories from '../../components/common/SelectCategories'
import Pagination from '../../components/common/Pagination'
import Msgbox from '../../components/common/Msgbox'
import ImageUpload from '../ImageUpload'
import thumb from '../../assets/images/thumb.png'

const Experiences = () => {
  const { user, role } = useContext(MyGlobalContext)
  const [newValues, setNewValues] = useState<Experience>()
  const [selectedFilename, setSelectedFilename] = useState(null)
  const [message, setMessage] = useState({ body: '', classname: '' })
  const [updateActive, setUpdateActive] = useState(null)

  // fetch Experiences
  const { experiences, loading, error, fetchExperiences } = useExperienceStore()

  useEffect(() => {
    fetchExperiences()
  }, [fetchExperiences])

  // Show Add experience form
  const [isFormAddVisible, setIsFormAddVisible] = useState(false)
  const showFormAdd = () => {
    !isFormAddVisible ? setIsFormAddVisible(true) : setIsFormAddVisible(false)
  }

  const handleChangeUpdate = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.currentTarget
    if (target) setNewValues({ ...newValues, [target.name]: target.value })
  }

  const onClickDelete = async (id: string) => {
    try {
      let url = `${URL}/admin/experiences/delete`
      await axios.post(url, { _id: id })
      fetchExperiences()
      setMessage({ body: `Experience deleted!`, classname: 'msg_ok' })
    } catch (error) {
      console.log(error)
    }
  }

  const onClickClose = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setUpdateActive(null)
  }

  const onClickShowUpdate = (idx: string) => {
    setUpdateActive(idx)
    let idExp = experiences.findIndex(e => e._id === idx)
    setNewValues({
      _id: idx,
      user: experiences[idExp].user,
      image: experiences[idExp].image,
      title: experiences[idExp].title,
      category: experiences[idExp].category,
      content: experiences[idExp].content,
      score: experiences[idExp].score
    })
  }

  const updateExperience = async (id: string) => {
    try {
      let url = `${URL}/admin/experiences/update`
      await axios.post(url, {
        _id: id,
        user: user,
        image: selectedFilename || newValues.image,
        title: newValues.title,
        category: newValues.category,
        content: newValues.content,
        score: newValues.score
      })
      fetchExperiences()
      setUpdateActive(null)
      setMessage({ body: `Experience updated!`, classname: 'msg_ok' })
    } catch (error) {
      console.log(error)
    }
  }

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const sortedExps = sortBy(experiences, ['date']).reverse()
  // experiences by user
  const expsByUser = sortedExps.filter((exp) => exp.user === user)
  // experiences displayed according to role
  const currentExps = role === 'admin' ? sortedExps.slice(indexOfFirstItem, indexOfLastItem) : expsByUser.slice(indexOfFirstItem, indexOfLastItem)
  const paginate = (i: number) => setCurrentPage(i)


  return <div className="content exps">
    <div className="content_top">
      <h2 className="content_top_title">Experiences</h2>

      <button type="button" className="btn btn_admin" onClick={showFormAdd}>
        {!isFormAddVisible ? 'Add new experience' : 'Close Add'}
      </button>
    </div>

    <AddExperience
      user={user}
      handleFetchExperiences={fetchExperiences}
      isFormAddVisible={isFormAddVisible}
      setIsFormAddVisible={setIsFormAddVisible}
    />

    <form className="form">
      <div className="table_scroll">
        <div className="table">
          {currentExps.length > 0 &&
            <div className="tGroup tHead">
              <div className="tRow">
                <div className="tCol w7_5"><span><strong>Date</strong></span></div>
                <div className="tCol w10"><span><strong>User</strong></span></div>
                <div className="tCol w15"><span><strong>Image</strong></span></div>
                <div className="tCol w10"><span><strong>Category</strong></span></div>
                <div className="tCol w15"><span><strong>Title</strong></span></div>
                <div className="tCol w27_5"><span><strong>Content</strong></span></div>
                <div className="tCol w7_5 center"><span><strong>Score</strong></span></div>
                <div className="tCol w10 center"><span><strong>Action</strong></span></div>
              </div>
            </div>
          }
          {
            !loading && currentExps.map((ele) => {
              return <div className="tGroup" key={ele._id}>
                <div className="tRow">
                  <div className="tCol">
                    <span><Moment format="YYYY/MM/DD">{ele.date}</Moment></span>
                  </div>
                  <div className="tCol ellipsis">
                    <span>{ele.user}</span>
                  </div>
                  <div className="tCol thumb">
                    <img src={ele.image ? `${URL}/static/images/${ele.image}` : thumb} alt={ele.title} />
                  </div>
                  <div className="tCol">
                    <span>{ele.category}</span>
                  </div>
                  <div className="tCol">
                    <span>{ele.title}</span>
                  </div>
                  <div className="tCol cont">
                    <span>{ele.content}</span>
                  </div>
                  <div className="tCol center">
                    <span>{ele.score}</span>
                  </div>
                  <div className="tCol center">
                    <div className="icons">
                      {updateActive !== ele._id ?
                        <button type="button" className="btn_action" onClick={() => onClickShowUpdate(ele._id)}>
                          <MdEdit />
                        </button>
                        : null}
                      <button type="button" className="btn_action" onClick={() => onClickDelete(ele._id)}>
                        <MdDelete />
                      </button>
                    </div>
                  </div>
                </div>

                {updateActive === ele._id ?
                  <div className="tRow sup">
                    <div className="tCol"></div>
                    <div className="tCol"></div>
                    <div className="tCol">
                      <ImageUpload setSelectedFilename={setSelectedFilename} isImageWithTitle={false} />
                    </div>
                    <div className="tCol">
                      <SelectCategories handleChange={handleChangeUpdate} selected={ele.category} />
                    </div>
                    <div className="tCol">
                      <input type="text" name="title" className="form_control" placeholder="Write your title" defaultValue={ele.title} onChange={handleChangeUpdate} />
                    </div>
                    <div className="tCol">
                      <textarea name="content" className="form_control" placeholder="Write your content" defaultValue={ele.content} onChange={handleChangeUpdate} />
                    </div>
                    <div className="tCol score center">
                      <input type="text" name="score" className="form_control" placeholder="" defaultValue={ele.score} onChange={handleChangeUpdate} />
                    </div>
                    <div className="tCol">
                      <div className="icons">
                        <button type="button" className="btn_action green" onClick={() => updateExperience(ele._id)}>
                          <MdCheckCircle />
                        </button>
                        <button type="button" className="btn_action" onClick={onClickClose}>
                          <MdClose />
                        </button>
                      </div>
                    </div>
                  </div>
                  : null}
              </div>
            })
          }
        </div>
      </div>

      <Msgbox body={message.body} classname={message.classname} />
    </form>

    {
      role === 'admin' && experiences.length > 0 && experiences.length > itemsPerPage && 

      <Pagination
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        totalItems={experiences.length}
        paginate={paginate}
      />
    }

    {
      role === 'author' && expsByUser.length > 0 && expsByUser.length > itemsPerPage && 

      <Pagination
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        totalItems={expsByUser.length}
        paginate={paginate}
      />
    }

    {error}
  </div>
}

export default Experiences
