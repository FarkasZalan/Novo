import { sendEmail } from '../config/emailConfig';
import { format } from 'date-fns';

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

const getTaskCommentTemplate = (
  commenterName: string,
  commenterEmail: string,
  taskName: string,
  projectName: string,
  commentContent: string,
  taskLink: string
) => `
  <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
    <!-- Email Header -->
    <div style="background-color: #4F46E5; padding: 24px; text-align: center;">
      <h1 style="color: white; font-size: 24px; font-weight: 700; margin: 0;">New Comment on Task</h1>
    </div>
    
    <!-- Email Content -->
    <div style="padding: 32px;">
      <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-bottom: 16px;">
        ${commenterName} commented on "${taskName}" in ${projectName}
      </h2>
      
      <!-- Commenter Info with Table-based Layout -->
      <table cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 16px;">
        <tr>
          <!-- Avatar cell -->
          <td width="40" height="40" align="center" valign="middle"
              style="
                background-color: #e0e7ff;
                border-radius: 50%;
                font-size: 16px;
                font-weight: 600;
                color: #4F46E5;
              ">
            ${getUserInitials(commenterName)}
          </td>
          <!-- Name + email cell -->
          <td style="padding-left: 12px; vertical-align: middle;">
            <p style="margin: 0; font-weight: 600; color: #111827;">${commenterName}</p>
            <p style="margin: 0; font-size: 14px; color: #6B7280;">${commenterEmail}</p>
          </td>
        </tr>
      </table>
      
      <!-- Comment Content -->
      <div style="background-color: #F9FAFB; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="color: #4B5563; font-size: 16px; line-height: 1.5; margin: 0; white-space: pre-wrap;">${commentContent}</p>
      </div>
      
      <!-- Action Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${taskLink}" 
           style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                  font-size: 16px; font-weight: 600; text-decoration: none; 
                  border-radius: 8px; display: inline-block; transition: all 0.2s ease;
                  box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);">
          View Task
        </a>
      </div>
      
      <div style="border-top: 1px solid #E5E7EB; padding-top: 24px; margin-top: 24px;">
        <p style="color: #9CA3AF; font-size: 12px; line-height: 1.5; margin: 0;">
          You're receiving this notification because you're involved with this task.<br>
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

const getUpdatedTaskCommentTemplate = (
  commenterName: string,
  commenterEmail: string,
  taskName: string,
  projectName: string,
  oldCommentContent: string,
  newCommentContent: string,
  taskLink: string,
  updatedAt: string
) => {
  // Simple diff visualization (for more sophisticated diff, consider a library)
  const renderDiff = (oldText: string, newText: string) => {
    if (oldText === newText) return newText;

    // This is a simple implementation - consider using a proper diff algorithm for production
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');

    let diffHtml = '';

    // Compare line by line
    for (let i = 0; i < Math.max(oldLines.length, newLines.length); i++) {
      const oldLine = oldLines[i] || '';
      const newLine = newLines[i] || '';

      if (oldLine !== newLine) {
        diffHtml += `<div style="margin-bottom: 8px;">
          <div style="color: #EF4444; text-decoration: line-through; background-color: #FEE2E2; padding: 4px 8px; border-radius: 4px; margin-bottom: 2px;">${oldLine}</div>
          <div style="color: #10B981; background-color: #D1FAE5; padding: 4px 8px; border-radius: 4px;">${newLine}</div>
        </div>`;
      } else {
        diffHtml += `<div style="color: #4B5563; padding: 4px 8px; margin-bottom: 8px;">${newLine}</div>`;
      }
    }

    return diffHtml || newText;
  };

  return `
  <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
    <!-- Email Header -->
    <div style="background-color: #4F46E5; padding: 24px; text-align: center;">
      <h1 style="color: white; font-size: 24px; font-weight: 700; margin: 0;">Comment Updated on Task</h1>
    </div>
    
    <!-- Email Content -->
    <div style="padding: 32px;">
      <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-bottom: 16px;">
        ${commenterName} updated their comment on "${taskName}" in ${projectName}
      </h2>
      
      <!-- Updated timestamp -->
      <p style="color: #6B7280; font-size: 14px; margin-bottom: 16px;">
        Updated at: ${format(new Date(updatedAt), 'MMM d, yyyy H:mm')}}
      </p>
      
      <!-- Commenter Info -->
      <table cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 16px;">
        <tr>
          <td width="40" height="40" align="center" valign="middle"
              style="background-color: #e0e7ff; border-radius: 50%; font-size: 16px; font-weight: 600; color: #4F46E5;">
            ${getUserInitials(commenterName)}
          </td>
          <td style="padding-left: 12px; vertical-align: middle;">
            <p style="margin: 0; font-weight: 600; color: #111827;">${commenterName}</p>
            <p style="margin: 0; font-size: 14px; color: #6B7280;">${commenterEmail}</p>
          </td>
        </tr>
      </table>
      
      <!-- Previous Comment -->
      <div style="margin-bottom: 24px;">
        <h3 style="color: #6B7280; font-size: 14px; font-weight: 600; margin-bottom: 8px;">PREVIOUS COMMENT</h3>
        <div style="background-color: #F9FAFB; border-radius: 8px; padding: 16px;">
          <p style="color: #4B5563; font-size: 16px; line-height: 1.5; margin: 0; white-space: pre-wrap;">${oldCommentContent}</p>
        </div>
      </div>
      
      <!-- Updated Comment -->
      <div style="margin-bottom: 24px;">
        <h3 style="color: #6B7280; font-size: 14px; font-weight: 600; margin-bottom: 8px;">UPDATED COMMENT</h3>
        <div style="background-color: #F9FAFB; border-radius: 8px; padding: 16px;">
          <p style="color: #4B5563; font-size: 16px; line-height: 1.5; margin: 0; white-space: pre-wrap;">${newCommentContent}</p>
        </div>
      </div>
      
      <!-- Changes Highlight -->
      <div style="margin-bottom: 24px;">
        <h3 style="color: #6B7280; font-size: 14px; font-weight: 600; margin-bottom: 8px;">CHANGES</h3>
        <div style="background-color: #F9FAFB; border-radius: 8px; padding: 16px;">
          ${renderDiff(oldCommentContent, newCommentContent)}
        </div>
      </div>
      
      <!-- Action Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${taskLink}" 
           style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                  font-size: 16px; font-weight: 600; text-decoration: none; 
                  border-radius: 8px; display: inline-block; transition: all 0.2s ease;
                  box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);">
          View Task
        </a>
      </div>
      
      <div style="border-top: 1px solid #E5E7EB; padding-top: 24px; margin-top: 24px;">
        <p style="color: #9CA3AF; font-size: 12px; line-height: 1.5; margin: 0;">
          You're receiving this notification because you're involved with this task.<br>
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
};

