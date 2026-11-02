import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { NavLink } from 'react-router-dom'
import { forgotPassword } from '@/api/auth'
import { useMessage } from '@/hooks/useMessage'
import { forgotPasswordSchema, ForgotPasswordForm } from '@/schemas'
import Msgbox from '@common/Msgbox'
import FieldError from '@common/FieldError'
import Seo from '@/components/common/Seo'

const ForgotPassword = () => {
  const { message, showError } = useMessage()
  // The server answers the same for any email, so it does not reveal which ones are registered
  const [sent, setSent] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async ({ email }: ForgotPasswordForm) => {
    try {
      setSent(await forgotPassword(email))
    } catch (error) {
      showError(error, 'Connection error, please try again')
    }
  }

  return <div className="page login">
    <Seo title="Forgot your password" noindex />
    <h2 className="title">Forgot your password?</h2>

    {sent
      ? <p className="form_notice" role="status">{sent}. Check your inbox and the spam folder.</p>
      : <form onSubmit={handleSubmit(onSubmit)} className="form" noValidate>
        <p className="form_legal">Write your email and we will send you a link to choose a new password.</p>
        <input type="email" className="form_control" placeholder="Write your email" aria-label="Email" autoComplete="email"
          maxLength={254} aria-invalid={Boolean(errors.email)} {...register('email')} />
        <FieldError error={errors.email} />
        <button className="btn" disabled={isSubmitting}>Send link</button>
      </form>}

    <p className="form_legal"><NavLink to="/login">Back to login</NavLink></p>
    <Msgbox {...message} />
  </div>
}

export default ForgotPassword
