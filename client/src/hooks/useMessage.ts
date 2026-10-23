import { useCallback, useState } from 'react'
import type { ParamsMsgBox } from '@/components/common/Msgbox'
import { getErrorMessage } from '@/utils/errors'

/** Success and error notices shown with <Msgbox />; errors show the server's message. */
export const useMessage = () => {
  const [message, setMessage] = useState<ParamsMsgBox>({ body: '', classname: '' })

  // Stable functions: safe to use as effect or callback dependencies
  const showOk = useCallback((body: string) => setMessage({ body, classname: 'msg_ok' }), [])

  const showError = useCallback((error: unknown, fallback: string) => {
    console.error(error)
    setMessage({ body: getErrorMessage(error, fallback), classname: 'msg_error' })
  }, [])

  // For validation messages that are not exceptions
  const showWarning = useCallback((body: string) => setMessage({ body, classname: 'msg_error' }), [])

  return { message, showOk, showError, showWarning }
}
