import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function POST(request: NextRequest) {
  try {
    const { type, to, data } = await request.json()

    if (!type || !to) {
      return NextResponse.json(
        { success: false, error: 'Email type and recipient are required' },
        { status: 400 }
      )
    }

    let subject = ''
    let emailContent = ''

    // Generate email content based on type
    switch (type) {
      case 'welcome':
        subject = 'Welcome to AFFILIFY! 🎉'
        emailContent = generateWelcomeEmail(data)
        break
      
      case 'payment_success':
        subject = 'Payment Confirmed - AFFILIFY 💳'
        emailContent = generatePaymentSuccessEmail(data)
        break
      
      case 'subscription_canceled':
        subject = 'Subscription Canceled - AFFILIFY 😢'
        emailContent = generateCancellationEmail(data)
        break
      
      case 'password_reset':
        subject = 'Reset Your AFFILIFY Password 🔐'
        emailContent = generatePasswordResetEmail(data)
        break
      
      case 'password_changed':
        subject = 'Password Changed - AFFILIFY ✅'
        emailContent = generatePasswordChangedEmail(data)
        break
      
      case 'email_verification':
        subject = 'Verify Your AFFILIFY Account 📧'
        emailContent = generateEmailVerificationEmail(data)
        break
      
      case 'website_generated':
        subject = 'Your Affiliate Website is Ready! 🚀'
        emailContent = generateWebsiteReadyEmail(data)
        break
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid email type' },
          { status: 400 }
        )
    }

    // Send email
    const info = await transporter.sendMail({
      from: `"AFFILIFY" <${process.env.SMTP_USER}>`,
      to: to,
      subject: subject,
      html: emailContent,
    })

    console.log('Email sent:', info.messageId)

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      type: type
    })

  } catch (error: any) {
    console.error('Email error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send email',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

function generateWelcomeEmail(data: any) {
  const { name, planName } = data
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to AFFILIFY</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 30%, #9a3412 60%, #000000 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 32px;">Welcome to AFFILIFY!</h1>
        <p style="color: #fbbf24; margin: 10px 0 0 0; font-size: 18px;">Your gateway to affiliate marketing success</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Hi ${name || 'there'}! 👋</h2>
        
        <p>Welcome to AFFILIFY! We're thrilled to have you join our community of successful affiliate marketers.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
          <h3 style="margin-top: 0; color: #8b5cf6;">Your ${planName || 'Basic'} Plan is Active!</h3>
          <p>You now have access to all the tools you need to create amazing affiliate websites and start earning money online.</p>
        </div>
        
        <h3>🚀 What's Next?</h3>
        <ul style="padding-left: 20px;">
          <li><strong>Create Your First Website:</strong> Use our AI chatbot to generate your first affiliate website in minutes</li>
          <li><strong>Explore Templates:</strong> Browse our premium templates designed for maximum conversions</li>
          <li><strong>Track Performance:</strong> Monitor your website analytics and optimize for better results</li>
          <li><strong>Join Our Community:</strong> Connect with other affiliate marketers and share success stories</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
        
        <p>If you have any questions, our support team is here to help. Just reply to this email!</p>
        
        <p>Best regards,<br>
        <strong>The AFFILIFY Team</strong></p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="font-size: 12px; color: #666; text-align: center;">
          This email was sent to you because you signed up for AFFILIFY.<br>
          If you didn't sign up, please ignore this email.
        </p>
      </div>
    </body>
    </html>
  `
}

function generatePaymentSuccessEmail(data: any) {
  const { name, planName, amount, nextBillingDate } = data
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Confirmed - AFFILIFY</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 32px;">Payment Confirmed! ✅</h1>
        <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 18px;">Thank you for your subscription</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Hi ${name || 'there'}! 🎉</h2>
        
        <p>Your payment has been successfully processed and your ${planName} subscription is now active!</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #10b981;">
          <h3 style="margin-top: 0; color: #10b981;">Payment Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Plan:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${planName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Amount:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">$${amount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Next Billing:</strong></td>
              <td style="padding: 8px 0; text-align: right;">${nextBillingDate || 'N/A'}</td>
            </tr>
          </table>
        </div>
        
        <h3>🚀 You Now Have Access To:</h3>
        <ul style="padding-left: 20px;">
          <li>Unlimited affiliate website generation</li>
          <li>Premium templates and designs</li>
          <li>Advanced analytics and reporting</li>
          <li>Priority customer support</li>
          <li>AI chatbot integration</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Start Creating Websites
          </a>
        </div>
        
        <p>Thank you for choosing AFFILIFY. We're excited to help you succeed in affiliate marketing!</p>
        
        <p>Best regards,<br>
        <strong>The AFFILIFY Team</strong></p>
      </div>
    </body>
    </html>
  `
}

function generateCancellationEmail(data: any) {
  const { name, planName, endDate } = data
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Subscription Canceled - AFFILIFY</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 32px;">We'll Miss You! 😢</h1>
        <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 18px;">Your subscription has been canceled</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Hi ${name || 'there'},</h2>
        
        <p>We're sorry to see you go! Your ${planName} subscription has been successfully canceled.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <h3 style="margin-top: 0; color: #ef4444;">Important Information</h3>
          <p>Your subscription will remain active until <strong>${endDate || 'the end of your billing period'}</strong>. You can continue using all features until then.</p>
        </div>
        
        <h3>💡 Before You Go...</h3>
        <p>We'd love to know why you're leaving. Your feedback helps us improve AFFILIFY for everyone:</p>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/feedback" style="background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Share Feedback
          </a>
        </div>
        
        <h3>🔄 Want to Come Back?</h3>
        <p>You can reactivate your subscription anytime. All your websites and data will be waiting for you!</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/pricing" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Reactivate Subscription
          </a>
        </div>
        
        <p>Thank you for being part of the AFFILIFY community. We hope to see you again soon!</p>
        
        <p>Best regards,<br>
        <strong>The AFFILIFY Team</strong></p>
      </div>
    </body>
    </html>
  `
}

function generatePasswordResetEmail(data: any) {
  const { name, resetLink } = data
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - AFFILIFY</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 32px;">Reset Your Password 🔐</h1>
        <p style="color: #bfdbfe; margin: 10px 0 0 0; font-size: 18px;">Secure your AFFILIFY account</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Hi ${name || 'there'},</h2>
        
        <p>We received a request to reset your AFFILIFY password. If you didn't make this request, you can safely ignore this email.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <h3 style="margin-top: 0; color: #3b82f6;">Reset Your Password</h3>
          <p>Click the button below to reset your password. This link will expire in 1 hour for security reasons.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${resetLink}" style="color: #3b82f6; word-break: break-all;">${resetLink}</a>
        </p>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e;"><strong>Security Tip:</strong> Never share your password with anyone. AFFILIFY will never ask for your password via email.</p>
        </div>
        
        <p>Best regards,<br>
        <strong>The AFFILIFY Team</strong></p>
      </div>
    </body>
    </html>
  `
}

function generatePasswordChangedEmail(data: any) {
  const { name, timestamp } = data
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Changed - AFFILIFY</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 32px;">Password Changed ✅</h1>
        <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 18px;">Your account is secure</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Hi ${name || 'there'}! 🔐</h2>
        
        <p>Your AFFILIFY account password has been successfully changed.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h3 style="margin-top: 0; color: #10b981;">Change Details</h3>
          <p><strong>Time:</strong> ${timestamp || new Date().toLocaleString()}</p>
          <p><strong>Account:</strong> Your AFFILIFY account</p>
          <p><strong>Status:</strong> Password successfully updated</p>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e;"><strong>Security Notice:</strong> If you didn't make this change, please contact our support team immediately.</p>
        </div>
        
        <h3>🛡️ Security Tips:</h3>
        <ul style="padding-left: 20px;">
          <li>Use a strong, unique password for your AFFILIFY account</li>
          <li>Never share your password with anyone</li>
          <li>Log out of shared or public computers</li>
          <li>Contact support if you notice any suspicious activity</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/login" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Sign In to Your Account
          </a>
        </div>
        
        <p>If you have any questions about your account security, our support team is here to help.</p>
        
        <p>Best regards,<br>
        <strong>The AFFILIFY Security Team</strong></p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="font-size: 12px; color: #666; text-align: center;">
          This is an automated security notification from AFFILIFY.<br>
          If you didn't request this change, please contact support immediately.
        </p>
      </div>
    </body>
    </html>
  `
}

function generateEmailVerificationEmail(data: any) {
  const { name, verificationCode } = data
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - AFFILIFY</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 32px;">Verify Your Email 📧</h1>
        <p style="color: #e9d5ff; margin: 10px 0 0 0; font-size: 18px;">Welcome to AFFILIFY!</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Hi ${name || 'there'}! 🎉</h2>
        
        <p>Thank you for signing up for AFFILIFY! To complete your registration, please verify your email address using the code below:</p>
        
        <div style="background: white; padding: 30px; border-radius: 8px; margin: 20px 0; border: 2px solid #8b5cf6; text-align: center;">
          <h3 style="margin-top: 0; color: #8b5cf6;">Your Verification Code</h3>
          <div style="font-size: 36px; font-weight: bold; color: #333; letter-spacing: 8px; font-family: monospace; background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
            ${verificationCode}
          </div>
          <p style="color: #666; font-size: 14px; margin: 0;">This code expires in 10 minutes</p>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e;"><strong>Security Note:</strong> If you didn't create an AFFILIFY account, please ignore this email.</p>
        </div>
        
        <h3>🚀 What's Next?</h3>
        <ol style="padding-left: 20px;">
          <li>Enter the verification code on the AFFILIFY website</li>
          <li>Complete your account setup</li>
          <li>Start creating amazing affiliate websites</li>
          <li>Begin your journey to affiliate marketing success!</li>
        </ol>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Verify Email Now
          </a>
        </div>
        
        <p>Welcome to the AFFILIFY family! We're excited to help you succeed in affiliate marketing.</p>
        
        <p>Best regards,<br>
        <strong>The AFFILIFY Team</strong></p>
      </div>
    </body>
    </html>
  `
}

function generateWebsiteReadyEmail(data: any) {
  const { name, websiteName, websiteUrl, previewImage } = data
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Website is Ready - AFFILIFY</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 32px;">Your Website is Ready! 🚀</h1>
        <p style="color: #e9d5ff; margin: 10px 0 0 0; font-size: 18px;">Time to start earning money</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Congratulations ${name || 'there'}! 🎉</h2>
        
        <p>Your affiliate website "<strong>${websiteName}</strong>" has been successfully generated and is ready to start making you money!</p>
        
        ${previewImage ? `
        <div style="text-align: center; margin: 20px 0;">
          <img src="${previewImage}" alt="Website Preview" style="max-width: 100%; height: auto; border-radius: 8px; border: 2px solid #e5e7eb;">
        </div>
        ` : ''}
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
          <h3 style="margin-top: 0; color: #8b5cf6;">Website Details</h3>
          <p><strong>Website Name:</strong> ${websiteName}</p>
          <p><strong>URL:</strong> <a href="${websiteUrl}" style="color: #8b5cf6;">${websiteUrl}</a></p>
          <p><strong>Status:</strong> Live and Ready</p>
        </div>
        
        <h3>🎯 Next Steps to Maximize Earnings:</h3>
        <ol style="padding-left: 20px;">
          <li><strong>Review Your Website:</strong> Check all content and make any necessary adjustments</li>
          <li><strong>Add Affiliate Links:</strong> Insert your affiliate tracking codes and links</li>
          <li><strong>Optimize for SEO:</strong> Use our built-in SEO tools to improve search rankings</li>
          <li><strong>Share and Promote:</strong> Start driving traffic to your new website</li>
          <li><strong>Monitor Performance:</strong> Track clicks, conversions, and earnings in your dashboard</li>
        </ol>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${websiteUrl}" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-right: 10px;">
            View Website
          </a>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" style="background: #6b7280; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
        
        <p>Ready to create more websites? Our AI is standing by to help you build your affiliate empire!</p>
        
        <p>Best regards,<br>
        <strong>The AFFILIFY Team</strong></p>
      </div>
    </body>
    </html>
  `
}

