import { useState, ChangeEvent, FormEvent } from 'react'
import { getErrorMessage } from '@/utils/errors'
import { login as apiLogin } from '@/api/auth'
import { useNavigate } from 'react-router-dom'
import Msgbox from '@common/Msgbox'
import PasswordInput from '@common/PasswordInput'
import type { LoginSession } from '@/App'

type PropsLogin = {
  login: (session: LoginSession) => void
}

const Login = ({ login }: PropsLogin) => {
  const navigate = useNavigate()
  const [message, setMessage] = useState({ body: '', classname: '' })
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const [values, setValues] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.currentTarget
    if (target) setValues({ ...values, [target.name]: target.value })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLoggingIn) return
    setIsLoggingIn(true)
    try {
      const session = await apiLogin(values.email, values.password)
      login(session)
      // Admins go to the panel; users to the home (they reach their experiences from the menu)
      navigate(session.role === 'admin' ? '/admin' : '/')
    }
    catch (error) {
      console.log(error)
      setMessage({ body: getErrorMessage(error, 'Connection error, please try again'), classname: 'msg_error' })
    } finally {
      setIsLoggingIn(false)
    }
  }

  return <div className="page login">
    <h2 className="title">Login</h2>

    <form
      onSubmit={handleSubmit}
      className="form"
    >
      <input type="email" name="email" className="form_control" placeholder="Write your email" autoComplete="email" maxLength={254} required onChange={handleChange} />
      <PasswordInput name="password" placeholder="Write your password" autoComplete="current-password" maxLength={128} required onChange={handleChange} />
      <button className="btn" disabled={!values.email || !values.password}>login</button>
    </form>

    <Msgbox body={message.body} classname={message.classname} />
  </div>
}

export default Login
