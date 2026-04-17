import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_NAME = 120
const MAX_SUBJECT = 200
const MAX_MESSAGE = 5000

interface ContactPayload {
  name?: unknown
  email?: unknown
  subject?: unknown
  message?: unknown
  // Honeypot — bots fill it, humans don't
  company?: unknown
}

function sanitize(s: string): string {
  return s.replace(/[<>]/g, '').trim()
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.RESEND_API_KEY
  const toEmail = process.env.CONTACT_TO_EMAIL
  // Default sender is Resend's sandbox address. It works out of the box as long
  // as CONTACT_TO_EMAIL matches the email registered on the Resend account
  // (Resend sandbox only delivers to the account owner). Once a custom domain
  // is verified in Resend, set CONTACT_FROM_EMAIL to 'Name <you@yourdomain>'.
  const fromEmail = process.env.CONTACT_FROM_EMAIL || 'Portfolio <onboarding@resend.dev>'

  if (!apiKey || !toEmail) {
    return res.status(500).json({
      error:
        'Server is not configured. Set RESEND_API_KEY and CONTACT_TO_EMAIL in Vercel.',
    })
  }

  const body = (req.body ?? {}) as ContactPayload

  // Honeypot — silently accept to avoid giving bots feedback
  if (typeof body.company === 'string' && body.company.trim().length > 0) {
    return res.status(200).json({ ok: true })
  }

  if (typeof body.name !== 'string' || typeof body.email !== 'string' || typeof body.message !== 'string') {
    return res.status(400).json({ error: 'Name, email, and message are required.' })
  }

  const name = sanitize(body.name).slice(0, MAX_NAME)
  const email = sanitize(body.email).slice(0, 320)
  const subject =
    typeof body.subject === 'string'
      ? sanitize(body.subject).slice(0, MAX_SUBJECT)
      : ''
  const message = body.message.trim().slice(0, MAX_MESSAGE)

  if (!name) return res.status(400).json({ error: 'Please enter your name.' })
  if (!EMAIL_REGEX.test(email)) return res.status(400).json({ error: 'Please enter a valid email.' })
  if (message.length < 10) {
    return res.status(400).json({
      error: 'Please write a bit more — at least a couple of sentences.',
    })
  }

  const resend = new Resend(apiKey)

  try {
    const subjectLine = subject
      ? `[Portfolio] ${subject}`
      : `[Portfolio] New message from ${name}`

    const plainText = [
      `From: ${name} <${email}>`,
      subject ? `Subject: ${subject}` : null,
      '',
      message,
    ]
      .filter((l) => l !== null)
      .join('\n')

    const htmlBody = `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#111;line-height:1.55;">
        <p style="margin:0 0 6px;color:#555;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;">Portfolio contact form</p>
        <h1 style="margin:0 0 16px;font-size:18px;">${escapeHtml(subject || 'New message')}</h1>
        <table style="border-collapse:collapse;margin-bottom:16px;">
          <tr>
            <td style="padding:4px 12px 4px 0;color:#555;">Name</td>
            <td style="padding:4px 0;">${escapeHtml(name)}</td>
          </tr>
          <tr>
            <td style="padding:4px 12px 4px 0;color:#555;">Email</td>
            <td style="padding:4px 0;"><a href="mailto:${escapeHtml(email)}" style="color:#FF5A36;">${escapeHtml(email)}</a></td>
          </tr>
        </table>
        <div style="white-space:pre-wrap;border-top:1px solid #e5e5e5;padding-top:16px;">${escapeHtml(message)}</div>
      </div>
    `

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: email,
      subject: subjectLine,
      html: htmlBody,
      text: plainText,
    })

    if (error) {
      console.error('Resend error:', error)
      return res.status(502).json({ error: 'Could not send your message. Please try again.' })
    }

    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('Unhandled contact error:', e)
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}
