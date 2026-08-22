import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react'
import { postData } from '@/utils/utils'
import { useNavigate } from 'react-router-dom'
import { URL } from '../../../config'
import Msgbox from '@/components/common/Msgbox'

type PropsRegister = {
  login: (token: string, role: string, username: string, email: string) => void
}

const Register = ({ login }: PropsRegister) => {
  const navigate = useNavigate()
  const [values, setValues] = useState({ 
    username: '',
    email: '', 
    password: '', 
    password2: '' 
  })
  const [message, setMessage] = useState({ body: '', classname: '' })
  const [isRegistering, setIsRegistering] = useState(false)
  const timerRef = useRef<number>()

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.currentTarget
    if (target) setValues({ ...values, [target.name]: target.value })
  }

  const loginRegister = async () => {
    try {
      const response = await postData(`${URL}/users/login`, {
        username: values.username,
        email: values.email,
        password: values.password
      })

      if (response.data.ok) {
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
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isRegistering) return
    setIsRegistering(true)
    try {
      const response = await postData(`${URL}/users/register`, {
        username: values.username,
        email: values.email,
        password: values.password,
        password2: values.password2
      })

      if (response.data.ok) {
        setMessage({
          body: response.data.message,
          classname: 'msg_ok'
        })

        await loginRegister()
      } else {
        setMessage({
          body: response.data.message,
          classname: 'msg_error'
        })
      }
    }
    catch (error) {
      console.log(error)
      setMessage({ body: 'Connection error, please try again', classname: 'msg_error' })
    } finally {
      setIsRegistering(false)
    }
  }
  return <div className="page login">
    <h2 className="title">Register</h2>

    <form
      onSubmit={handleSubmit}
      className='form'
    >
      <input type="text" name="username" className="form_control" placeholder="Write your username" onChange={handleChange} />
      <input type="email" name="email" className="form_control" placeholder="Write your email" onChange={handleChange} />
      <input type="password" name="password" className="form_control" placeholder="Write your password" onChange={handleChange} />
      <input type="password" name="password2" className="form_control" placeholder="Confirm your password" onChange={handleChange} />
      <button className="btn">Register</button>
    </form>

    <Msgbox body={message.body} classname={message.classname} />
  </div>

}

export default Register