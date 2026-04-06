import { useState, ChangeEvent, FormEvent } from 'react'
import { postData } from '../../utils/utils'
import { useNavigate } from 'react-router-dom'
import { URL } from '../../config'
import Msgbox from '../../components/common/Msgbox'

type PropsLogin = {
  login: (token: string, role: string) => void
}

const Login = ({ login }: PropsLogin) => {
  const navigate = useNavigate()
  const [message, setMessage] = useState({ body: '', classname: '' })

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
