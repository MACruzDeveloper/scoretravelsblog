import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { NavLink, useNavigate } from 'react-router-dom'
import { register as apiRegister } from '@/api/auth'
import { useMessage } from '@/hooks/useMessage'
import { registerSchema, RegisterForm } from '@/schemas'
import Msgbox from '@/components/common/Msgbox'
import FieldError from '@/components/common/FieldError'
import PasswordInput from '@/components/common/PasswordInput'
import type { LoginSession } from '@/App'

type PropsRegister = {
  login: (session: LoginSession) => void
}

const Register = ({ login }: PropsRegister) => {
  const navigate = useNavigate()
  const { message, showError } = useMessage()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '', password2: '' },
  })

  const onSubmit = async (values: RegisterForm) => {
    try {
      // The server signs the new user in and returns the session
      login(await apiRegister(values))
      navigate('/')
    } catch (error) {
      showError(error, 'Connection error, please try again')
    }
  }

  return <div className="page login">
    <h2 className="title">Register</h2>

    <form onSubmit={handleSubmit(onSubmit)} className="form" noValidate>
      <input type="text" className="form_control" placeholder="Write your username" aria-label="Username" autoComplete="username"
        maxLength={30} aria-describedby="register-hint" aria-invalid={Boolean(errors.username)} {...register('username')} />
      <FieldError error={errors.username} />

      <input type="email" className="form_control" placeholder="Write your email" aria-label="Email" autoComplete="email"
        maxLength={254} aria-invalid={Boolean(errors.email)} {...register('email')} />
      <FieldError error={errors.email} />

      <PasswordInput placeholder="Write your password" aria-label="Password" autoComplete="new-password" maxLength={128}
        aria-describedby="register-hint" aria-invalid={Boolean(errors.password)} {...register('password')} />
      <FieldError error={errors.password} />

      <PasswordInput placeholder="Confirm your password" aria-label="Confirm password" autoComplete="new-password" maxLength={128}
        aria-invalid={Boolean(errors.password2)} {...register('password2')} />
      <FieldError error={errors.password2} />

      {/* Same rules the server checks */}
      <ul id="register-hint" className="form_hint">
        <li>Username: 3 to 30 characters, only letters, numbers and <code>_ . -</code></li>
        <li>Password: at least 8 characters</li>
        <li>Both passwords must match</li>
      </ul>
      <button className="btn" disabled={isSubmitting}>Register</button>
      <p className="form_legal">By registering you accept the <NavLink to="/privacy">privacy policy</NavLink>.</p>
    </form>

    <Msgbox body={message.body} classname={message.classname} />
  </div>
}

export default Register