const getTaskStatusChangeTemplate = (
  changerName: string,
  changerEmail: string,
  taskName: string,
  projectName: string,
  oldStatus: string,
  newStatus: string,
  taskLink: string
) => `
  <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
    <!-- Email Header -->
    <div style="background-color: #4F46E5; padding: 24px; text-align: center;">
      <h1 style="color: white; font-size: 24px; font-weight: 700; margin: 0;">Task Status Updated</h1>
    </div>
    
    <!-- Email Content -->
    <div style="padding: 32px;">
      <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-bottom: 16px;">
        ${changerName} updated the status of "${taskName}" in ${projectName}
      </h2>
      
      <!-- Changer Info -->
      <table cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 16px;">
        <tr>
          <td width="40" height="40" align="center" valign="middle"
              style="
                background-color: #e0e7ff;
                border-radius: 50%;
                font-size: 16px;
                font-weight: 600;
                color: #4F46E5;
              ">
            ${getUserInitials(changerName)}
          </td>
          <td style="padding-left: 12px; vertical-align: middle;">
            <p style="margin: 0; font-weight: 600; color: #111827;">${changerName}</p>
            <p style="margin: 0; font-size: 14px; color: #6B7280;">${changerEmail}</p>
          </td>
        </tr>
      </table>
      
      <!-- Status Change Highlight -->
      <div style="background-color: #F5F3FF; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td width="50%" style="padding-right: 8px;">
              <p style="color: #6B7280; font-size: 14px; margin: 0 0 4px 0;">Previous Status</p>
              <div style="background-color: #E5E7EB; border-radius: 4px; padding: 8px 12px;">
                <p style="color: #4B5563; font-weight: 600; margin: 0;">${oldStatus}</p>
              </div>
            </td>
            <td width="50%" style="padding-left: 8px;">
              <p style="color: #6B7280; font-size: 14px; margin: 0 0 4px 0;">New Status</p>
              <div style="background-color: #E0E7FF; border-radius: 4px; padding: 8px 12px;">
                <p style="color: #4F46E5; font-weight: 600; margin: 0;">${newStatus}</p>
              </div>
            </td>
          </tr>
        </table>
      </div>
      
      <!-- Action Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${taskLink}" 
           style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                  font-size: 16px; font-weight: 600; text-decoration: none; 
                  border-radius: 8px; display: inline-block; transition: all 0.2s ease;
                  box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);">
          View Task
        </a>
      </div>
      
      <div style="border-top: 1px solid #E5E7EB; padding-top: 24px; margin-top: 24px;">
        <p style="color: #9CA3AF; font-size: 12px; line-height: 1.5; margin: 0;">
          You're receiving this notification because you're involved with this task.<br>
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

const getTaskAssignmentTemplate = (
  assignerName: string,
  assignerEmail: string,
  taskName: string,
  projectName: string,
  taskLink: string,
  dueDate?: string
) => `
  <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
    <!-- Email Header -->
    <div style="background-color: #4F46E5; padding: 24px; text-align: center;">
      <h1 style="color: white; font-size: 24px; font-weight: 700; margin: 0;">You've Been Assigned a Task</h1>
    </div>
    
    <!-- Email Content -->
    <div style="padding: 32px;">
      <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-bottom: 16px;">
        ${assignerName} assigned you to "${taskName}" in ${projectName}
      </h2>
      
      <!-- Assigner Info -->
      <table cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 16px;">
        <tr>
          <td width="40" height="40" align="center" valign="middle"
              style="background-color: #e0e7ff; border-radius: 50%; font-size: 16px; font-weight: 600; color: #4F46E5;">
            ${getUserInitials(assignerName)}
          </td>
          <td style="padding-left: 12px; vertical-align: middle;">
            <p style="margin: 0; font-weight: 600; color: #111827;">${assignerName}</p>
            <p style="margin: 0; font-size: 14px; color: #6B7280;">${assignerEmail}</p>
          </td>
        </tr>
      </table>
      
      <!-- Task Details -->
      <div style="background-color: #F9FAFB; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding-bottom: 8px;">
              <p style="color: #6B7280; font-size: 14px; margin: 0 0 4px 0;">Task</p>
              <p style="color: #111827; font-weight: 600; margin: 0;">${taskName}</p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 8px;">
              <p style="color: #6B7280; font-size: 14px; margin: 0 0 4px 0;">Project</p>
              <p style="color: #111827; font-weight: 600; margin: 0;">${projectName}</p>
            </td>
          </tr>
          ${dueDate ? `
            <tr>
              <td>
                <p style="color: #6B7280; font-size: 14px; margin: 0 0 4px 0;">Due Date</p>
                <p style="color: #111827; font-weight: 600; margin: 0;">${format(new Date(dueDate), 'MMM d')}</p>
              </td>
            </tr>
          ` : ''}
        </table>
      </div>
      
      <!-- Action Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${taskLink}" 
           style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                  font-size: 16px; font-weight: 600; text-decoration: none; 
                  border-radius: 8px; display: inline-block; transition: all 0.2s ease;
                  box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);">
          View Task
        </a>
      </div>
      
      <div style="border-top: 1px solid #E5E7EB; padding-top: 24px; margin-top: 24px;">
        <p style="color: #9CA3AF; font-size: 12px; line-height: 1.5; margin: 0;">
          You're receiving this notification because you were assigned to this task.<br>
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

