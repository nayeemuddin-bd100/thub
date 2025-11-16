import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@travelhub.com';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured. Email not sent:', options.to);
    return;
  }

  try {
    await sgMail.send({
      to: options.to,
      from: FROM_EMAIL,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    console.log(`Email sent successfully to ${options.to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

export async function sendAccountCredentialsEmail(
  email: string,
  firstName: string,
  role: string,
  temporaryPassword: string
): Promise<void> {
  const subject = 'Welcome to TravelHub - Your Account Credentials';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .credentials { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to TravelHub!</h1>
        </div>
        <div class="content">
          <p>Dear ${firstName},</p>
          
          <p>Your account has been created successfully. You have been assigned the role of <strong>${role.replace('_', ' ').toUpperCase()}</strong>.</p>
          
          <div class="credentials">
            <h3>Your Login Credentials</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
          </div>
          
          <p><strong>⚠️ Important Security Notice:</strong></p>
          <ul>
            <li>Please change your password immediately after your first login</li>
            <li>Do not share your credentials with anyone</li>
            <li>Keep this email in a secure location</li>
          </ul>
          
          <div style="text-align: center;">
            <a href="${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}/login` : 'https://travelhub.com/login'}" class="button">
              Login to Your Account
            </a>
          </div>
          
          <p>If you have any questions or need assistance, please contact our support team.</p>
          
          <p>Best regards,<br>The TravelHub Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} TravelHub. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Welcome to TravelHub!

Dear ${firstName},

Your account has been created successfully. You have been assigned the role of ${role.replace('_', ' ').toUpperCase()}.

Your Login Credentials:
Email: ${email}
Temporary Password: ${temporaryPassword}

IMPORTANT SECURITY NOTICE:
- Please change your password immediately after your first login
- Do not share your credentials with anyone
- Keep this email in a secure location

Login URL: ${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}/login` : 'https://travelhub.com/login'}

If you have any questions or need assistance, please contact our support team.

Best regards,
The TravelHub Team

---
This is an automated message. Please do not reply to this email.
© ${new Date().getFullYear()} TravelHub. All rights reserved.
  `;

  await sendEmail({
    to: email,
    subject,
    text,
    html,
  });
}
