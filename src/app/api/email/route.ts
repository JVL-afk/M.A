import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { 
      to, 
      subject, 
      html, 
      text, 
      type = 'general' 
    } = await request.json()

    // Validate required fields
    if (!to || !subject) {
      return NextResponse.json(
        { success: false, error: 'Email address and subject are required' },
        { status: 400 }
      )
    }

    // Email templates based on type
    const getEmailContent = (type: string, customContent?: string) => {
      switch (type) {
        case 'welcome':
          return {
            subject: 'Welcome to AFFILIFY!',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #e53e3e;">Welcome to AFFILIFY!</h1>
                <p>Thank you for joining AFFILIFY, the AI-powered affiliate website generator.</p>
                <p>You can now start creating professional affiliate websites in seconds!</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                   style="background: #e53e3e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Get Started
                </a>
                <p>Best regards,<br>The AFFILIFY Team</p>
              </div>
            `
          }
        case 'payment_success':
          return {
            subject: 'Payment Successful - AFFILIFY',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #38a169;">Payment Successful!</h1>
                <p>Your payment has been processed successfully.</p>
                <p>You now have access to all premium features of AFFILIFY.</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                   style="background: #38a169; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Access Dashboard
                </a>
                <p>Best regards,<br>The AFFILIFY Team</p>
              </div>
            `
          }
        case 'password_reset':
          return {
            subject: 'Reset Your Password - AFFILIFY',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #e53e3e;">Reset Your Password</h1>
                <p>You requested to reset your password for your AFFILIFY account.</p>
                <p>Your reset code is: <strong style="font-size: 24px; color: #e53e3e;">${customContent}</strong></p>
                <p>This code will expire in 15 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <p>Best regards,<br>The AFFILIFY Team</p>
              </div>
            `
          }
        default:
          return {
            subject: subject,
            html: html || `<div style="font-family: Arial, sans-serif;">${text || 'No content provided'}</div>`
          }
      }
    }

    const emailContent = getEmailContent(type, html || text)

    // For development/demo purposes, we'll log the email instead of sending
    // In production, you would integrate with an email service like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Resend
    // - etc.

    console.log('📧 Email would be sent:', {
      to: to,
      subject: emailContent.subject,
      type: type,
      timestamp: new Date().toISOString()
    })

    // Simulate email service response
    const emailResult = {
      id: `email_${Date.now()}`,
      to: to,
      subject: emailContent.subject,
      type: type,
      status: 'sent',
      sentAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      data: emailResult
    })

  } catch (error) {
    console.error('Email sending error:', error)
    
    // Proper error type handling for TypeScript
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send email',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed. Use POST to send emails.',
      supportedTypes: ['welcome', 'payment_success', 'password_reset', 'general']
    },
    { status: 405 }
  )
}
