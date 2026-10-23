import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createExperience } from '@/api/experiences'
import { saveCity } from '@/api/cities'
import type { NewCity } from '@/api/types'
import { useMessage } from '@/hooks/useMessage'
import { experienceSchema, ExperienceForm } from '@/schemas'
import SelectCategories from '@/components/common/SelectCategories'
import FieldError from '@/components/common/FieldError'
import Msgbox from '@/components/common/Msgbox'
import ImageUpload from '../ImageUpload'
import { CitySearch } from './CitySearch'

const EMPTY_FORM: ExperienceForm = { title: '', content: '', category: '' }

type PropsAddExperience = {
  handleFetchExperiences: () => void
  isFormAddVisible: boolean
  setIsFormAddVisible: (c: boolean) => void
}

const AddExperience = ({ handleFetchExperiences, isFormAddVisible, setIsFormAddVisible }: PropsAddExperience) => {
  // City and images come from their own widgets, outside the form fields
  const [selectedCity, setSelectedCity] = useState<NewCity | null>(null)
  const [selectedFilenames, setSelectedFilenames] = useState<string[]>([])
  const { message, showOk, showError } = useMessage()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ExperienceForm>({
    resolver: zodResolver(experienceSchema),
    defaultValues: EMPTY_FORM,
  })

  const onSubmit = async (values: ExperienceForm) => {
    try {
      // Save the chosen city first (returns the existing one if already saved)
      const cityId = selectedCity ? (await saveCity(selectedCity))._id : null
      const created = await createExperience({
        ...values,
        city: cityId,
        image: selectedFilenames[0] || '',
        images: selectedFilenames,
      })
      // Users' experiences wait for an admin; the admin's are published at once
      showOk(created.status === 'pending'
        ? 'Experience sent for review. It will be published once an admin approves it'
        : 'New Experience added!')
      handleFetchExperiences()
      setIsFormAddVisible(false)
      reset(EMPTY_FORM)
      setSelectedCity(null)
      setSelectedFilenames([])
    } catch (error) {
      showError(error, 'Could not add the experience')
    }
  }

  return <>
    {isFormAddVisible &&
      <div className="content_add">
        <h3 className="content_add_title">Fill in the fields and <strong>Add a new experience</strong></h3>

        <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <input type="text" className="form_control" placeholder="*Write your title" aria-label="Title"
            aria-invalid={Boolean(errors.title)} maxLength={150} {...register('title')} />
          <FieldError error={errors.title} />

          <textarea className="form_control" placeholder="*Write your content" aria-label="Content"
            aria-invalid={Boolean(errors.content)} maxLength={20000} {...register('content')} />
          <FieldError error={errors.content} />

          <ImageUpload
            addSelectedFilename={(filename) => setSelectedFilenames(prev => [...prev, filename])}
            removeSelectedFilename={(index) => setSelectedFilenames(prev => prev.filter((_, idx) => idx !== index))}
            allowMultiple={true}
            maxImages={5}
            currentImages={selectedFilenames}
            isImageWithTitle={false}
          />

          <div className="form_group flex">
            <SelectCategories {...register('category')} />
            <CitySearch onSelect={setSelectedCity} />
          </div>

          <button className="btn btn_admin" disabled={isSubmitting}>Add Experience</button>
        </form>
      </div>
    }

    <Msgbox body={message.body} classname={message.classname} />
  </>
}

export default AddExperience
