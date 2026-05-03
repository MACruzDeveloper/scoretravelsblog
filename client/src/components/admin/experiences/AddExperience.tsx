import { useState, ChangeEvent, FormEvent } from 'react'
import { postData } from '@/utils/utils'
import { URL } from '../../../config'
import { Experience } from '@/store/experienceStore'
import SelectCategories from '@/components/common/SelectCategories'
import Msgbox, { ParamsMsgBox } from '@/components/common/Msgbox'
import ImageUpload from '../ImageUpload'
import { CitySearch } from './CitySearch'

type PropsAddExperience = {
  user: string
  handleFetchExperiences: () => void
  isFormAddVisible: boolean
  setIsFormAddVisible: (c: boolean) => void
}

const AddExperience = ({ user, handleFetchExperiences, isFormAddVisible, setIsFormAddVisible }: PropsAddExperience) => {
  const [values, setValues] = useState<Experience>()
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  //const [selectedFile, setSelectedFile] = useState(null)
  const [selectedFilename, setSelectedFilename] = useState(null)
  //const [isFileValid, setIsFileValid] = useState(false)
  //const [loadingFile, setLoadingFile] = useState(false)
  const loadingFile = false
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

      await postData(`${URL}/admin/experiences/add`, {
        user,
        title: values.title,
        category: values.category,
        city: cityId,                    // guardamos el ObjectId
        image: selectedFilename,
        content: values.content,
      })
      setMessage({ body: 'New Experience added!', classname: 'msg_ok' })
      handleFetchExperiences()
      setIsFormAddVisible(false)
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

          <ImageUpload setSelectedFilename={setSelectedFilename} isImageWithTitle={false} />

          <div className="form_group flex">
            <SelectCategories handleChange={handleChangeNew} />

            <CitySearch onSelect={setSelectedCity} />

            <button className="btn btn_admin">Add Experience</button>
          </div>
        </form>
      </div>
    }

    <Msgbox body={message.body} classname={message.classname} />
  </>
}

export default AddExperience
