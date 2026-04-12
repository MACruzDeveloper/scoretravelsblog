import { useState, FormEvent } from 'react'
import { checkFileSize } from '@utils/utils'
import { URL } from '../../config'
import Msgbox, { ParamsMsgBox } from '@common/Msgbox'

type propsImageUpload = {
  setSelectedFilename?: (c: string) => void
  fetch_images?: () => void
  isImageWithTitle: boolean
}

const ImageUpload = ({ setSelectedFilename, fetch_images, isImageWithTitle }: propsImageUpload) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [loaded, setLoaded] = useState(0)
  //const [isFileValid, setIsFileValid] = useState(false)
  const [loadingFile, setLoadingFile] = useState(false)
  const [message, setMessage] = useState<ParamsMsgBox>({body: '', classname: ''})
  const [valueInputAdd, setValueInputAdd] = useState('')

  const handleChangeTitle = (e: FormEvent<HTMLInputElement>) => {
    const target = e.currentTarget
    if (target) setValueInputAdd(target.value)
  }

  const onChangeHandlerFile = (e: FormEvent<HTMLInputElement>) => {
    const target = e.currentTarget
    if (target) {
      const file = target.files[0]
      if (checkFileSize(file)) {
        setSelectedFile(file)
        setLoaded(0)
        !isImageWithTitle && uploadImage(file)
      } else {
        console.log('Error: file too much big')
        setMessage({ body: `file too much big. Max 1MB`, classname: 'msg_error' })
        setSelectedFile(null)
      }
    }
  }

  const uploadImage = async (file: File) => {
    const data = new FormData()
    data.append('file', file)
    data.append('title', valueInputAdd || '')
    setLoadingFile(true)

    try {
      const response = await fetch(`${URL}/images/upload`, {
        method: 'POST',
        body: data
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || response.statusText)
      }
      const res = await response.json()
      console.log("upload success", res.filename, "title=", valueInputAdd)
      setSelectedFilename(res.filename)
      setSelectedFile(null)
      setValueInputAdd('')
      setLoadingFile(false)
      setLoaded(100)
      setMessage({ body: `Image uploaded!`, classname: 'msg_ok' })
      await fetch_images?.()
    } catch (err) {
      console.log(err)
      setLoadingFile(false)
      //setMessage({ body: `upload fail`, classname: 'msg_error' })
    }
  }

  return <div className="image_upload">
    <input
      type="file"
      name="image"
      accept="image/png,image/gif,image/jpeg"
      onChange={onChangeHandlerFile}
    />
    
    <div className={`modal ${loadingFile && 'on'}`}>
      <div className="modal_content">
        <input type="range" min="0" max="100" value={loaded} readOnly />
      </div>
    </div>

    { isImageWithTitle && selectedFile &&
      <div className="image_upload_cta">
        <input
          type="text"
          id="title"
          name="title"
          className="form_control"
          placeholder="Write the title"
          value={valueInputAdd}
          onChange={handleChangeTitle}
        />

        <button
          type="button"
          className="btn btn_admin"
          onClick={() => uploadImage(selectedFile)}
        >Upload</button>
      </div>
    }

    <Msgbox body={message.body} classname={message.classname} />
  </div>
}

export default ImageUpload
