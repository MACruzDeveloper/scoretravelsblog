const nodemailer = require('nodemailer')
const { smtp } = require('../config')
const { escapeHtml } = require('../utils/html')
const logger = require('../logger')

// SMTP transport (Brevo). Credentials come from .env through config.js
const transport = nodemailer.createTransport({
  host: smtp.host,
  port: smtp.port,
  secure: false,
  auth: { user: smtp.user, pass: smtp.pass },
})

const sendMail = (options) => transport.sendMail({ from: smtp.from, to: smtp.to, ...options })

/**
 * Tells the admin (SMTP_TO) that an experience waits for review.
 * Never throws: a failed email must not fail the request that triggered it.
 */
const notifyPendingReview = async (experience, { edited = false } = {}) => {
  if (!smtp.user || !smtp.to) return
  try {
    const action = edited ? 'edited' : 'submitted'
    await sendMail({
      subject: `Experience ${action}, pending review: ${experience.title}`,
      text: `${experience.user} ${action} "${experience.title}". Review it in the admin panel (Moderation).`,
      html: `<p><strong>${escapeHtml(experience.user)}</strong> ${action} <strong>${escapeHtml(experience.title)}</strong>.</p><p>Review it in the admin panel (Moderation).</p>`,
    })
  } catch (error) {
    logger.error({ err: error }, 'Review notification failed')
  }
}

module.exports = { sendMail, notifyPendingReview }
