import nodemailer from 'nodemailer';
import config from '../config';

// Create a test account if no email config is provided
let transporter: nodemailer.Transporter;

async function createTransporter() {
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
    // Create test SMTP service account for development
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } else {
    // Use Gmail SMTP for production
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD, // Use App Password for Gmail
      },
    });
  }
}

export async function sendEmail(to: string, subject: string, html: string) {
  if (!transporter) {
    await createTransporter();
  }

  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@schoolmanagement.com',
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
      // Log preview URL in development when using ethereal email
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export function generatePasswordResetEmail(resetToken: string, schoolName: string) {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  return `
    <h1>Password Reset Request</h1>
    <p>Hello,</p>
    <p>You have requested to reset your password for your account at ${schoolName}.</p>
    <p>Please click the link below to reset your password. This link will expire in 1 hour.</p>
    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>If you did not request this password reset, please ignore this email.</p>
    <p>Best regards,<br>${schoolName} Team</p>
  `;
}
