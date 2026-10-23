const nodemailer = require('nodemailer')
const { smtp } = require('../config')
const { HttpError } = require('../utils/httpErrors')

// SMTP transport (Brevo). Credentials come from .env through config.js
const transport = nodemailer.createTransport({
  host: smtp.host,
  port: smtp.port,
  secure: false,
  auth: { user: smtp.user, pass: smtp.pass },
})

const sanitizeCrlf = (value) => (typeof value === 'string' ? value.replace(/[\r\n]+/g, ' ') : '')

const escapeHtml = (value) =>
  typeof value === 'string'
    ? value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
    : ''

const DEFAULT_SUBJECT = 'This is a default subject'

const send_email = async (req, res) => {
  const { name, email, subject, message, website } = req.body
  // Honeypot filled: answer as if it worked so bots don't retry
  if (website) return res.json({ ok: true, message: 'email sent' })

  try {
    await transport.sendMail({
      from: smtp.from,
      replyTo: sanitizeCrlf(email),
      to: smtp.to,
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
