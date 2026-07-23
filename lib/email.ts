import { Resend } from 'resend'

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured.')

  const from = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
  const resend = new Resend(apiKey)

  const { error } = await resend.emails.send({
    from,
    to,
    subject: 'Reset your admin password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="margin-bottom:8px">Reset your admin password</h2>
        <p style="color:#555;margin-bottom:24px">
          Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;
                  padding:12px 24px;border-radius:6px;font-weight:600">
          Reset Password
        </a>
        <p style="color:#999;font-size:12px;margin-top:24px">
          If you didn't request this, you can safely ignore this email.
          Your password will not change.
        </p>
        <p style="color:#bbb;font-size:11px;margin-top:8px;word-break:break-all">
          ${resetUrl}
        </p>
      </div>
    `,
  })

  if (error) throw new Error(error.message)
}

export async function sendFeatureRequestEmail(to: string, type: string, message: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured.')

  const from = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
  const resend = new Resend(apiKey)

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `New ${type} request`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="margin-bottom:4px">New ${type} request</h2>
        <p style="color:#888;font-size:12px;margin-top:0">Submitted from the admin portal</p>
        <p style="white-space:pre-wrap;background:#f5f5f5;border-radius:8px;padding:14px;color:#222">${
          message.replace(/</g, '&lt;')
        }</p>
      </div>
    `,
  })

  if (error) throw new Error(error.message)
}
