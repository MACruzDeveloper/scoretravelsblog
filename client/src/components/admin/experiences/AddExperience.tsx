import { useState, ChangeEvent, FormEvent } from 'react'
import { postData } from '@/utils/utils'
import { URL } from '../../../config'
import { Experience } from '@/store/experienceStore'
import SelectCategories from '@/components/common/SelectCategories'
import Msgbox, { ParamsMsgBox } from '@/components/common/Msgbox'
import ImageUpload from '../ImageUpload'
import { CitySearch, City as SearchCity } from './CitySearch'

type PropsAddExperience = {
  user: string
  handleFetchExperiences: () => void
  isFormAddVisible: boolean
  setIsFormAddVisible: (c: boolean) => void
}

const AddExperience = ({ user, handleFetchExperiences, isFormAddVisible, setIsFormAddVisible }: PropsAddExperience) => {
  const [values, setValues] = useState<Experience>()
  const [selectedCity, setSelectedCity] = useState<SearchCity | null>(null)
  const [selectedFilenames, setSelectedFilenames] = useState<string[]>([])
  //const [isFileValid, setIsFileValid] = useState(false)
  //const [loadingFile, setLoadingFile] = useState(false)
  const [message, setMessage] = useState<ParamsMsgBox>({ body: '', classname: '' })

  const handleChangeNew = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.currentTarget
    if (target) setValues({ ...values, [target.name]: target.value })
  }

  const handleSubmitNew = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      // Primero upsert de la ciudad, obtenemos su _id
      let cityId = null
      if (selectedCity) {
        const cityRes = await postData(`${URL}/admin/cities/add`, selectedCity)
        cityId = cityRes.data.city._id
      }

      const validFilenames = selectedFilenames.filter((name) => !!name)
      await postData(`${URL}/admin/experiences/add`, {
        user,
        title: values.title,
        category: values.category,
        city: cityId,                    // guardamos el ObjectId
        image: validFilenames[0] || '',
        images: validFilenames,
        content: values.content,
      })
      setMessage({ body: 'New Experience added!', classname: 'msg_ok' })
      handleFetchExperiences()
      setIsFormAddVisible(false)
      setSelectedFilenames([])
    } catch (error) {
      console.log(error)
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
