import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// transporter = a nodemailer object that defines how to connect and communicate with the email service (now it's Gmail)

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD, // Use App Password that come from the Google account 
        // 1. 2-step verification
        // 2. search for app password then create one and then it will show the app pass
    },
});

// Verify transporter connection
transporter.verify((error, _success) => {
    if (error) {
        console.error('Email service error:', error);
    } else {
        console.log('Email service is ready to send messages');
    }
});

// Send an email
export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        const mailOptions = {
            from: `"Novo" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
};

export default transporter; 