const getTaskDueSoonTemplate = (
  taskName: string,
  projectName: string,
  dueDate: string,
  taskLink: string,
  isToday: boolean
) => `
  <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
    <!-- Email Header -->
    <div style="background-color: ${isToday ? '#DC2626' : '#F59E0B'}; padding: 24px; text-align: center;">
      <h1 style="color: white; font-size: 24px; font-weight: 700; margin: 0;">
        ${isToday ? 'Task Due Today!' : 'Task Due Tomorrow!'}
      </h1>
    </div>
    
    <!-- Email Content -->
    <div style="padding: 32px;">
      <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-bottom: 16px;">
        "${taskName}" in ${projectName} is due ${isToday ? 'today' : 'tomorrow'}
      </h2>
      
      <!-- Task Details -->
      <div style="background-color: #F9FAFB; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding-bottom: 8px;">
              <p style="color: #6B7280; font-size: 14px; margin: 0 0 4px 0;">Task</p>
              <p style="color: #111827; font-weight: 600; margin: 0;">${taskName}</p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 8px;">
              <p style="color: #6B7280; font-size: 14px; margin: 0 0 4px 0;">Project</p>
              <p style="color: #111827; font-weight: 600; margin: 0;">${projectName}</p>
            </td>
          </tr>
          <tr>
            <td>
              <p style="color: #6B7280; font-size: 14px; margin: 0 0 4px 0;">Due Date</p>
              <p style="color: ${isToday ? '#DC2626' : '#F59E0B'}; font-weight: 600; margin: 0;">
                ${dueDate} ${isToday ? '(Today)' : '(Tomorrow)'}
              </p>
            </td>
          </tr>
        </table>
      </div>
      
      <!-- Action Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${taskLink}" 
           style="background-color: ${isToday ? '#DC2626' : '#F59E0B'}; color: white; padding: 12px 24px; 
                  font-size: 16px; font-weight: 600; text-decoration: none; 
                  border-radius: 8px; display: inline-block; transition: all 0.2s ease;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          View Task
        </a>
      </div>
      
      <div style="border-top: 1px solid #E5E7EB; padding-top: 24px; margin-top: 24px;">
        <p style="color: #9CA3AF; font-size: 12px; line-height: 1.5; margin: 0;">
          You're receiving this notification because you're assigned to this task.<br>
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

const getMilestoneDueSoonTemplate = (
  milestoneName: string,
  projectName: string,
  dueDate: string,
  milestoneLink: string,
  isToday: boolean,
  progressPercentage: number,
  completedTasks: number,
  totalTasks: number
) => `
  <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
    <!-- Email Header -->
    <div style="background-color: ${isToday ? '#DC2626' : '#F59E0B'}; padding: 24px; text-align: center;">
      <h1 style="color: white; font-size: 24px; font-weight: 700; margin: 0;">
        ${isToday ? 'Milestone Due Today!' : 'Milestone Due Soon!'}
      </h1>
    </div>
    
    <!-- Email Content -->
    <div style="padding: 32px;">
      <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-bottom: 16px;">
        "${milestoneName}" in ${projectName} is due ${isToday ? 'today' : 'soon'}
      </h2>
      
      <!-- Progress Bar -->
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-size: 14px; margin-right: 8px; color: #4B5563;">Progress:</span>
          <span style="font-size: 14px; font-weight: 600; color: ${progressPercentage >= 100 ? '#10B981' : '#4B5563'}">
            ${progressPercentage}% Complete
          </span>
        </div>
        <div style="height: 8px; background-color: #E5E7EB; border-radius: 4px; overflow: hidden;">
          <div style="width: ${Math.min(progressPercentage, 100)}%; height: 100%; background-color: ${progressPercentage >= 100 ? '#10B981' : (isToday ? '#DC2626' : '#F59E0B')};"></div>
        </div>
        <div style="text-align: center; margin-top: 4px; font-size: 12px; color: #6B7280;">
          ${completedTasks} of ${totalTasks} tasks completed
        </div>
      </div>
      
      <!-- Milestone Details -->
      <div style="background-color: #F9FAFB; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding-bottom: 8px;">
              <p style="color: #6B7280; font-size: 14px; margin: 0 0 4px 0;">Milestone</p>
              <p style="color: #111827; font-weight: 600; margin: 0;">${milestoneName}</p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 8px;">
              <p style="color: #6B7280; font-size: 14px; margin: 0 0 4px 0;">Project</p>
              <p style="color: #111827; font-weight: 600; margin: 0;">${projectName}</p>
            </td>
          </tr>
          <tr>
            <td>
              <p style="color: #6B7280; font-size: 14px; margin: 0 0 4px 0;">Due Date</p>
              <p style="color: ${isToday ? '#DC2626' : '#F59E0B'}; font-weight: 600; margin: 0;">
                ${dueDate} ${isToday ? '(Today)' : ''}
              </p>
            </td>
          </tr>
        </table>
      </div>
      
      <!-- Action Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${milestoneLink}" 
           style="background-color: ${isToday ? '#DC2626' : '#F59E0B'}; color: white; padding: 12px 24px; 
                  font-size: 16px; font-weight: 600; text-decoration: none; 
                  border-radius: 8px; display: inline-block; transition: all 0.2s ease;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          View Milestone
        </a>
      </div>
      
      <div style="border-top: 1px solid #E5E7EB; padding-top: 24px; margin-top: 24px;">
        <p style="color: #9CA3AF; font-size: 12px; line-height: 1.5; margin: 0;">
          You're receiving this notification because you're a member of this project.<br>
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

