import { sendEmail } from '../config/emailConfig';

// Email templates
const getPasswordResetTemplate = (resetLink: string) => `
  <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
    <!-- Email Header -->
    <div style="background-color: #4F46E5; padding: 24px; text-align: center;">
      <h1 style="color: white; font-size: 24px; font-weight: 700; margin: 0;">Novo</h1>
    </div>
    
    <!-- Email Content -->
    <div style="padding: 32px;">
      <h2 style="color: #111827; font-size: 24px; font-weight: 700; margin-bottom: 16px;">Reset Your Password</h2>
      <p style="color: #4B5563; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
        You requested to reset your password for your Novo account. Click the button below to set a new password:
      </p>
      
      <!-- Reset Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetLink}" 
           style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                  font-size: 16px; font-weight: 600; text-decoration: none; 
                  border-radius: 8px; display: inline-block; transition: all 0.2s ease;
                  box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);">
          Reset Password
        </a>
      </div>
      
      <p style="color: #4B5563; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
        If you didn't request this password reset, please ignore this email or contact support if you have concerns.
      </p>
      
      <div style="border-top: 1px solid #E5E7EB; padding-top: 24px; margin-top: 24px;">
        <p style="color: #9CA3AF; font-size: 12px; line-height: 1.5; margin: 0;">
          For security reasons, this link will expire in 5 minutes.<br>
          This is an automated message - please do not reply directly to this email.
        </p>
      </div>
    </div>
    
    <!-- Email Footer -->
    <div style="background-color: #F9FAFB; padding: 16px; text-align: center;">
      <p style="color: #6B7280; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} Novo. All rights reserved.
      </p>
    </div>
  </div>
`;

const getVerificationTemplate = (verificationLink: string) => `
  <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
    <!-- Email Header -->
    <div style="background-color: #4F46E5; padding: 24px; text-align: center;">
      <h1 style="color: white; font-size: 24px; font-weight: 700; margin: 0;">Novo</h1>
    </div>
    
    <!-- Email Content -->
    <div style="padding: 32px;">
      <h2 style="color: #111827; font-size: 24px; font-weight: 700; margin-bottom: 16px;">Verify Your Email</h2>
      <p style="color: #4B5563; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
        Thank you for registering with Novo! Please verify your email address by clicking the button below:
      </p>
      
      <!-- Verification Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${verificationLink}" 
           style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                  font-size: 16px; font-weight: 600; text-decoration: none; 
                  border-radius: 8px; display: inline-block; transition: all 0.2s ease;
                  box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);">
          Verify Email
        </a>
      </div>
      
      <p style="color: #4B5563; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
        If you didn't create an account with Novo, please ignore this email.
      </p>
      
      <div style="border-top: 1px solid #E5E7EB; padding-top: 24px; margin-top: 24px;">
        <p style="color: #9CA3AF; font-size: 12px; line-height: 1.5; margin: 0;">
          For security reasons, this link will expire in 5 minutes.<br>
          This is an automated message - please do not reply directly to this email.
        </p>
      </div>
    </div>
    
    <!-- Email Footer -->
    <div style="background-color: #F9FAFB; padding: 16px; text-align: center;">
      <p style="color: #6B7280; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} Novo. All rights reserved.
      </p>
    </div>
  </div>
`;

// Email service functions
export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const subject = 'Reset Your Novo Password';
  const html = getPasswordResetTemplate(resetLink);

  return await sendEmail(email, subject, html);
};

export const sendVerificationEmail = async (email: string, verificationToken: string) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  const subject = 'Verify Your Novo Account';
  const html = getVerificationTemplate(verificationLink);

  return await sendEmail(email, subject, html);
};


export default {
  sendPasswordResetEmail
}; 