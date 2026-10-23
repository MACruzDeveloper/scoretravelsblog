import type { FieldError as HookFieldError } from 'react-hook-form'

type PropsFieldError = {
  error?: HookFieldError
}

// Validation message under a form field (react-hook-form + zod)
const FieldError = ({ error }: PropsFieldError) => {
  if (!error?.message) return null
  return <p className="form_error" role="alert">{error.message}</p>
}

export default FieldError
