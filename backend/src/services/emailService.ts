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

const getProjectInviteNewUserTemplate = (inviterName: string, inviterEmail: string, projectName: string, registerLink: string) => `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <!-- Email Header -->
        <div style="background-color: #4F46E5; padding: 24px; text-align: center;">
          <h1 style="color: white; font-size: 24px; font-weight: 700; margin: 0;">Novo Project Invitation</h1>
        </div>
        
        <!-- Email Content -->
        <div style="padding: 32px;">
          <h2 style="color: #111827; font-size: 24px; font-weight: 700; margin-bottom: 16px;">You've Been Invited to Join a Project</h2>
          
          <!-- Highlighted Inviter Section -->
          <div style="background-color: #F5F3FF; border-left: 4px solid #4F46E5; border-radius: 4px; padding: 16px; margin-bottom: 24px;">
            <p style="color: #4B5563; font-size: 16px; line-height: 1.5; margin: 0 0 8px 0;">
              <span style="font-weight: 600; color: #4F46E5;">Invited by:</span>
            </p>
            <p style="font-size: 18px; font-weight: 600; color: #111827; margin: 0;">
              ${inviterName} <span style="font-weight: 400; color: #6B7280;">(${inviterEmail})</span>
            </p>
          </div>
          
          <p style="color: #4B5563; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
            You're invited to collaborate on the project: <strong>${projectName}</strong>
          </p>
          
          <div style="background-color: #F9FAFB; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <h3 style="color: #111827; font-size: 18px; font-weight: 600; margin-top: 0; margin-bottom: 12px;">To accept this invitation:</h3>
            <ol style="color: #4B5563; font-size: 16px; line-height: 1.5; padding-left: 20px; margin: 0;">
              <li style="margin-bottom: 8px;"><strong>Complete your registration</strong> - Set up your account to access the project</li>
              <li style="margin-bottom: 8px;"><strong>Verify your email</strong> - If you choose email registration, check your inbox after signing up</li>
              <li><strong>Access granted automatically</strong> - You'll join the project immediately after verification</li>
            </ol>
          </div>
          
          <!-- Action Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${registerLink}" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                      font-size: 16px; font-weight: 600; text-decoration: none; 
                      border-radius: 8px; display: inline-block; transition: all 0.2s ease;
                      box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);">
              Set Up Your Account
            </a>
          </div>
          
          <p style="color: #4B5563; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
            If you didn't expect this invitation, you can ignore this email or contact ${inviterName} at ${inviterEmail}.
          </p>
          
          <div style="border-top: 1px solid #E5E7EB; padding-top: 24px; margin-top: 24px;">
            <p style="color: #9CA3AF; font-size: 12px; line-height: 1.5; margin: 0;">
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

const getProjectInviteExistingUserTemplate = (inviterName: string, inviterEmail: string, projectName: string, projectLink: string) => `
  <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
    <!-- Email Header -->
    <div style="background-color: #4F46E5; padding: 24px; text-align: center;">
      <h1 style="color: white; font-size: 24px; font-weight: 700; margin: 0;">Novo Project Invitation</h1>
    </div>
    
    <!-- Email Content -->
    <div style="padding: 32px;">
      <h2 style="color: #111827; font-size: 24px; font-weight: 700; margin-bottom: 16px;">You've Been Added to a Project</h2>
      <p style="color: #4B5563; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
        ${inviterName} (${inviterEmail}) has added you to the project <strong>${projectName}</strong> on Novo.
      </p>
      <p style="color: #4B5563; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
        You can now access this project and start collaborating with your team.
      </p>
      
      <!-- Action Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${projectLink}" 
           style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                  font-size: 16px; font-weight: 600; text-decoration: none; 
                  border-radius: 8px; display: inline-block; transition: all 0.2s ease;
                  box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);">
          Open Project
        </a>
      </div>
      
      <p style="color: #4B5563; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
        If you didn't expect to be added to this project, please contact ${inviterName} at ${inviterEmail}.
      </p>
      
      <div style="border-top: 1px solid #E5E7EB; padding-top: 24px; margin-top: 24px;">
        <p style="color: #9CA3AF; font-size: 12px; line-height: 1.5; margin: 0;">
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

const getWelcomeTemplate = (userName: string) => `
  <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
    <!-- Email Header -->
    <div style="background-color: #4F46E5; padding: 24px; text-align: center;">
      <h1 style="color: white; font-size: 24px; font-weight: 700; margin: 0;">Welcome to Novo</h1>
    </div>
    
    <!-- Email Content -->
    <div style="padding: 32px;">
      <h2 style="color: #111827; font-size: 24px; font-weight: 700; margin-bottom: 16px;">Welcome aboard, ${userName}!</h2>
      <p style="color: #4B5563; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
        Thank you for joining Novo. Your account is now fully verified and ready to use.
      </p>
      
      <!-- Highlighted Features -->
      <div style="background-color: #F9FAFB; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <h3 style="color: #111827; font-size: 18px; font-weight: 600; margin-top: 0; margin-bottom: 12px;">Get started with Novo:</h3>
        <ul style="color: #4B5563; font-size: 16px; line-height: 1.5; padding-left: 20px; margin: 0;">
          <li style="margin-bottom: 8px;"><strong>Create your first project</strong> - Organize your work in one place</li>
          <li style="margin-bottom: 8px;"><strong>Invite team members</strong> - Collaborate with your colleagues</li>
          <li><strong>Explore features</strong> - Discover all that Novo has to offer</li>
        </ul>
      </div>
      
      <!-- Action Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${process.env.FRONTEND_URL}" 
           style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                  font-size: 16px; font-weight: 600; text-decoration: none; 
                  border-radius: 8px; display: inline-block; transition: all 0.2s ease;
                  box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);">
          Go to Dashboard
        </a>
      </div>
      
      <div style="border-top: 1px solid #E5E7EB; padding-top: 24px; margin-top: 24px;">
        <p style="color: #9CA3AF; font-size: 12px; line-height: 1.5; margin: 0;">
          Need help getting started? Check out our <a href="${process.env.FRONTEND_URL}/help" style="color: #4F46E5; text-decoration: none;">help center</a>.<br>
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

export const sendProjectInviteNewUserEmail = async (email: string, inviterName: string, projectName: string, inviterEmail: string) => {
  const loginLink = `${process.env.FRONTEND_URL}/register`;
  const subject = `You've Been Invited to Join ${projectName} on Novo`;
  const html = getProjectInviteNewUserTemplate(inviterName, inviterEmail, projectName, loginLink);

  return await sendEmail(email, subject, html);
};

export const sendProjectInviteExistingUserEmail = async (email: string, inviterName: string, projectName: string, projectId: string, inviterEmail: string) => {
  const projectLink = `${process.env.FRONTEND_URL}/projects/${projectId}`;
  const subject = `You've Been Added to ${projectName} on Novo`;
  const html = getProjectInviteExistingUserTemplate(inviterName, inviterEmail, projectName, projectLink);

  return await sendEmail(email, subject, html);
};

export const sendWelcomeEmail = async (email: string, userName: string) => {
  const subject = `Welcome to Novo, ${userName}!`;
  const html = getWelcomeTemplate(userName);
  return await sendEmail(email, subject, html);
};