import { postData } from '@/utils/utils'
import { API } from '@/config'

// `website` is a honeypot field that people leave empty
export type ContactMessage = { name: string; email: string; message: string; subject?: string; website?: string }

export const sendContactMessage = async (data: ContactMessage) => {
  await postData(`${API}/contact`, data)
}
