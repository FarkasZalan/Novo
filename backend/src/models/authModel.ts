import pool from "../config/db";
import bcrypt from "bcrypt";
import crypto from 'crypto';
import { sendWelcomeEmail } from "../services/emailService";

export const createUserQuery = async (email: string, name: string, userHashedPassword: string) => {
    const result = await pool.query("INSERT INTO users (email, name, password, updated_at) VALUES ($1, $2, $3, $4) RETURNING *", [email, name, userHashedPassword, new Date()]);
    return result.rows[0];
}

export const findByEmail = async (email: string) => {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0];
}

// Store Refresh Token
export const storeRefreshToken = async (userId: string, refreshSessionId: string) => {
    try {
        const hashedSessionId = await bcrypt.hash(refreshSessionId, 10); // Hash the refresh session ID

        const result = await pool.query(
            "UPDATE users SET refresh_session_id = $1, updated_at = $2 WHERE id = $3 RETURNING *",
            [hashedSessionId, new Date(), userId]
        );

        if (result.rows.length === 0) {
            console.error('Failed to update user with refresh session ID');
            throw new Error('Failed to update user with refresh session ID');
        }
        return hashedSessionId;
    } catch (error) {
        console.error('Error storing refresh token:', error);
        throw error;
    }
}

// Clear Refresh Token on logout
export const clearRefreshTokenInDB = async (userId: string) => {
    try {
        const result = await pool.query(
            "UPDATE users SET refresh_session_id = NULL, updated_at = $1 WHERE id = $2 RETURNING *",
            [new Date(), userId]
        );

        if (result.rows.length === 0) {
            console.error('Failed to clear refresh token for user');
            throw new Error('Failed to clear refresh token for user');
        }

        return result.rows[0];
    } catch (error) {
        console.error('Error clearing refresh token:', error);
        throw error;
    }
}

// Find or create OAuth user (Google, GitHub)
export const findOrCreateOAuthUser = async (profile: any, provider: string) => {
    // Check if user exists with this provider ID
    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [profile.email]
    );

    if (result.rows.length > 0) {
        // User exists, update provider info if needed
        await pool.query(
            "UPDATE users SET provider = $1, is_verified = TRUE, verification_token_expires = NULL, verification_token = NULL, updated_at = NOW() WHERE id = $2",
            [provider, result.rows[0].id]
        );
        return result.rows[0];
    } else {
        // Create new user
        const newUser = await pool.query(
            "INSERT INTO users (email, name, password, provider, is_verified, verification_token_expires, verification_token, updated_at) VALUES ($1, $2, $3, $4, TRUE, NULL, $5, $6) RETURNING *",
            [profile.email, profile.displayName, 'OAUTH_USER', provider, new Date(), new Date()]
        );

        await sendWelcomeEmail(profile.email, profile.displayName);
        return newUser.rows[0]; // Return the newly created user
    }
};

/**
 * Create a password reset token for a user
 * @param email - The user's email address
 * @returns The reset token or null if user not found
 */
export const createPasswordResetToken = async (email: string): Promise<string | null> => {
    // Find the user by email
    const user = await findByEmail(email);

    if (!user) {
        return null;
    }

    // Generate a random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token before storing it
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Store the hashed token and expiration time in the database
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 5); // Token expires in 5 minutes

    await pool.query(
        "UPDATE users SET reset_password_token = $1, reset_password_expires = $2, updated_at = $3 WHERE id = $4",
        [hashedToken, expirationTime, new Date(), user.id]
    );

    return resetToken;
};

export const findUserEmailByResetPasswordToken = async (token: string): Promise<string | null> => {
    const result = await pool.query(
        "SELECT email, reset_password_token, reset_password_expires FROM users WHERE reset_password_token IS NOT NULL AND reset_password_expires > NOW()",
        []
    );

    if (result.rows.length === 0) {
        return null;
    }

    let foundEmail = null;

    for (const user of result.rows) {
        const isMatch = await bcrypt.compare(token, user.reset_password_token);
        if (isMatch) {
            foundEmail = user.email;
            break;
        }
    }
    return foundEmail;
}

/**
 * Reset a user's password
 * @param email - The user's email address
 * @param newPassword - The new password
 * @returns True if password was reset, false otherwise
 */
export const resetPassword = async (email: string, newPassword: string): Promise<boolean> => {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the reset token
    await pool.query(
        "UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL, updated_at = $2 WHERE email = $3",
        [hashedPassword, new Date(), email]
    );

    return true;
};

export const createVerificationToken = async (email: string): Promise<string | null> => {
    // Find the user by email
    const user = await findByEmail(email);

    if (!user) {
        return null;
    }

    // Generate a random token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Hash the token before storing it
    const hashedToken = await bcrypt.hash(verificationToken, 10);

    // Store the hashed token and expiration time in the database
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 5); // Token expires in 5 minutes

    await pool.query(
        "UPDATE users SET verification_token = $1, verification_token_expires = $2, updated_at = $3 WHERE id = $4",
        [hashedToken, expirationTime, new Date(), user.id]
    );

    return verificationToken;
};

export const findUserByVerificationToken = async (token: string) => {
    const result = await pool.query(
        "SELECT * FROM users WHERE verification_token IS NOT NULL AND verification_token_expires > NOW()",
        []
    );

    if (result.rows.length === 0) {
        return null;
    }

    for (const user of result.rows) {
        const isMatch = await bcrypt.compare(token, user.verification_token);
        if (isMatch) {
            return user;
        }
    }
    return null;
};

export const verifyUserEmail = async (userId: string) => {
    await pool.query(
        "UPDATE users SET is_verified = TRUE, verification_token = NULL, verification_token_expires = NULL, updated_at = NOW() WHERE id = $1",
        [userId]
    );
};