import { useState, useEffect, useContext, ChangeEvent, useMemo } from 'react'
import { postData } from '@/utils/utils'
import Moment from 'react-moment'
import { sortBy } from "lodash"
import { MdDelete, MdEdit, MdClose, MdCheckCircle } from 'react-icons/md'
import { useExperienceStore, Experience } from '@/store/experienceStore'
import { URL } from '../../../config'
import { MyGlobalContext } from '../../../App'
import AddExperience from './AddExperience'
import SelectCategories from '@/components/common/SelectCategories'
import Msgbox from '@/components/common/Msgbox'
import Table from '@/components/common/Table'
import TableActions from '@/components/common/TableActions'
import ImageUpload from '../ImageUpload'
import thumb from '@images/thumb.png'

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
      await postData(url, { _id: id })
      fetchExperiences()
      setMessage({ body: `Experience deleted!`, classname: 'msg_ok' })
    } catch (error) {
      console.log(error)
    }
  }

  const onClickClose = () => {
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
      await postData(url, {
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

  const [sortColumn, setSortColumn] = useState<string | null>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const itemsPerPage = 10

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(key)
      setSortDirection('asc')
    }
  }

  const sortedExps = useMemo(() => {
    if (!sortColumn) return sortBy(experiences, ['date']).reverse()
    const list = role === 'admin' ? experiences : experiences.filter(exp => exp.user === user)
    return [...list].sort((a, b) => {
      const aVal = (a as any)[sortColumn]
      const bVal = (b as any)[sortColumn]
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [experiences, user, role, sortColumn, sortDirection])

  const columns = [
    { key: 'date', label: 'Date', sortable: true, width: 'w7_5' },
    { key: 'user', label: 'User', sortable: true, width: 'w10' },
    { key: 'image', label: 'Image', sortable: false, width: 'w15' },
    { key: 'category', label: 'Category', sortable: true, width: 'w10' },
    { key: 'title', label: 'Title', sortable: true, width: 'w15' },
    { key: 'content', label: 'Content', sortable: false, width: 'w27_5' },
    { key: 'score', label: 'Score', sortable: true, width: 'w7_5', align: 'center' },
    { key: 'actions', label: 'Action', sortable: false, width: 'w10', align: 'center' }
  ]

  const renderRow = (ele: Experience) => {
    const actions: Array<{ key: string; icon: JSX.Element; title: string; onClick: () => void; show?: () => boolean; className?: string }> = [
      {
        key: 'edit',
        icon: <MdEdit />,
        title: 'Edit',
        onClick: () => onClickShowUpdate(ele._id),
        show: () => updateActive !== ele._id,
      },
      {
        key: 'delete',
        icon: <MdDelete />,
        title: 'Delete',
        onClick: () => onClickDelete(ele._id),
      },
    ]

    if (updateActive === ele._id) {
      actions.unshift(
        {
          key: 'save',
          icon: <MdCheckCircle />,
          title: 'Save',
          onClick: () => updateExperience(ele._id),
          className: 'btn_action green',
        },
        {
          key: 'close',
          icon: <MdClose />,
          title: 'Close',
          onClick: onClickClose,
        }
      )
    }

    return (
      <div className="tGroup" key={ele._id}>
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
            <TableActions actions={actions} item={ele} />
          </div>
        </div>
        {updateActive === ele._id ? (
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
        ) : null}
      </div>
    )
  }

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
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      <Table
        columns={columns}
        data={sortedExps}
        renderRow={renderRow}
        onSort={handleSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        hasPagination={true}
        itemsPerPage={itemsPerPage}
      />

      <Msgbox body={message.body} classname={message.classname} />
    </form>
  </div>
}

export default Experiences
