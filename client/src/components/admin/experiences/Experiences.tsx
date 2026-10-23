import { useState, useEffect, useContext, useCallback } from 'react'
import { MdDelete, MdEdit, MdClose, MdCheckCircle, MdAddCircleOutline } from 'react-icons/md'
import { deleteExperience, updateExperience } from '@/api/experiences'
import { saveCity } from '@/api/cities'
import type { Experience, NewCity } from '@/api/types'
import { useExperienceStore } from '@/store/experienceStore'
import { useSortedData, SortValue } from '@/hooks/useSortedData'
import { useInlineEdit } from '@/hooks/useInlineEdit'
import { useMessage } from '@/hooks/useMessage'
import { experienceSchema, firstIssue } from '@/schemas'
import { cityOf, coverOf } from '@/utils/experience'
import { URL } from '../../../config'
import { MyGlobalContext } from '@/components/context/useGlobalContext'
import FormattedDate from '@/components/common/FormattedDate'
import SelectCategories from '@/components/common/SelectCategories'
import Spinner from '@/components/common/Spinner'
import Table, { Column } from '@/components/common/Table'
import Msgbox from '@/components/common/Msgbox'
import TableActions from '@/components/common/TableActions'
import AddExperience from './AddExperience'
import { CitySearch } from './CitySearch'
import ImageUpload from '../ImageUpload'
import thumb from '@images/thumb.png'

const STATUS_LABELS = { pending: 'Pending review', published: 'Published', rejected: 'Rejected' }

const COLUMNS: Column[] = [
  { key: 'date', label: 'Date', sortable: true, width: 'w7_5' },
  { key: 'user', label: 'User', sortable: true, width: 'w10' },
  { key: 'image', label: 'Image', sortable: false, width: 'w15' },
  { key: 'city', label: 'City', sortable: true, width: 'w10' },
  { key: 'category', label: 'Category', sortable: true, width: 'w10' },
  { key: 'title', label: 'Title', sortable: true, width: 'w15' },
  { key: 'content', label: 'Content', sortable: false, width: 'w20' },
  { key: 'status', label: 'Status', sortable: true, width: 'w7_5', align: 'center' },
  { key: 'score', label: 'Score', sortable: true, width: 'w7_5', align: 'center' },
  { key: 'actions', label: 'Action', sortable: false, width: 'w10', align: 'center' },
]

// Fields edited inline; the city and images have their own widgets
type ExperienceDraft = { title: string; content: string; category: string }

// The city column sorts by name
const sortValue = (experience: Experience, key: string): SortValue =>
  key === 'city' ? cityOf(experience)?.name : (experience[key as keyof Experience] as SortValue)