const getPremiumActivationTemplate = (userName: string) => `
  <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
    <!-- Email Header -->
    <div style="background-color: #4F46E5; padding: 24px; text-align: center;">
      <h1 style="color: white; font-size: 24px; font-weight: 700; margin: 0;">Premium Plan Activated</h1>
    </div>
    
    <!-- Email Content -->
    <div style="padding: 32px;">
      <h2 style="color: #111827; font-size: 24px; font-weight: 700; margin-bottom: 16px;">Welcome to Novo Premium, ${userName}!</h2>
      <p style="color: #4B5563; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
        Thank you for upgrading to Novo Premium! Your subscription is now active and you have full access to all premium features.
      </p>
      
      <!-- Premium Benefits -->
      <div style="background-color: #EEF2FF; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <h3 style="color: #111827; font-size: 18px; font-weight: 600; margin-top: 0; margin-bottom: 12px;">Your Premium Benefits:</h3>
        <ul style="color: #4B5563; font-size: 16px; line-height: 1.5; padding-left: 20px; margin: 0;">
          <li style="margin-bottom: 8px;"><strong>Unlimited team members</strong> - Add as many collaborators as you need to each project</li>
          <li style="margin-bottom: 8px;"><strong>Project branding</strong> - Customize projects with your own logos</li>
          <li style="margin-bottom: 8px;"><strong>Priority support</strong> - Get faster responses from our support team</li>
          <li><strong>Premium features</strong> - Access to all current and future premium capabilities</li>
        </ul>
      </div>
      
      <!-- Action Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${process.env.FRONTEND_URL}/dashboard" 
           style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                  font-size: 16px; font-weight: 600; text-decoration: none; 
                  border-radius: 8px; display: inline-block; transition: all 0.2s ease;
                  box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);">
          Start Using Premium Features
        </a>
      </div>
      
      <div style="border-top: 1px solid #E5E7EB; padding-top: 24px; margin-top: 24px;">
        <p style="color: #9CA3AF; font-size: 12px; line-height: 1.5; margin: 0;">
          Need help with your premium account? Contact our <a href="${process.env.FRONTEND_URL}/contact" style="color: #4F46E5; text-decoration: none;">support team</a>.<br>
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

const getPremiumCancellationTemplate = (userName: string) => `
  <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
    <!-- Email Header -->
    <div style="background-color: #4F46E5; padding: 24px; text-align: center;">
      <h1 style="color: white; font-size: 24px; font-weight: 700; margin: 0;">Premium Plan Cancelled</h1>
    </div>
    
    <!-- Email Content -->
    <div style="padding: 32px;">
      <h2 style="color: #111827; font-size: 24px; font-weight: 700; margin-bottom: 16px;">We're sorry to see you go, ${userName}</h2>
      <p style="color: #4B5563; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
        Your Novo Premium subscription has been cancelled as requested. You'll continue to have access to all premium features until the end of your current billing period.
      </p>
      
      <!-- Downgrade Impact -->
      <div style="background-color: #EEF2FF; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <h3 style="color: #111827; font-size: 18px; font-weight: 600; margin-top: 0; margin-bottom: 12px;">Free Plan Limitations:</h3>
        <ul style="color: #4B5563; font-size: 16px; line-height: 1.5; padding-left: 20px; margin: 0;">
          <li style="margin-bottom: 8px;">Limited to 5 team members per project</li>
          <li style="margin-bottom: 8px;">No project logo customization</li>
          <li>Standard support response times</li>
        </ul>
      </div>
      
      <!-- Action Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${process.env.FRONTEND_URL}/profile" 
           style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                  font-size: 16px; font-weight: 600; text-decoration: none; 
                  border-radius: 8px; display: inline-block; transition: all 0.2s ease;
                  box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);">
          Reactivate Premium
        </a>
      </div>
      
      <div style="border-top: 1px solid #E5E7EB; padding-top: 24px; margin-top: 24px;">
        <p style="color: #9CA3AF; font-size: 12px; line-height: 1.5; margin: 0;">
          Changed your mind? You can reactivate your premium subscription at any time.<br>
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

