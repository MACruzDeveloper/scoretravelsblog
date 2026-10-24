// Validates req[source] against a zod schema. Unknown keys are stripped,
// so clients can no longer smuggle fields like `user` or `role`.
// Parsed values replace the originals (numbers coerced, defaults applied).
const validate =
  (schema, source = 'body') =>
  (req, res, next) => {
    const result = schema.safeParse(req[source])
    if (!result.success) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid request',
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      })
    }
    // In Express 5 req.query is a getter, so it cannot simply be assigned
    Object.defineProperty(req, source, { value: result.data, writable: true, configurable: true, enumerable: true })
    return next()
  }

module.exports = { validate }
