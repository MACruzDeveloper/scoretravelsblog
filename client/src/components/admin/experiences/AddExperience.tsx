import { useState, ChangeEvent, FormEvent } from 'react'
import { getErrorMessage } from '@/utils/errors'
import { createExperience } from '@/api/experiences'
import { saveCity } from '@/api/cities'
import SelectCategories from '@/components/common/SelectCategories'
import Msgbox, { ParamsMsgBox } from '@/components/common/Msgbox'
import ImageUpload from '../ImageUpload'
import { CitySearch, City as SearchCity } from './CitySearch'

const EMPTY_FORM = { title: '', content: '', category: '' }

type PropsAddExperience = {
  handleFetchExperiences: () => void
  isFormAddVisible: boolean
  setIsFormAddVisible: (c: boolean) => void
}

const AddExperience = ({ handleFetchExperiences, isFormAddVisible, setIsFormAddVisible }: PropsAddExperience) => {
  const [values, setValues] = useState(EMPTY_FORM)
  const [selectedCity, setSelectedCity] = useState<SearchCity | null>(null)
  const [selectedFilenames, setSelectedFilenames] = useState<string[]>([])
  const [message, setMessage] = useState<ParamsMsgBox>({ body: '', classname: '' })

  const removeSelectedImage = (index: number) => {
    setSelectedFilenames(prev => prev.filter((_, idx) => idx !== index))
  }

  const handleChangeNew = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.currentTarget
    if (target) setValues({ ...values, [target.name]: target.value })
  }

  const handleSubmitNew = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      // Save the chosen city first (returns the existing one if already saved)
      const cityId = selectedCity ? (await saveCity(selectedCity))._id : null

      const validFilenames = selectedFilenames.filter(Boolean)
      const created = await createExperience({
        title: values.title,
        category: values.category,
        city: cityId,
        image: validFilenames[0] || '',
        images: validFilenames,
        content: values.content,
      })
      // Users' experiences wait for an admin; the admin's are published at once
      setMessage({
        body: created.status === 'pending' ? 'Experience sent for review. It will be published once an admin approves it' : 'New Experience added!',
        classname: 'msg_ok'
      })
      handleFetchExperiences()
      setIsFormAddVisible(false)
      setValues(EMPTY_FORM)
      setSelectedCity(null)
      setSelectedFilenames([])
    } catch (error) {
      console.log(error)
      setMessage({ body: getErrorMessage(error, 'Could not add the experience'), classname: 'msg_error' })
    }
  }

  return <>
    {isFormAddVisible &&
      <div className="content_add">
        <h3 className="content_add_title">Fill in the fields and <strong>Add a new experience</strong></h3>

        <form className="form" onSubmit={handleSubmitNew}>
          <input
            type="text"
            name="title"
            className="form_control"
            placeholder="*Write your title"
            onChange={handleChangeNew}
            required
          />
          <textarea
            name="content"
            className="form_control"
            placeholder="*Write your content"
            onChange={handleChangeNew}
            maxLength={2000}
            required
          />

          <ImageUpload
            addSelectedFilename={(filename) => setSelectedFilenames(prev => [...prev, filename])}
            removeSelectedFilename={removeSelectedImage}
            allowMultiple={true}
            maxImages={5}
            currentImages={selectedFilenames}
            isImageWithTitle={false}
          />

          <div className="form_group flex">
            <SelectCategories handleChange={handleChangeNew} />

            <CitySearch onSelect={setSelectedCity} />
          </div>

          <button className="btn btn_admin">
            Add Experience
          </button>
        </form>
      </div>
    }

    <Msgbox body={message.body} classname={message.classname} />
  </>
}

export default AddExperience
