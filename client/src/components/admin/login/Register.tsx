import { useState, ChangeEvent, FormEvent } from 'react'
import { postData } from '@/utils/utils'
import { useNavigate } from 'react-router-dom'
import { URL } from '../../../config'
import Msgbox from '@/components/common/Msgbox'

type PropsRegister = {
  login: (token: string, role: string, username: string, email: string) => void
  logout: () => void
}

const Register = ({ login, logout }: PropsRegister) => {
  const navigate = useNavigate()
  const [values, setValues] = useState({ 
    username: '',
    email: '', 
    password: '', 
    password2: '' 
  })
  const [message, setMessage] = useState({ body: '', classname: '' })

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
      setMessage({ body: response.data.message, classname: 'msg_ok' })

      if (response.data.ok) {
        setTimeout(() => {
          login(response.data.token, response.data.role, response.data.username, response.data.email)
          navigate('/admin/')
        }, 2000)
      }

    }
    catch (error) {
      console.log(error)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    logout()
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