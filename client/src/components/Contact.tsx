import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { NavLink } from 'react-router-dom'
import { sendContactMessage } from '@/api/contact'
import { useMessage } from '@/hooks/useMessage'
import { contactSchema, ContactForm } from '@/schemas'
import Msgbox from './common/Msgbox'
import FieldError from './common/FieldError'

const SUBJECT = 'Here is the message: '
const EMPTY_FORM = { name: '', email: '', message: '', website: '' }

const Contact = () => {
  const { message, showOk, showError } = useMessage()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: EMPTY_FORM,
  })

  const onSubmit = async ({ name, email, message: text, website }: ContactForm) => {
    try {
      await sendContactMessage({ name, email, message: text, subject: SUBJECT, website })
      reset(EMPTY_FORM)
      showOk('Your message has been sent, thanks!')
    } catch (error) {
      showError(error, 'Could not send your message, please try again later')
    }
  }

  return <div className="page contact">
    <div className="container">
      <div className="mod_contact">
        <div className="top">
          <h2 className="title">Contact</h2>
          <h3 className="subtitle">How could we help you?</h3>
        </div>

        <form className="form form_contact" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form_group">
            <input type="text" className="form_control" placeholder="*What is your name?" aria-label="Name"
              maxLength={100} aria-invalid={Boolean(errors.name)} {...register('name')} />
            <FieldError error={errors.name} />
          </div>

          <div className="form_group">
            <input type="email" className="form_control" placeholder="*Your contact email?" aria-label="Email"
              maxLength={254} aria-invalid={Boolean(errors.email)} {...register('email')} />
            <FieldError error={errors.email} />
          </div>

          <div className="form_group">
            <textarea className="form_control" placeholder="*Please write your message" aria-label="Message" rows={3}
              maxLength={5000} aria-invalid={Boolean(errors.message)} {...register('message')} />
            <FieldError error={errors.message} />
          </div>

          {/* Honeypot: hidden from people, bots tend to fill it */}
          <div className="form_group" aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', overflow: 'hidden' }}>
            <label htmlFor="cb_website">Website</label>
            <input type="text" id="cb_website" tabIndex={-1} autoComplete="off" {...register('website')} />
          </div>

          <div className="form_group">
            <input type="checkbox" id="cb_contact" className="cb_custom" {...register('accept')} />
            <label htmlFor="cb_contact">I have read and accept the <NavLink to="/privacy" target="_blank">privacy policy</NavLink></label>
            <FieldError error={errors.accept} />
          </div>

          <button className="btn" disabled={isSubmitting}>Send</button>
        </form>
      </div>

      <Msgbox body={message.body} classname={message.classname} />
    </div>
  </div>
}

export default Contact
