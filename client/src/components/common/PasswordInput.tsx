import { useState, forwardRef, InputHTMLAttributes } from 'react'
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'

type PropsPasswordInput = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

// Password field with a button to show or hide what has been typed (works with react-hook-form)
const PasswordInput = forwardRef<HTMLInputElement, PropsPasswordInput>(({ className = 'form_control', ...props }, ref) => {
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
})

PasswordInput.displayName = 'PasswordInput'

export default PasswordInput
