const nodemailer = require('nodemailer')

// SMTP transport (Brevo). Credentials come from .env
const transport = nodemailer.createTransport({
	host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
	port: Number(process.env.SMTP_PORT) || 587,
	secure: false,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS
	}
})

const sanitizeCrlf = (value) =>
  typeof value === 'string' ? value.replace(/[\r\n]+/g, ' ') : ''

const escapeHtml = (value) =>
  typeof value === 'string'
    ? value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
    : ''

const send_email = async (req, res) => {
	const { name, email, subject, message } = req.body
	const default_subject = 'This is a default subject'
	const mailOptions = {
		from: process.env.SMTP_FROM || process.env.SMTP_USER,
		replyTo: sanitizeCrlf(email),
		to: process.env.SMTP_TO || process.env.SMTP_FROM || process.env.SMTP_USER,
		subject: "New message from " + sanitizeCrlf(name),
		text: `${name} <${email}> wrote:\n\n${message}`,
		html: '<p>' + escapeHtml(subject || default_subject) + '</p><p><pre>' + escapeHtml(message) + '</pre></p>'
	}
	try {
		const response = await transport.sendMail(mailOptions)
		return res.json({ ok: true, message: 'email sent' })
	}
	catch (err) {
		console.error('Email send failed:', err.code || err.message)
		return res.status(500).json({ ok: false, message: 'Error sending email' })
	}
}

module.exports = { send_email }