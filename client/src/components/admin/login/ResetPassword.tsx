import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { resetPassword } from '@/api/auth'
import { useMessage } from '@/hooks/useMessage'
import { newPasswordSchema, NewPasswordForm } from '@/schemas'
import Msgbox from '@common/Msgbox'
import FieldError from '@common/FieldError'
import PasswordInput from '@common/PasswordInput'
import Seo from '@/components/common/Seo'

// The link of the recovery email: /reset-password#token=...
const ResetPassword = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [token] = useState(() => new URLSearchParams(location.hash.slice(1)).get('token') ?? '')
  const [done, setDone] = useState('')
  const { message, showError } = useMessage()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<NewPasswordForm>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', password2: '' },
  })

  // The token leaves the address bar and the browser history as soon as it is read
  useEffect(() => {
    if (location.hash) navigate(location.pathname, { replace: true })
  }, [location.hash, location.pathname, navigate])

  const onSubmit = async (values: NewPasswordForm) => {
    try {
      setDone(await resetPassword({ token, ...values }))
    } catch (error) {
      showError(error, 'Connection error, please try again')
    }
  }

  const content = () => {
    if (done) return <p className="form_notice" role="status">{done}. <NavLink to="/login">Go to login</NavLink></p>
    if (!token) {
      return <p className="form_notice" role="alert">
        This link is not valid. <NavLink to="/forgot-password">Ask for a new one</NavLink>
      </p>
    }
    return <form onSubmit={handleSubmit(onSubmit)} className="form" noValidate>
      <PasswordInput placeholder="Write your new password" aria-label="New password" autoComplete="new-password" maxLength={128}
        aria-invalid={Boolean(errors.password)} {...register('password')} />
      <FieldError error={errors.password} />

      <PasswordInput placeholder="Confirm your new password" aria-label="Confirm new password" autoComplete="new-password" maxLength={128}
        aria-invalid={Boolean(errors.password2)} {...register('password2')} />
      <FieldError error={errors.password2} />

      <button className="btn" disabled={isSubmitting}>Change password</button>
    </form>
  }

  return <div className="page login">
    <Seo title="Choose a new password" noindex />
    <h2 className="title">Choose a new password</h2>
    {content()}
    <Msgbox {...message} />
  </div>
}

export default ResetPassword
