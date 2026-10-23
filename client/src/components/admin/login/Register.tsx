import { useState, ChangeEvent, FormEvent } from 'react'
import { getErrorMessage } from '@/utils/errors'
import { register } from '@/api/auth'
import { NavLink, useNavigate } from 'react-router-dom'
import Msgbox from '@/components/common/Msgbox'
import PasswordInput from '@/components/common/PasswordInput'
import type { LoginSession } from '@/App'

type PropsRegister = {
  login: (session: LoginSession) => void
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
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.currentTarget
    if (target) setValues({ ...values, [target.name]: target.value })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isRegistering) return
    setIsRegistering(true)
    try {
      // The server signs the new user in and returns the session
      login(await register(values))
      navigate('/')
    }
    catch (error) {
      console.log(error)
      setMessage({ body: getErrorMessage(error, 'Connection error, please try again'), classname: 'msg_error' })
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
      <input type="text" name="username" className="form_control" placeholder="Write your username" autoComplete="username" minLength={3} maxLength={30} pattern="[\p{L}\p{N}_.\-]+" title="3-30 letters, numbers, _ . -" aria-describedby="register-hint" required onChange={handleChange} />
      <input type="email" name="email" className="form_control" placeholder="Write your email" autoComplete="email" maxLength={254} required onChange={handleChange} />
      <PasswordInput name="password" placeholder="Write your password" autoComplete="new-password" minLength={8} maxLength={128} aria-describedby="register-hint" required onChange={handleChange} />
      <PasswordInput name="password2" placeholder="Confirm your password" autoComplete="new-password" minLength={8} maxLength={128} required onChange={handleChange} />
      {/* Same rules the server checks */}
      <ul id="register-hint" className="form_hint">
        <li>Username: 3 to 30 characters, only letters, numbers and <code>_ . -</code></li>
        <li>Password: at least 8 characters</li>
        <li>Both passwords must match</li>
      </ul>
      <button className="btn">Register</button>
      <p className="form_legal">By registering you accept the <NavLink to="/privacy">privacy policy</NavLink>.</p>
    </form>

    <Msgbox body={message.body} classname={message.classname} />
  </div>

}

export default Register