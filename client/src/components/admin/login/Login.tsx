import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react'
import { postData } from '@utils/utils'
import { useNavigate } from 'react-router-dom'
import { URL } from '../../../config'
import Msgbox from '@common/Msgbox'

type PropsLogin = {
  login: (token: string, role: string, username?: string, email?: string) => void
}

const Login = ({ login }: PropsLogin) => {
  const navigate = useNavigate()
  const [message, setMessage] = useState({ body: '', classname: '' })
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const timerRef = useRef<number>()

  const [values, setValues] = useState({
    email: '',
    password: ''
  })

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.currentTarget
    if (target) setValues({ ...values, [target.name]: target.value })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLoggingIn) return
    setIsLoggingIn(true)
    try {
      const response = await postData(`${URL}/users/login`, {
        email: values.email,
        password: values.password
      })

      if (response.data.ok) {
        setMessage({ body: response.data.message, classname: 'msg_ok' })
        timerRef.current = window.setTimeout(() => {
          login(response.data.token, response.data.role, response.data.username, response.data.email)
          navigate('/admin/')
        }, 2000)
      } else {
        setMessage({ body: response.data.message || 'Login failed', classname: 'msg_error' })
      }
    }
    catch (error) {
      console.log(error)
      setMessage({ body: 'Connection error, please try again', classname: 'msg_error' })
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
      <input type="text" name="email" className="form_control" placeholder="Write your email" onChange={handleChange} />
      <input type="password" name="password" className="form_control" placeholder="Write your password" onChange={handleChange} />
      <button className="btn" disabled={!values.email || !values.password}>login</button>
    </form>

    <Msgbox body={message.body} classname={message.classname} />
  </div>
}

export default Login