const getPremiumReactivatedTemplate = (userName: string) => `
  <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
    <!-- Email Header -->
    <div style="background-color: #4F46E5; padding: 24px; text-align: center;">
      <h1 style="color: white; font-size: 24px; font-weight: 700; margin: 0;">Premium Plan Reactivated</h1>
    </div>
    
    <!-- Email Content -->
    <div style="padding: 32px;">
      <h2 style="color: #111827; font-size: 24px; font-weight: 700; margin-bottom: 16px;">Welcome back to Novo Premium, ${userName}!</h2>
      <p style="color: #4B5563; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
        We're thrilled to have you back! Your premium subscription has been successfully reactivated and all your premium features are now available again.
      </p>
      
      <!-- Reactivation Benefits -->
      <div style="background-color: #EEF2FF; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <h3 style="color: #111827; font-size: 18px; font-weight: 600; margin-top: 0; margin-bottom: 12px;">Your Premium Benefits:</h3>
        <ul style="color: #4B5563; font-size: 16px; line-height: 1.5; padding-left: 20px; margin: 0;">
          <li style="margin-bottom: 8px;"><strong>Unlimited collaborators</strong> - Add as many team members as you need to each project</li>
          <li style="margin-bottom: 8px;"><strong>Custom project branding</strong> - Upload logos to personalize your projects</li>
          <li><strong>Priority support</strong> - Get faster answers to your questions</li>
        </ul>
      </div>
      
      <!-- Action Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${process.env.FRONTEND_URL}/dashboard" 
           style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                  font-size: 16px; font-weight: 600; text-decoration: none; 
                  border-radius: 8px; display: inline-block; transition: all 0.2s ease;
                  box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);">
          Access Your Projects
        </a>
      </div>
      
      <div style="border-top: 1px solid #E5E7EB; padding-top: 24px; margin-top: 24px;">
        <p style="color: #9CA3AF; font-size: 12px; line-height: 1.5; margin: 0;">
          Need help getting started again? Check out our <a href="${process.env.FRONTEND_URL}/about" style="color: #4F46E5; text-decoration: none;">help center</a>.<br>
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

const getPremiumRenewalFailedTemplate = (userName: string, retryLink: string) => `
  <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
    <!-- Email Header -->
    <div style="background-color: #DC2626; padding: 24px; text-align: center;">
      <h1 style="color: white; font-size: 24px; font-weight: 700; margin: 0;">Premium Renewal Failed</h1>
    </div>
    
    <!-- Email Content -->
    <div style="padding: 32px;">
      <h2 style="color: #111827; font-size: 24px; font-weight: 700; margin-bottom: 16px;">Action Required, ${userName}</h2>
      <p style="color: #4B5563; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
        We were unable to process the renewal payment for your Novo Premium subscription. Your access to premium features will be discontinued unless you update your payment information.
      </p>
      
      <!-- Important Notice -->
      <div style="background-color: #FEE2E2; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <h3 style="color: #B91C1C; font-size: 18px; font-weight: 600; margin-top: 0; margin-bottom: 12px;">What happens next:</h3>
        <ul style="color: #4B5563; font-size: 16px; line-height: 1.5; padding-left: 20px; margin: 0;">
          <li style="margin-bottom: 8px;">You'll retain premium access for <strong>7 more days</strong> to resolve this issue</li>
          <li style="margin-bottom: 8px;">After this period, your account will revert to the Free plan</li>
          <li>All your data will remain intact, but premium features will be disabled</li>
        </ul>
      </div>
      
      <!-- Action Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${retryLink}" 
           style="background-color: #DC2626; color: white; padding: 12px 24px; 
                  font-size: 16px; font-weight: 600; text-decoration: none; 
                  border-radius: 8px; display: inline-block; transition: all 0.2s ease;
                  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.2);">
          Update Payment Method
        </a>
      </div>
      
      <p style="color: #4B5563; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
        If you believe this is an error, or if you need assistance, please contact our support team immediately.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${process.env.FRONTEND_URL}/contact" 
           style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                  font-size: 16px; font-weight: 600; text-decoration: none; 
                  border-radius: 8px; display: inline-block; transition: all 0.2s ease;
                  box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);">
          Contact Support
        </a>
      </div>
      
      <div style="border-top: 1px solid #E5E7EB; padding-top: 24px; margin-top: 24px;">
        <p style="color: #9CA3AF; font-size: 12px; line-height: 1.5; margin: 0;">
          This email was sent because your payment method failed for your Novo Premium subscription.<br>
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

