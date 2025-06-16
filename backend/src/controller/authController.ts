import { NextFunction } from "express";
import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import {
    clearRefreshTokenInDB,
    createUserQuery,
    findByEmail,
    storeRefreshToken,
    createPasswordResetToken,
    resetPassword,
    findUserEmailByResetPasswordToken,
    findUserByVerificationToken,
    verifyUserEmail,
    createVerificationToken,
} from "../models/authModel";
import { generateAccessToken, generateRefreshToken } from "../utils/token-utils";
import { sendPasswordResetEmail, sendVerificationEmail, sendWelcomeEmail } from "../services/emailService";
import dotenv from "dotenv";
import crypto from 'crypto';
import { redisClient } from "../config/redis";
import { getUserByIdQuery } from "../models/userModel";
import { getPendingProjectsForPendingUserByEmailQuery, addUserToProjectQuery, deletePendingUserQuery } from "../models/projectMemberModel";
import { User } from "../schemas/types/userType";

dotenv.config();

// Standardized response function
// it's a function that returns a response to the client when a request is made (CRUD operations)
const handleResponse = (res: Response, status: number, message: string, data: any) => {
    return res.status(status).json({
        status,
        message,
        data
    });
};

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, name } = req.body;
        const userHashedPassword = await bcryptjs.hash(req.body.password, 10);
        const newUser = await createUserQuery(email, name, userHashedPassword);

        // Generate verification token and send email
        const verificationToken = await createVerificationToken(email);
        if (verificationToken) {
            await sendVerificationEmail(email, verificationToken);
        }

        handleResponse(res, 201, "User created successfully", newUser);
    } catch (error: Error | any) {
        if (error.code === "23505") {
            handleResponse(res, 409, "Email already exists", null);
        } else {
            // Pass other errors to the next middleware (errorHandling middleware)
            next(error);
        }
    }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;

        // check if email exists
        const user: User = await findByEmail(email);
        if (!user) {
            handleResponse(res, 404, "Invalid email", null);
            return;
        }

        // Handle OAuth users trying to log in with password
        if (user.provider) {
            handleResponse(res, 400, `Please log in using your ${user.provider} account`, null);
            return;
        }

        // Check if email is verified
        if (!user.is_verified) {
            handleResponse(res, 400, "Please verify your email before logging in", null);
            return;
        }

        // check if password is correct
        const validPassword = await bcryptjs.compare(password, user.password!);
        if (!validPassword) {
            handleResponse(res, 400, "Invalid password", null);
            return;
        }

        // JWT

        // 1. Create new refresh session ID for incremental security
        // if the token is stolen then the attacker can use the refresh token to generate a new access token
        // but with session ID the attacker can't reuse the refresh token because when the refresh token is used the 
        // server checks the session ID and if it's doesn't match then the request is rejected
        const refreshSessionId = crypto.randomUUID(); // Generate a unique refresh session ID

        // 2. Store the hashed session ID in the database before generating the refresh token
        const hashedSessionId = await storeRefreshToken(user.id, refreshSessionId);

        // 3. Generate access and refresh token with the new stored refresh session ID
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id, refreshSessionId);

        // 4. Store refresh token in a HTTP-only cookie
        // strict - cookie sent only on the same site
        // lax - cookie sent top level nvigations (GET), not with PUT, POST, DELETE
        // none - cookie sent in cross-site requests - only if secure: true
        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: true, // https
            sameSite: "none",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        handleResponse(res, 200, "User logged in successfully", {
            accessToken,
            user
        });
    } catch (error) {
        console.error('Login error:', error);
        next(error);
    }
};

export const logoutUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user: User = await findByEmail(req.body.email);

        // Remove the refresh token cookie
        res.clearCookie("refresh_token", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/" // Set path to root to ensure it's available for all routes
        });

        // Only try to clear the refresh token if user exists
        if (user && user.id) {
            try {
                await clearRefreshTokenInDB(user.id);
            } catch (tokenError) {
                console.error("Error clearing refresh token:", tokenError);
                // Continue even if this fails
            }
        }
        handleResponse(res, 200, "User logged out successfully", null);
    } catch (error) {
        next(error);
    }
};

// OAuth callback endpoint
export const getOAuthState = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // the state token is store the access token and the user data
        const { state } = req.query;

        if (!state || typeof state !== 'string') {
            handleResponse(res, 400, "Invalid or missing state token", null);
            return;
        }

        const stateData = await redisClient.get(`oauth_state:${state}`);


        if (!stateData) {
            handleResponse(res, 404, "State token not found or expired", null);
            return;
        }

        // Clean up the used token
        await redisClient.del(`oauth_state:${state}`);

        const stateDataParsed = JSON.parse(stateData);
        if (!stateDataParsed.accessToken || !stateDataParsed.user) {
            handleResponse(res, 400, "Invalid state data", null);
            return;
        }

        const user = await getUserByIdQuery(stateDataParsed.user.id);
        if (!user) {
            handleResponse(res, 404, "User not found", null);
            return;
        }

        // Return the state data
        handleResponse(res, 200, "OAuth state data retrieved successfully", {
            accessToken: stateDataParsed.accessToken,
            user: user
        });
    } catch (error) {
        next(error);
    }
};

export const oauthCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user;
        const refreshSessionId = crypto.randomUUID();
        await storeRefreshToken(user.id, refreshSessionId);
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id, refreshSessionId);

        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const fullUser = await getUserByIdQuery(user.id);

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Authentication Successful</title>
            </head>
            <body>
                <script>
    const authData = {
        success: true,
        accessToken: "${accessToken}",
        user: ${JSON.stringify(fullUser)}
    };

    if (window.opener && !window.opener.closed) {
        window.opener.postMessage(authData, "*");
        setTimeout(() => window.close(), 1000);
    } else if (window.parent && window.parent !== window) {
        window.parent.postMessage(authData, "*");
    } else {
        // Store token + user locally, then redirect safely
        localStorage.setItem("temp_access_token", "${accessToken}");
        localStorage.setItem("temp_user", ${JSON.stringify(JSON.stringify(fullUser))});
        window.location.href = "${process.env.FRONTEND_URL}/auth/success";
    }
