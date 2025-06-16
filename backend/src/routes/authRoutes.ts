import express, { Request, Response } from "express";
import { createUser, loginUser, logoutUser, getOAuthState, requestPasswordReset, resetUserPassword, verifyResetPasswordToken, resendVerificationEmail, verifyEmail, oauthCallback } from "../controller/authController";
import { validateUser } from "../middlewares/inputValidator";
import { refreshAccessToken } from "../middlewares/authenticate";
import passport from "passport";
import { storeRefreshToken } from "../models/authModel";
import { generateAccessToken, generateRefreshToken } from "../utils/token-utils";
import crypto from 'crypto';
import { redisClient } from "../config/redis";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: user@example.com
 *               name:
 *                 type: string
 *                 description: User's full name
 *                 example: John Doe
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User's password (min 6 characters)
 *                 example: password123
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *                 userId:
 *                   type: string
 *                   example: 5f8d0d55b54764421b7156c3
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: Email already exists
 */
router.post("/auth/register", validateUser, createUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: password123
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               description: HttpOnly cookie containing refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 5f8d0d55b54764421b7156c3
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     name:
 *                       type: string
 *                       example: John Doe
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 */
router.post("/auth/login", loginUser);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Authentication]
 *     description: Requires refresh token in HttpOnly cookie
 *     responses:
 *       200:
 *         description: New access token generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: New JWT access token
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid or expired refresh token
 *       403:
 *         description: Refresh token not provided
 */
router.post("/auth/refresh-token", refreshAccessToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user and invalidate refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: User logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout successful
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: User not found
 */
router.post("/auth/logout", logoutUser);




/**
 * OAuth:
 * call the /auth/google on frontend where click one of the buttons
 * open the google consent screen and authorize
 * redirect to /auth/google/callback (passport.ts callback url) with the user info what get from passport
 * send the state_token to the frontend in url and save token and user id in redis
 * the frontend fetch the access token and user id from redis with the call the /auth/oauth-state
 * send the token and user id to the frontend from the authController with the call the /auth/oauth-state
 */

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth authentication
 *     tags: [Authentication]
 *     description: Redirects to Google's OAuth consent screen
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 */
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback endpoint
 *     tags: [Authentication]
 *     description: Callback URL for Google OAuth flow. Not meant to be called directly.
 *     responses:
 *       302:
 *         description: Redirects to frontend with tokens
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               description: HttpOnly cookie containing refresh token
 */
router.get('/auth/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    oauthCallback
);

/**
 * @swagger
 * /auth/github:
 *   get:
 *     summary: Initiate GitHub OAuth authentication
 *     tags: [Authentication]
 *     description: Redirects to GitHub's OAuth consent screen
 *     responses:
 *       302:
 *         description: Redirect to GitHub OAuth
 */
router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

/**
 * @swagger
 * /auth/github/callback:
 *   get:
 *     summary: GitHub OAuth callback endpoint
 *     tags: [Authentication]
 *     description: Callback URL for GitHub OAuth flow. Not meant to be called directly.
 *     responses:
 *       302:
 *         description: Redirects to frontend with tokens
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               description: HttpOnly cookie containing refresh token
 */
router.get('/auth/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: '/login' }),
    oauthCallback
);

/**
 * @swagger
 * /auth/oauth-state:
 *   get:
 *     summary: Fetch OAuth state data
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         required: true
 *         description: State token received from OAuth callback
 *     responses:
 *       200:
 *         description: OAuth state data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     is_premium:
 *                       type: boolean
 *                     provider:
 *                       type: string
 *                     created_at:
 *                       type: string
 *       400:
 *         description: Invalid or missing state token
 *       404:
 *         description: State token not found or expired
 */
router.get('/auth/oauth-state', getOAuthState);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: If the email is registered, a password reset link will be sent
 *       400:
 *         description: Email is required
 */
router.post("/auth/forgot-password", requestPasswordReset);

/**
 * @swagger
 * /auth/verify-reset-token/{token}:
 *   get:
 *     summary: Verify a password reset token
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Reset token received via email
 *     responses:
 *       200:
 *         description: Token verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   description: Email associated with the token
 *       400:
 *         description: Invalid or expired reset token
 */
router.get("/auth/verify-reset-token/:token", verifyResetPasswordToken);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset a user's password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 description: Reset token received via email
 *                 example: abc123def456
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: New password (min 6 characters)
 *                 example: newPassword123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired reset token
 */
router.post("/auth/reset-password", resetUserPassword);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify user's email with a token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Verification token sent to user's email
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post("/auth/verify-email", verifyEmail);

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     summary: Resend verification email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *     responses:
 *       200:
 *         description: Verification email resent
 *       400:
 *         description: Email not found or user already verified
 */
router.post("/auth/resend-verification", resendVerificationEmail);

export default router;