// for email user avatar

const getUserInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

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

export const sendTaskCommentEmail = async (email: string, commenterName: string, commenterEmail: string, taskName: string, projectName: string, commentContent: string, taskId: string, projectId: string
) => {
  const taskLink = `${process.env.FRONTEND_URL}/projects/${projectId}/tasks/${taskId}`;
  const subject = `New comment on "${taskName}" from ${commenterName}`;
  const html = getTaskCommentTemplate(
    commenterName,
    commenterEmail,
    taskName,
    projectName,
    commentContent,
    taskLink
  );

  return await sendEmail(email, subject, html);
};

export const sendUpdatedTaskCommentEmail = async (
  email: string,
  commenterName: string,
  commenterEmail: string,
  taskName: string,
  projectName: string,
  oldCommentContent: string,
  newCommentContent: string,
  taskId: string,
  projectId: string,
  updatedAt: string
) => {
  const taskLink = `${process.env.FRONTEND_URL}/projects/${projectId}/tasks/${taskId}`;
  const subject = `Comment updated on "${taskName}" by ${commenterName}`;
  const html = getUpdatedTaskCommentTemplate(
    commenterName,
    commenterEmail,
    taskName,
    projectName,
    oldCommentContent,
    newCommentContent,
    taskLink,
    updatedAt
  );

  return await sendEmail(email, subject, html);
};

