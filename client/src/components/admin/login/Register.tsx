import { useState, ChangeEvent, FormEvent } from 'react'
import { postData } from '@/utils/utils'
import { useNavigate } from 'react-router-dom'
import { URL } from '../../../config'
import Msgbox from '@/components/common/Msgbox'

type PropsRegister = {
  login: (token: string, role: string) => void
  logout: () => void
}

const Register = ({ login, logout }: PropsRegister) => {
  const navigate = useNavigate()
  const [values, setValues] = useState({ email: '', password: '', password2: '' })
  const [message, setMessage] = useState({ body: '', classname: '' })

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.currentTarget
    if (target) setValues({ ...values, [target.name]: target.value })
  }

  const loginRegister = async () => {
    try {
      const response = await postData(`${URL}/users/login`, {
        email: values.email,
        password: values.password
      })
      setMessage({ body: response.data.message, classname: 'msg_ok' })

      if (response.data.ok) {
        setTimeout(() => {
          login(response.data.token, response.data.role)
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
        email: values.email,
        password: values.password,
        password2: values.password2
      })
      loginRegister()
      setMessage({ body: response.data.message, classname: 'msg_ok' })
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
      <input type="text" name="email" className="form_control" placeholder="Write your email" onChange={handleChange} />
      <input type="password" name="password" className="form_control" placeholder="Write your password" onChange={handleChange} />
      <input type="password" name="password2" className="form_control" placeholder="Confirm your password" onChange={handleChange} />
      <button className="btn">Register</button>
    </form>

    <Msgbox body={message.body} classname={message.classname} />
  </div>

}

export default Register