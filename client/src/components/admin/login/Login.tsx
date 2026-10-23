import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin } from '@/api/auth'
import { useMessage } from '@/hooks/useMessage'
import { loginSchema, LoginForm } from '@/schemas'
import Msgbox from '@common/Msgbox'
import FieldError from '@common/FieldError'
import PasswordInput from '@common/PasswordInput'
import type { LoginSession } from '@/App'

type PropsLogin = {
  login: (session: LoginSession) => void
}

const Login = ({ login }: PropsLogin) => {
  const navigate = useNavigate()
  const { message, showError } = useMessage()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async ({ email, password }: LoginForm) => {
    try {
      const session = await apiLogin(email, password)
      login(session)
      // Admins go to the panel; users to the home (they reach their experiences from the menu)
      navigate(session.role === 'admin' ? '/admin' : '/')
    } catch (error) {
      showError(error, 'Connection error, please try again')
    }
  }

  return <div className="page login">
    <h2 className="title">Login</h2>

    <form onSubmit={handleSubmit(onSubmit)} className="form" noValidate>
      <input type="email" className="form_control" placeholder="Write your email" aria-label="Email" autoComplete="email"
        maxLength={254} aria-invalid={Boolean(errors.email)} {...register('email')} />
      <FieldError error={errors.email} />

      <PasswordInput placeholder="Write your password" aria-label="Password" autoComplete="current-password"
        maxLength={128} aria-invalid={Boolean(errors.password)} {...register('password')} />
      <FieldError error={errors.password} />

      <button className="btn" disabled={isSubmitting}>login</button>
    </form>

    <Msgbox body={message.body} classname={message.classname} />
  </div>
}

export default Login