export const sendTaskStatusChangeEmail = async (
  email: string,
  changerName: string,
  changerEmail: string,
  taskName: string,
  projectName: string,
  oldStatus: string,
  newStatus: string,
  taskId: string,
  projectId: string
) => {
  const taskLink = `${process.env.FRONTEND_URL}/projects/${projectId}/tasks/${taskId}`;
  const subject = `Status changed for "${taskName}" in ${projectName}`;
  const html = getTaskStatusChangeTemplate(
    changerName,
    changerEmail,
    taskName,
    projectName,
    oldStatus,
    newStatus,
    taskLink
  );

  return await sendEmail(email, subject, html);
};

export const sendTaskAssignmentEmail = async (email: string, assignerName: string, assignerEmail: string, taskName: string, projectName: string, taskId: string, projectId: string, dueDate?: string
) => {
  const taskLink = `${process.env.FRONTEND_URL}/projects/${projectId}/tasks/${taskId}`;
  const subject = `You've been assigned to "${taskName}" in ${projectName}`;
  const html = getTaskAssignmentTemplate(
    assignerName,
    assignerEmail,
    taskName,
    projectName,
    taskLink,
    dueDate
  );

  return await sendEmail(email, subject, html);
};

export const sendTaskDueSoonEmail = async (email: string, taskName: string, projectName: string, dueDate: Date, taskId: string, projectId: string, isToday: boolean
) => {
  const taskLink = `${process.env.FRONTEND_URL}/projects/${projectId}/tasks/${taskId}`;
  const formattedDate = format(dueDate, 'MMM d, yyyy');
  const subject = `Urgent: "${taskName}" due ${isToday ? 'today' : 'tomorrow'}`;
  const html = getTaskDueSoonTemplate(
    taskName,
    projectName,
    formattedDate,
    taskLink,
    isToday
  );

  return await sendEmail(email, subject, html);
};

