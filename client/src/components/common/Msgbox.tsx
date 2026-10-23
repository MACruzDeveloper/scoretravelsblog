import { useEffect, useState } from "react"

export type ParamsMsgBox = {
  body: string
  classname: string
  // Changes on every notice, so the same text shown twice appears twice
  id?: number
}

const VISIBLE_MS = 3000

// Notice over the page; disappears after a few seconds, on click or with Escape
const Msgbox = ({ body, classname, id }: ParamsMsgBox) => {
  const [msg, setMsg] = useState('')

  useEffect(() => {
    setMsg(body)
    const timer = setTimeout(() => setMsg(''), VISIBLE_MS)
    return () => clearTimeout(timer)
  }, [body, id])

  useEffect(() => {
    if (!msg) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMsg('')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [msg])

  const visible = Boolean(classname && msg)
  return <div className={`modal ${visible ? 'on' : ''}`} onClick={() => setMsg('')}>
    <div className="modal_content" role={classname === 'msg_error' ? 'alert' : 'status'}>
      <p className={`msg ${classname}`}>{msg}</p>
    </div>
  </div>
}

export default Msgbox
