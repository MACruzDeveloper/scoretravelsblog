import { useState, useRef, ChangeEvent, FormEvent } from 'react'
import { checkFileSize } from '@utils/utils'
import { URL } from '../../config'
import Msgbox, { ParamsMsgBox } from '@common/Msgbox'

type propsImageUpload = {
  setSelectedFilename?: (c: string) => void
  addSelectedFilename?: (c: string) => void
  removeSelectedFilename?: (index: number) => void
  fetch_images?: () => void
  isImageWithTitle: boolean
  allowMultiple?: boolean
  maxImages?: number
  currentImages?: string[]
}

const ImageUpload = ({
  setSelectedFilename,
  addSelectedFilename,
  removeSelectedFilename,
  fetch_images,
  isImageWithTitle,
  allowMultiple = false,
  maxImages = allowMultiple ? 5 : 1,
  currentImages = [],
}: propsImageUpload) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loaded, setLoaded] = useState(0)
  const [loadingFile, setLoadingFile] = useState(false)
  const [message, setMessage] = useState<ParamsMsgBox>({ body: '', classname: '' })
  const [valueInputAdd, setValueInputAdd] = useState('')

  const handleChangeTitle = (e: FormEvent<HTMLInputElement>) => {
    const target = e.currentTarget
    if (target) setValueInputAdd(target.value)
  }

  const onChangeHandlerFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.currentTarget
    if (!target || !target.files || target.files.length === 0) return

    const files = Array.from(target.files)
    if (allowMultiple && currentImages.length + files.length > maxImages) {
      setMessage({ body: `You can upload up to ${maxImages} images`, classname: 'msg_error' })
      target.value = ''
      return
    }

    setLoaded(0)
    for (const file of files) {
      if (!checkFileSize(file)) {
        console.log('Error: file too much big')
        setMessage({ body: `File too big. Max 5MB`, classname: 'msg_error' })
        setSelectedFile(null)
        continue
      }

      setSelectedFile(file)
      if (!isImageWithTitle) {
        await uploadImage(file)
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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
        body: data,
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || response.statusText)
      }
      const res = await response.json()
      const filename = res.filename || res.file?.filename
      if (!filename) {
        throw new Error('Upload response missing filename')
      }
      console.log('upload success', filename, 'title=', valueInputAdd)
      if (addSelectedFilename) {
        addSelectedFilename(filename)
      }
      if (setSelectedFilename) {
        setSelectedFilename(filename)
      }
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
      ref={fileInputRef}
      type="file"
      name="image"
      accept="image/png,image/gif,image/jpeg,image/avif"
      multiple={allowMultiple}
      onChange={onChangeHandlerFile}
    />

    <div className={`modal ${loadingFile && 'on'}`}>
      <div className="modal_content">
        <input type="range" min="0" max="100" value={loaded} readOnly />
      </div>
    </div>

    {isImageWithTitle && selectedFile &&
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
          onClick={() => selectedFile && uploadImage(selectedFile)}
        >Upload</button>
      </div>
    }

    {currentImages.length > 0 && (
      <div className="image_upload_list">
        <strong>Uploaded images:</strong>
        <ul>
          {currentImages.map((image, idx) => (
            <li key={`${image}-${idx}`} className="image_upload_item">
              <img src={`${URL}/static/images/${image}`} alt={`Uploaded ${idx + 1}`} />
              {removeSelectedFilename ? (
                <button type="button" className="image_upload_remove" onClick={() => removeSelectedFilename(idx)}>
                  ×
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    )}

    <Msgbox body={message.body} classname={message.classname} />
  </div>
}

export default ImageUpload
