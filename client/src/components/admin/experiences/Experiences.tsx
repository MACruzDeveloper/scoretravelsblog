import { useState, useEffect, useContext, ChangeEvent, useMemo } from 'react'
import { postData } from '@/utils/utils'
import Moment from 'react-moment'
import { sortBy } from "lodash"
import { MdDelete, MdEdit, MdClose, MdCheckCircle, MdAddCircleOutline } from 'react-icons/md'
import { useExperienceStore, Experience, City } from '@/store/experienceStore'
import { URL } from '../../../config'
import { MyGlobalContext } from '@/components/context/useGlobalContext'
import AddExperience from './AddExperience'
import SelectCategories from '@/components/common/SelectCategories'
import { CitySearch } from './CitySearch'
import Table from '@/components/common/Table'
import Msgbox from '@/components/common/Msgbox'
import TableActions from '@/components/common/TableActions'
import ImageUpload from '../ImageUpload'
import thumb from '@images/thumb.png'

const Experiences = () => {
  const { user, role } = useContext(MyGlobalContext)
  const [newValues, setNewValues] = useState<Experience>()
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [selectedFilenames, setSelectedFilenames] = useState<string[]>([])
  const [message, setMessage] = useState({ body: '', classname: '' })
  const [updateActive, setUpdateActive] = useState(null)

  // fetch Experiences
  const { experiences, loading, error, fetchExperiences } = useExperienceStore()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    fetchExperiences(true)
  }, [fetchExperiences, refreshTrigger])

  // Show Add experience form
  const [isFormAddVisible, setIsFormAddVisible] = useState(false)
  const showFormAdd = () => {
    !isFormAddVisible ? setIsFormAddVisible(true) : setIsFormAddVisible(false)
  }

  const handleChangeUpdate = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.currentTarget
    if (target) setNewValues({ ...newValues, [target.name]: target.value })
  }

  const onClickDelete = async (id: string) => {
    try {
      let url = `${URL}/admin/experiences/delete`
      await postData(url, { _id: id })
      setRefreshTrigger(prev => prev + 1)
      setMessage({ body: `Experience deleted!`, classname: 'msg_ok' })
    } catch (error) {
      console.log(error)
    }
  }

  const handleCitySelect = (city: any) => {
    // Convert CitySearch city to store City format
    const storeCity: City = {
      _id: '', // Will be set when saving
      name: city.name,
      country: city.country,
      countryCode: city.countryCode,
      continent: city.continent,
      lat: city.lat,
      lng: city.lng,
    }
    setSelectedCity(storeCity)
  }

  const onClickShowUpdate = (idx: string) => {
    setUpdateActive(idx)
    let idExp = experiences.findIndex(e => e._id === idx)
    const experience = experiences[idExp]

    const existingImages = Array.isArray(experience.images)
      ? experience.images.filter((src): src is string => typeof src === 'string' && src && src !== 'null')
      : experience.image && experience.image !== 'null'
        ? [experience.image]
        : []

    setNewValues({
      _id: idx,
      user: experience.user,
      image: experience.image,
      images: existingImages,
      title: experience.title,
      city: experience.city && typeof experience.city === 'object' ? experience.city._id : (experience.city || null),
      category: experience.category,
      content: experience.content,
      score: experience.score
    })
    // Set selected city if experience has a city object
    if (experience.city && typeof experience.city === 'object') {
      setSelectedCity(experience.city as City)
    } else {
      setSelectedCity(null)
    }
    setSelectedFilenames(existingImages)
  }

  const handleRefreshExperiences = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const onClickClose = () => {
    setUpdateActive(null)
    setSelectedCity(null)
    setSelectedFilenames([])
  }

  const removeSelectedImage = (index: number) => {
    setSelectedFilenames((prev) => prev.filter((_, idx) => idx !== index))
    setNewValues((prev) => prev ? {
      ...prev,
      images: Array.isArray(prev.images) ? prev.images.filter((_, idx) => idx !== index) : prev.images,
    } : prev)
  }

  const updateExperience = async (id: string) => {
    if (!newValues) {
      console.error('newValues is undefined')
      return
    }

    try {
      let cityId = newValues.city  // mantiene la ciudad existente por defecto

      if (selectedCity) {
        const cityRes = await postData(`${URL}/admin/cities/add`, selectedCity)
        if (cityRes.data && cityRes.data.city) {
          cityId = cityRes.data.city._id
        } else if ((cityRes as any).city) {
          // Fallback: maybe postData doesn't wrap the response
          cityId = (cityRes as any).city._id
        } else {
          console.error('API response does not have city data:', cityRes)
          throw new Error('Failed to create city')
        }
      } else if (!cityId) {
        console.warn('No city selected and no existing city. Setting cityId to null.')
        cityId = null
      }

      const validFilenames = selectedFilenames.filter((src): src is string => typeof src === 'string' && src && src !== 'null')

      await postData(`${URL}/admin/experiences/update`, {
        _id: id,
        user: newValues.user,
        title: newValues.title,
        category: newValues.category,
        city: cityId,
        image: validFilenames[0] || '',
        images: validFilenames,
        content: newValues.content,
        score: newValues.score,
      })

      setRefreshTrigger(prev => prev + 1)
      setUpdateActive(null)
      setSelectedCity(null)
      setSelectedFilenames([])
      setMessage({ body: 'Experience updated!', classname: 'msg_ok' })
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
    { key: 'city', label: 'City', sortable: true, width: 'w10' },
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
          <div className="tCol visible">
            {updateActive === ele._id ? (
              <CitySearch
                onSelect={handleCitySelect}
                value={typeof ele.city === 'object' ? ele.city?.name : ele.city}
              />
            ) : (
            <span>{typeof ele.city === 'object' ? ele.city?.name : ele.city}</span>
            )}
          </div>
          <div className="tCol">
            {updateActive === ele._id ? (
              <SelectCategories handleChange={handleChangeUpdate} selected={newValues?.category} />
            ) : (
              <span>{ele.category}</span>
            )}
          </div>
          <div className="tCol">
            {updateActive === ele._id ? (
              <input type="text" name="title" className="form_control" placeholder="Write your title" value={newValues?.title || ''} onChange={handleChangeUpdate} />
            ) : (
              <span>{ele.title}</span>
            )}
          </div>
          <div className="tCol cont">
            {updateActive === ele._id ? (
              <textarea name="content" className="form_control" placeholder="Write your content" value={newValues?.content || ''} onChange={handleChangeUpdate} />
            ) : (
              <span>{ele.content}</span>
            )}
          </div>
          <div className="tCol center">
            {updateActive === ele._id ? (
              <input type="text" name="score" className="form_control" placeholder="" value={newValues?.score?.toString() || ''} onChange={handleChangeUpdate} />
            ) : (
              <span>{ele.score}</span>
            )}
          </div>
          <div className="tCol center">
            <TableActions actions={actions} item={ele} />
          </div>
        </div>
        {updateActive === ele._id ? (
          <div className="tRow sup">
            <div className="tCol">
              <ImageUpload
                addSelectedFilename={(filename) => setSelectedFilenames(prev => [...prev, filename])}
                removeSelectedFilename={removeSelectedImage}
                currentImages={selectedFilenames}
                allowMultiple={true}
                maxImages={5}
                isImageWithTitle={false}
              />
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  return <div className="content exps">
    <div className="content_top">
      <h2 className="content_top_title">Experiences</h2>

      <button type="button" className="btn btn_admin icon" onClick={showFormAdd}>
        {!isFormAddVisible ?
          <>
            <MdAddCircleOutline />
            <span>Add new experience</span>
          </>
          :
          <>
            <MdClose />
            <span>Close</span>
          </>
        }
      </button>
    </div>

    <AddExperience
      user={user}
      handleFetchExperiences={handleRefreshExperiences}
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
