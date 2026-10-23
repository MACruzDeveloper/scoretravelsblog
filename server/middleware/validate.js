// Validates req[source] against a zod schema. Unknown keys are stripped,
// so clients can no longer smuggle fields like `user` or `role`.
const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source])
  if (!result.success) {
    return res.status(400).json({
      ok: false,
      message: 'Invalid request',
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
    })
  }
  req[source] = result.data
  return next()
}

module.exports = { validate }
