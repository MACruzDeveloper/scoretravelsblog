import { useState } from 'react'
import axios from 'axios'
import { URL } from '../config'
import Msgbox from './common/Msgbox'

const Contact = () => {
  const [message, setMessage] = useState({ body: '', classname: '' })

  const handleSubmit = (event: any) => {
    event.preventDefault()
    const nameInput = event.target.elements.name
    const emailInput = event.target.elements.email
    const messageInput = event.target.elements.message
    const subject = "Here is the message: "
    const data = { 
      name: nameInput.value, 
      email: emailInput.value, 
      message: messageInput.value, 
      subject: subject 
    }

    axios.post(`${URL}/emails/send_email`, data)
      .then((res) => {
        console.log(res)
        nameInput.value = ""
        emailInput.value = ""
        messageInput.value = ""
        setMessage({ body: 'Your message has been sent, thanks!', classname: 'msg_ok' })
      })
      .catch(function (error) {
        console.log(error)
      })
    console.log("--SeNd!--")
  }

  return <div className="page contact">
    <div className="container">
      <div className="mod_contact">
        <div className="top">
          <h2 className="title">Contact</h2>
          <h3 className="subtitle">How could we help you?</h3>
        </div>

        <form className="form form_contact" onSubmit={handleSubmit}>
          <input type="text" className="form_control" placeholder="What is your name?" name="name" required />
          <input type="email" className="form_control" placeholder="Your contact email?" name="email" required />
          <textarea className="form_control" placeholder="Please write your message" name="message" rows={3} required />
          <button className="btn">Send</button>
        </form>
      </div>

      <Msgbox body={message.body} classname={message.classname} />
    </div>
  </div>
}

export default Contact