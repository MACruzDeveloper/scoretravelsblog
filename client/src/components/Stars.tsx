import { useState, useContext } from 'react'
import { postData } from '../utils/utils'
import { MdStar, MdStarBorder } from 'react-icons/md'
import { URL } from '../config'
import { MyGlobalContext } from '../App'
import Msgbox from './common/Msgbox'

type PropsStars = {
  exp: string
}

const Stars = ({ exp }: PropsStars) => {
  const { user } = useContext(MyGlobalContext)
  const [message, setMessage] = useState({ body: '', classname: '' })
  const [starHover, setStarHover] = useState(-1)
  const stars = []
  const numStars = 5

  for (let i = 0; i < numStars; i++) {
    stars.push(`score${i}`)
  }

  const onHandleHover = (i: number) => {
    return setStarHover(i)
  }

  const onClickScore = async (i: number) => {
    try {
      let url = `${URL}/admin/scores/add`
      await postData(url, { experience: exp, user: user, score: i+1 })
      window.location.reload() // To calculate the Score with the new value
      setMessage({ body: `Score added!`, classname: 'msg_ok' })
    } catch (error) {
      console.log(error)
    }
  }

  return <div className="stars">
    {
      stars.map((ele, i) => {
        return <button
          key={ele}
          name={ele}
          className="btn_icon"
          onMouseEnter={() => onHandleHover(i)}
          onMouseLeave={() => onHandleHover(-1)}
          onClick={() => onClickScore(i)}
        >{starHover === i ? <MdStar /> : <MdStarBorder />}</button>
      })
    }

    <Msgbox body={message.body} classname={message.classname} />
  </div>
}

export default Stars