import { useState, FormEvent } from 'react'
import { NavLink } from 'react-router-dom'
import Msgbox from './common/Msgbox'
import { validateEmail } from '@utils/utils'
import { sendContactMessage } from '@/api/contact'

const Contact = () => {
  const [isChecked, setIsChecked] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [message, setMessage] = useState({ body: '', classname: '' })
  
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const field = (name: string) => event.currentTarget.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement
    const nameInput = field('name')
    const emailInput = field('email')
    const messageInput = field('message')
    const websiteInput = field('website')
    const subject = "Here is the message: "

    const data = { 
      name: nameInput.value, 
      email: emailInput.value, 
      message: messageInput.value, 
      subject: subject,
      website: websiteInput.value
    }

    if (validateEmail(data.email)) {
      setIsSending(true)
      sendContactMessage(data)
        .then(() => {
          nameInput.value = ""
          emailInput.value = ""
          messageInput.value = ""
          setMessage({ body: 'Your message has been sent, thanks!', classname: 'msg_ok' })
        })
        .catch((error) => {
          console.log(error)
          setMessage({ body: 'Could not send your message, please try again later', classname: 'msg_error' })
        })
        .finally(() => setIsSending(false))
    } else {
      setMessage({ body: 'The email format is not correct', classname: 'msg_error' })
    }
  }

  return <div className="page contact">
    <div className="container">
      <div className="mod_contact">
        <div className="top">
          <h2 className="title">Contact</h2>
          <h3 className="subtitle">How could we help you?</h3>
        </div>

        <form className="form form_contact" onSubmit={handleSubmit}>
          <div className="form_group">
            <input type="text" className="form_control" placeholder="*What is your name?" name="name" maxLength={100} required />
          </div>

          <div className="form_group">
            <input type="email" className="form_control" placeholder="*Your contact email?" name="email" maxLength={254} required />
          </div>

          <div className="form_group">
            <textarea className="form_control" placeholder="*Please write your message" name="message" rows={3} maxLength={5000} required />
          </div>

          {/* Honeypot: hidden from people, bots tend to fill it */}
          <div className="form_group" aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', overflow: 'hidden' }}>
            <label htmlFor="cb_website">Website</label>
            <input type="text" id="cb_website" name="website" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="form_group">
            <input type="checkbox" id="cb_contact" className="cb_custom" defaultChecked={isChecked} onChange={() => setIsChecked(!isChecked)} required />
            <label htmlFor="cb_contact">I have read and accept the <NavLink to="/privacy" target="_blank">privacy policy</NavLink></label>
          </div>
    
          <button className="btn" disabled={!isChecked || isSending}>Send</button>
        </form>
      </div>

      <Msgbox body={message.body} classname={message.classname} />
    </div>
  </div>
}

export default Contact