</script>
                <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
                    <h2>✅ Authentication Successful!</h2>
                    <p>This window should close automatically...</p>
                    <p><a href="${process.env.FRONTEND_URL}/dashboard">Continue to Dashboard</a></p>
                </div>
            </body>
            </html>
        `;

        res.send(html);
    } catch (error) {
        const html = `
            <!DOCTYPE html>
            <html>
            <body>
                <script>
                    const authData = { success: false, error: "Authentication failed" };
                    if (window.opener && !window.opener.closed) {
                        window.opener.postMessage(authData, "*");
                        setTimeout(() => window.close(), 1000);
                    } else if (window.parent && window.parent !== window) {
                        window.parent.postMessage(authData, "*");
                    } else {
                        window.location.href = "${process.env.FRONTEND_URL}/login?error=auth_failed";
                    }
                </script>
                <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
                    <h2>❌ Authentication Failed</h2>
                    <p><a href="${process.env.FRONTEND_URL}/login">Try Again</a></p>
                </div>
            </body>
            </html>
        `;
        res.send(html);
    }
}

// send password reset email
export const requestPasswordReset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email) {
            handleResponse(res, 400, "Email is required", null);
            return;
        }

        // Find the user by email
        const user: User = await findByEmail(email);

        // If user not found, still return success to prevent email enumeration
        if (!user) {
            handleResponse(res, 200, "If your email is registered, you will receive a password reset link", null);
            return;
        }

        // Check if user is an OAuth user
        if (user.provider) {
            handleResponse(res, 400, `This account is linked to ${user.provider}. Please use ${user.provider} to sign in.`, null);
            return;
        }

        // Create a reset token
        const resetToken = await createPasswordResetToken(email);

        // This should never be null at this point, but TypeScript doesn't know that
        if (!resetToken) {
            handleResponse(res, 500, "Failed to create reset token", null);
            return;
        }

        // Send the reset email
        await sendPasswordResetEmail(email, resetToken);

        handleResponse(res, 200, "If your email is registered, you will receive a password reset link", null);
    } catch (error) {
        next(error);
    }
};

// Verify a reset password token
export const verifyResetPasswordToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { token } = req.params;
        if (!token) {
            handleResponse(res, 400, "Token is required", null);
            return;
        }

        // Query for a user where a reset token exists and has not expired
        let foundEmail = await findUserEmailByResetPasswordToken(token);

        if (!foundEmail) {
            handleResponse(res, 400, "Invalid or expired reset token", null);
            return;
        }

        handleResponse(res, 200, "Token verified successfully", { email: foundEmail });
    } catch (error) {
        next(error);
    }
};

export const resetUserPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, token, newPassword } = req.body;

        if (!email || !token || !newPassword) {
            handleResponse(res, 400, "Email, token, and new password are required", null);
            return;
        }

        // Validate password
        if (newPassword.length < 6) {
            handleResponse(res, 400, "Password must be at least 6 characters", null);
            return;
        }

        // Find the user by email
        const user = await findByEmail(email);

        if (!user) {
            handleResponse(res, 400, "User not found", null);
            return;
        }

        // Check if user is an OAuth user
        if (user.provider) {
            handleResponse(res, 400, `This account is linked to ${user.provider}. Please use ${user.provider} to sign in.`, null);
            return;
        }

        // Reset the password
        const success = await resetPassword(email, newPassword);

        if (!success) {
            handleResponse(res, 400, "Invalid or expired reset token", null);
            return;
        }

        handleResponse(res, 200, "Password reset successfully", null);
    } catch (error) {
        next(error);
    }
};

// if the token is match with the user then verify
export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { token } = req.body;
        if (!token) {
            handleResponse(res, 400, "Token is required", null);
            return;
        }

        // Find user with this verification token
        const user: User = await findUserByVerificationToken(token);

        if (!user) {
            handleResponse(res, 400, "Invalid or expired verification token", null);
            return;
        }

        // Verify the user
        await verifyUserEmail(user.id);

        const pendingUserProjects = await getPendingProjectsForPendingUserByEmailQuery(user.email);
        if (pendingUserProjects) {
            for (const invite of pendingUserProjects) {
                try {
                    await addUserToProjectQuery(invite.project_id, user.id, invite.role, invite.inviter_name, invite.inviter_user_id);
                    await deletePendingUserQuery(invite.id);
                } catch (error) {
                    console.error("normal register activate user error", error);
                }
            }
        }

        await sendWelcomeEmail(user.email, user.name);

        handleResponse(res, 200, "Email verified successfully", null);
    } catch (error) {
        next(error);
    }
};

export const resendVerificationEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email } = req.body;
        if (!email) {
            handleResponse(res, 400, "Email is required", null);
            return;
        }

        // Find the user by email
        const user: User = await findByEmail(email);
        if (!user) {
            handleResponse(res, 400, "If this email is registered, you will receive a verification email", null);
            return;
        }

        // Check if user is already verified
        if (user.is_verified) {
            handleResponse(res, 400, "This email is already verified", null);
            return;
        }

        // Generate verification token and send email
        const verificationToken = await createVerificationToken(email);
        if (verificationToken) {
            await sendVerificationEmail(email, verificationToken);
        }

        handleResponse(res, 200, "If this email is registered, you will receive a verification email", null);
    } catch (error) {
        next(error);
    }
};