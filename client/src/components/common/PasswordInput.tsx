import { useState, type InputHTMLAttributes, type Ref } from 'react'
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'

type PropsPasswordInput = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  ref?: Ref<HTMLInputElement>
}

// Password field with a button to show or hide what has been typed (works with react-hook-form)
const PasswordInput = ({ className = 'form_control', ref, ...props }: PropsPasswordInput) => {
  const [visible, setVisible] = useState(false)

  return <div className="password_field">
    <input {...props} ref={ref} type={visible ? 'text' : 'password'} className={className} />
    <button
      type="button"
      className="password_toggle"
      onClick={() => setVisible(!visible)}
      aria-label={visible ? 'Hide password' : 'Show password'}
      aria-pressed={visible}
    >
      {visible ? <MdVisibilityOff /> : <MdVisibility />}
    </button>
  </div>
}

export default PasswordInput
