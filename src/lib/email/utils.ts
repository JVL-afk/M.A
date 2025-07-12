import nodemailer from 'nodemailer'

// Create reusable transporter
export const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  })
}

export interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
}

export async function sendEmail(options: EmailOptions) {
  const transporter = createEmailTransporter()

  const mailOptions = {
    from: options.from || process.env.EMAIL_FROM,
    to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  }

  try {
    const result = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error('Failed to send email')
  }
}

export function generateWelcomeEmail(data: { name: string; email: string }) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to AFFILIFY</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
        .content { padding: 40px 20px; background: #f9f9f9; }
        .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to AFFILIFY!</h1>
          <p>Your AI-powered affiliate marketing journey starts now</p>
        </div>
        <div class="content">
          <h2>Hi ${data.name}!</h2>
          <p>Thank you for joining AFFILIFY. You're now part of a community of successful affiliate marketers who are building profitable online businesses with AI.</p>

          <h3>What's Next?</h3>
          <ul>
            <li>Create your first affiliate website in under 5 minutes</li>
            <li>Customize your design and add your affiliate links</li>
            <li>Deploy to your custom domain</li>
            <li>Start earning commissions!</li>
          </ul>

          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Get Started</a>
          </div>

          <p>If you have any questions, our support team is here to help at support@affilify.eu</p>

          <p>Best regards,<br>The AFFILIFY Team</p>
        </div>
        <div class="footer">
          <p>© 2025 AFFILIFY. All rights reserved.</p>
          <p>You received this email because you signed up for AFFILIFY.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    Welcome to AFFILIFY!

    Hi ${data.name}!

    Thank you for joining AFFILIFY. You're now part of a community of successful affiliate marketers who are building profitable online businesses with AI.

    What's Next?
    - Create your first affiliate website in under 5 minutes
    - Customize your design and add your affiliate links
    - Deploy to your custom domain
    - Start earning commissions!

    Get started: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

    If you have any questions, our support team is here to help at support@affilify.eu

    Best regards,
    The AFFILIFY Team
  `

  return { html, text }
}

export function generatePaymentSuccessEmail(data: { name: string; plan: string; amount: number }) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Successful - AFFILIFY</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
        .content { padding: 40px 20px; background: #f9f9f9; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Successful!</h1>
        </div>
        <div class="content">
          <div class="success">
            <h2>✓ Your ${data.plan} subscription is now active!</h2>
            <p>Amount paid: $${(data.amount / 100).toFixed(2)}</p>
          </div>

          <h2>Thank you ${data.name}!</h2>
          <p>Your subscription has been activated and you now have access to all ${data.plan} plan features.</p>

          <p>You can manage your subscription and billing details in your account dashboard.</p>

          <p>Happy affiliate marketing!</p>
          <p>The AFFILIFY Team</p>
        </div>
        <div class="footer">
          <p>© 2025 AFFILIFY. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    Payment Successful!

    Hi ${data.name}!

    Your ${data.plan} subscription is now active!
    Amount paid: $${(data.amount / 100).toFixed(2)}

    You can manage your subscription and billing details in your account dashboard.

    Happy affiliate marketing!
    The AFFILIFY Team
  `

  return { html, text }
}

export function generatePasswordResetEmail(data: { name: string; resetToken: string }) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${data.resetToken}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your Password - AFFILIFY</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
        .content { padding: 40px 20px; background: #f9f9f9; }
        .button { display: inline-block; background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Your Password</h1>
        </div>
        <div class="content">
          <h2>Hi ${data.name}!</h2>
          <p>We received a request to reset your password for your AFFILIFY account.</p>

          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>

          <p>This link will expire in 1 hour for security reasons.</p>

          <p>If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.</p>

          <p>Best regards,<br>The AFFILIFY Team</p>
        </div>
        <div class="footer">
          <p>© 2025 AFFILIFY. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    Reset Your Password

    Hi ${data.name}!

    We received a request to reset your password for your AFFILIFY account.

    Reset your password: ${resetUrl}

    This link will expire in 1 hour for security reasons.

    If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.

    Best regards,
    The AFFILIFY Team
  `

  return { html, text }
}
