// Errors a controller can throw; the central error handler turns them into JSON responses
class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

const badRequest = (message = 'Invalid request') => new HttpError(400, message)
const unauthorized = (message = 'Authentication required') => new HttpError(401, message)
const forbidden = (message = 'Forbidden') => new HttpError(403, message)
const notFound = (message = 'Not found') => new HttpError(404, message)
const conflict = (message = 'Conflict') => new HttpError(409, message)

module.exports = { HttpError, badRequest, unauthorized, forbidden, notFound, conflict }
