import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { changePassword } from '@/api/auth'
import { useMessage } from '@/hooks/useMessage'
import { changePasswordSchema, ChangePasswordForm } from '@/schemas'
import Msgbox from '@common/Msgbox'
import FieldError from '@common/FieldError'
import PasswordInput from '@common/PasswordInput'
import type { LoginSession } from '@/App'

type PropsChangePassword = {
  login: (session: LoginSession) => void
}

const EMPTY = { currentPassword: '', password: '', password2: '' }

const ChangePassword = ({ login }: PropsChangePassword) => {
  const { message, showOk, showError } = useMessage()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: EMPTY,
  })

  const onSubmit = async (values: ChangePasswordForm) => {
    try {
      // The old sessions stop working, so this device continues with the new one
      login(await changePassword(values))
      reset(EMPTY)
      showOk('Password changed. Other devices will have to sign in again')
    } catch (error) {
      showError(error, 'Could not change the password')
    }
  }

  return <div className="content account">
    <div className="content_top">
      <h2 className="content_top_title">My password</h2>
    </div>

    <form onSubmit={handleSubmit(onSubmit)} className="form" noValidate>
      <PasswordInput placeholder="Current password" aria-label="Current password" autoComplete="current-password" maxLength={128}
        aria-invalid={Boolean(errors.currentPassword)} {...register('currentPassword')} />
      <FieldError error={errors.currentPassword} />

      <PasswordInput placeholder="New password (at least 8 characters)" aria-label="New password" autoComplete="new-password" maxLength={128}
        aria-invalid={Boolean(errors.password)} {...register('password')} />
      <FieldError error={errors.password} />

      <PasswordInput placeholder="Confirm the new password" aria-label="Confirm new password" autoComplete="new-password" maxLength={128}
        aria-invalid={Boolean(errors.password2)} {...register('password2')} />
      <FieldError error={errors.password2} />

      <button className="btn btn_admin" disabled={isSubmitting}>Change password</button>
    </form>

    <Msgbox {...message} />
  </div>
}

export default ChangePassword
