const { sendMail, escapeHtml } = require('../services/mailer')
const { HttpError } = require('../utils/httpErrors')

const sanitizeCrlf = (value) => (typeof value === 'string' ? value.replace(/[\r\n]+/g, ' ') : '')

const DEFAULT_SUBJECT = 'This is a default subject'

const send_email = async (req, res) => {
  const { name, email, subject, message, website } = req.body
  // Honeypot filled: answer as if it worked so bots don't retry
  if (website) return res.json({ ok: true, message: 'email sent' })

  try {
    await sendMail({
      replyTo: sanitizeCrlf(email),
      subject: `New message from ${sanitizeCrlf(name)}`,
      text: `${sanitizeCrlf(name)} <${sanitizeCrlf(email)}> wrote:\n\n${message}`,
      html: `<p>${escapeHtml(subject || DEFAULT_SUBJECT)}</p><p><pre>${escapeHtml(message)}</pre></p>`,
    })
  } catch (error) {
    // The SMTP error may contain server details: log it, answer a generic message
    console.error('Email send failed:', error.code || error.message)
    throw new HttpError(502, 'Error sending email')
  }
  res.json({ ok: true, message: 'email sent' })
}

module.exports = { send_email }