export const sendMilestoneDueSoonEmail = async (email: string, milestoneName: string, projectName: string, dueDate: Date, milestoneId: string, projectId: string, isToday: boolean, progressPercentage: number, completedTasks: number, totalTasks: number
) => {
  const milestoneLink = `${process.env.FRONTEND_URL}/projects/${projectId}/milestones/${milestoneId}`;
  const formattedDate = format(dueDate, 'MMM d, yyyy');
  const subject = `Milestone "${milestoneName}" due ${isToday ? 'today' : 'soon'}`;
  const html = getMilestoneDueSoonTemplate(
    milestoneName,
    projectName,
    formattedDate,
    milestoneLink,
    isToday,
    progressPercentage,
    completedTasks,
    totalTasks
  );

  return await sendEmail(email, subject, html);
};

// Email service functions for premium plans
export const sendPremiumActivationEmail = async (email: string, userName: string) => {
  const subject = `Welcome to Novo Premium!`;
  const html = getPremiumActivationTemplate(userName);
  return await sendEmail(email, subject, html);
};

export const sendPremiumCancellationEmail = async (email: string, userName: string) => {
  const subject = `Your Novo Premium Subscription Has Been Cancelled`;
  const html = getPremiumCancellationTemplate(userName);
  return await sendEmail(email, subject, html);
};

export const sendPremiumReactivatedEmail = async (email: string, userName: string) => {
  const subject = `Your Novo Premium Subscription Has Been Reactivated`;
  const html = getPremiumReactivatedTemplate(userName);
  return await sendEmail(email, subject, html);
};

export const sendPremiumRenewalFailedEmail = async (email: string, userName: string) => {
  const retryLink = `${process.env.FRONTEND_URL}/profile`;
  const subject = `Action Required: Premium Renewal Failed`;
  const html = getPremiumRenewalFailedTemplate(userName, retryLink);
  return await sendEmail(email, subject, html);
};