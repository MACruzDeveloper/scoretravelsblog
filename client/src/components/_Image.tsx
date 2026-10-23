import { useState } from "react"
import { URL } from '../config'

const Image = props => {
  const [dispMessage, setDispMessage] = useState(false)
  const tit = props.item.filename.split('-')[1].split('.')[0]
  
  return !dispMessage ? (
    <>
      <div className="tCol">
        <img
          className="image"
          src={`${URL}/static/images/${props.item.filename}`}
          alt={tit}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="tCol">
        <span>{tit}</span>
      </div>
      <div className="tCol center">
        <button className="btnAdmin delete_x" onClick={() => setDispMessage(true)}>delete</button>
      </div>
    </>
  ) : (
    <div className="image_container i_c_ex">
      <p className="message_text">Do you want to</p>
      <p className="message_text">remove this image?</p>
      <div className="buttons_container">
        <button
          className="yes_button"
          onClick={() => {
            setDispMessage(false)
            props.delete_image(props.idx, props.item._id, props.item.filename)
          }}
        >
          Yes
        </button>
        <button className="no_button" onClick={() => setDispMessage(false)}>
          No
        </button>
      </div>
    </div>
  )
}

export default Image
