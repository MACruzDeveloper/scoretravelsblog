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

/**
 * Sends the password recovery link to the user.
 * Never throws: the answer must not reveal whether the email exists or could be sent.
 */
const sendPasswordResetEmail = async (user, url) => {
  if (!smtp.user) {
    logger.warn('Password recovery email not sent: SMTP is not configured')
    return
  }
  try {
    await sendMail({
      to: user.email,
      subject: 'Reset your ScoreTravelsBlog password',
      text: `Hi ${user.username},\n\nUse this link to choose a new password. It works once and expires in 1 hour:\n${url}\n\nIf you did not ask for it, you can ignore this email.`,
      html: `<p>Hi ${escapeHtml(user.username)},</p><p><a href="${escapeHtml(url)}">Choose a new password</a>. The link works once and expires in 1 hour.</p><p>If you did not ask for it, you can ignore this email.</p>`,
    })
  } catch (error) {
    logger.error({ err: error }, 'Password recovery email failed')
  }
}

module.exports = { sendMail, notifyPendingReview, sendPasswordResetEmail }