const Experiences = () => {
  const { role } = useContext(MyGlobalContext)
  const { items: experiences, loading, error, fetch } = useExperienceStore()
  const { message, showOk, showError, showWarning } = useMessage()
  const edit = useInlineEdit<ExperienceDraft>()
  const sort = useSortedData(experiences, { initialKey: 'date', initialDirection: 'desc', getValue: sortValue })
  // Only set when the user picks another city while editing
  const [newCity, setNewCity] = useState<NewCity | null>(null)
  const [editImages, setEditImages] = useState<string[]>([])
  const [isFormAddVisible, setIsFormAddVisible] = useState(false)

  // Users manage their own experiences; the admin sees all of them
  const scope = role === 'admin' ? 'all' : 'mine'
  const reload = useCallback(() => fetch({ force: true, params: scope }), [fetch, scope])

  useEffect(() => {
    reload()
  }, [reload])

  const startEdit = (experience: Experience) => {
    edit.startEdit(experience._id, {
      title: experience.title,
      content: experience.content ?? '',
      category: experience.category ?? '',
    })
    setNewCity(null)
    setEditImages(experience.images?.filter(Boolean).length ? experience.images.filter(Boolean) : experience.image ? [experience.image] : [])
  }

  const cancelEdit = () => {
    edit.cancel()
    setNewCity(null)
    setEditImages([])
  }

  const onClickUpdate = async (experience: Experience) => {
    if (!edit.values) return
    const result = experienceSchema.safeParse(edit.values)
    if (!result.success) return showWarning(firstIssue(result) ?? 'Invalid experience')
    try {
      // A newly picked city is saved first; otherwise the current one stays
      const city = newCity ? (await saveCity(newCity))._id : cityOf(experience)?._id ?? null
      const { updated } = await updateExperience(experience._id, {
        ...result.data,
        city,
        image: editImages[0] || '',
        images: editImages,
      })
      cancelEdit()
      await reload()
      showOk(updated.status === 'pending' ? 'Changes saved and sent for review' : 'Experience updated!')
    } catch (error) {
      showError(error, 'Could not update the experience')
    }
  }

  const onClickDelete = async (experience: Experience) => {
    try {
      await deleteExperience(experience._id)
      await reload()
      showOk('Experience deleted!')
    } catch (error) {
      showError(error, 'Could not delete the experience')
    }
  }

  const renderRow = (experience: Experience) => {
    const editing = edit.isEditing(experience._id) && edit.values
    const cover = coverOf(experience)
    const actions = editing
      ? [
        { key: 'save', icon: <MdCheckCircle />, title: 'Save', onClick: onClickUpdate, className: 'btn_action green' },
        { key: 'close', icon: <MdClose />, title: 'Close', onClick: cancelEdit },
        { key: 'delete', icon: <MdDelete />, title: 'Delete', onClick: onClickDelete },
      ]
      : [
        { key: 'edit', icon: <MdEdit />, title: 'Edit', onClick: startEdit },
        { key: 'delete', icon: <MdDelete />, title: 'Delete', onClick: onClickDelete },
      ]

    return (
      <div className="tGroup" role="rowgroup" key={experience._id}>
        <div className="tRow" role="row">
          <div className="tCol" role="cell"><span><FormattedDate date={experience.date} /></span></div>
          <div className="tCol ellipsis" role="cell"><span>{experience.user}</span></div>
          <div className="tCol thumb" role="cell">
            <img src={cover ? `${URL}/static/images/${cover}` : thumb} alt={experience.title} />
          </div>
          <div className="tCol visible" role="cell">
            {editing ? (
              <CitySearch onSelect={setNewCity} value={cityOf(experience)?.name} />
            ) : (
              <span>{cityOf(experience)?.name}</span>
            )}
          </div>
          <div className="tCol" role="cell">
            {editing ? (
              <SelectCategories value={edit.values?.category ?? ''} onChange={(e) => edit.setField('category', e.target.value)} />
            ) : (
              <span>{experience.category}</span>
            )}
          </div>
          <div className="tCol" role="cell">
            {editing ? (
              <input type="text" className="form_control" aria-label="Title" maxLength={150}
                value={edit.values?.title ?? ''} onChange={(e) => edit.setField('title', e.target.value)} />
            ) : (
              <span>{experience.title}</span>
            )}
          </div>
          <div className="tCol cont" role="cell">
            {editing ? (
              <textarea className="form_control" aria-label="Content" maxLength={20000}
                value={edit.values?.content ?? ''} onChange={(e) => edit.setField('content', e.target.value)} />
            ) : (
              <span>{experience.content}</span>
            )}
          </div>
          <div className="tCol center" role="cell">
            {experience.status && <span className={`status status_${experience.status}`}>{STATUS_LABELS[experience.status]}</span>}
            {experience.status === 'rejected' && experience.rejectionReason && <span className="status_reason">{experience.rejectionReason}</span>}
          </div>
          <div className="tCol center" role="cell">
            {/* Read only: average of the votes, computed by the server */}
            <span>{experience.score ?? '-'}</span>
          </div>
          <div className="tCol center" role="cell">
            <TableActions actions={actions} item={experience} />
          </div>
        </div>
        {editing && (
          <div className="tRow sup" role="row">
            <div className="tCol" role="cell">
              <ImageUpload
                addSelectedFilename={(filename) => setEditImages(prev => [...prev, filename])}
                removeSelectedFilename={(index) => setEditImages(prev => prev.filter((_, idx) => idx !== index))}
                currentImages={editImages}
                allowMultiple={true}
                maxImages={5}
                isImageWithTitle={false}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  return <div className="content exps">
    <div className="content_top">
      <h2 className="content_top_title">{role === 'admin' ? 'Experiences' : 'My experiences'}</h2>

      <button type="button" className="btn btn_admin icon" onClick={() => setIsFormAddVisible(!isFormAddVisible)}>
        {!isFormAddVisible
          ? <><MdAddCircleOutline /><span>Add new experience</span></>
          : <><MdClose /><span>Close</span></>
        }
      </button>
    </div>

    <AddExperience
      handleFetchExperiences={reload}
      isFormAddVisible={isFormAddVisible}
      setIsFormAddVisible={setIsFormAddVisible}
    />

    <div>
      {loading && <Spinner />}
      {error && <p className="msg error">{error}</p>}
      <Table label={role === 'admin' ? 'Experiences' : 'My experiences'} columns={COLUMNS} data={sort.sorted} renderRow={renderRow} sort={sort} hasPagination itemsPerPage={10} />

      <Msgbox body={message.body} classname={message.classname} />
    </div>
  </div>
}

export default Experiences
