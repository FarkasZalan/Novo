import express from "express";
import { createUser, loginUser, logoutUser } from "../controller/authController";
import { validateUser } from "../middlewares/inputValidator";
import { refreshAccessToken } from "../middlewares/authenticate";
import passport from "passport";
import { storeRefreshToken } from "../models/authModel";
import { generateAccessToken, generateRefreshToken } from "../utils/token-utils";
import crypto from 'crypto';

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
    async (req, res) => {
        try {
            const user = req.user as any;

            // Generate session ID and tokens similar to regular login
            const refreshSessionId = crypto.randomUUID();
            await storeRefreshToken(user.id, refreshSessionId);

            const accessToken = generateAccessToken(user.id);
            const refreshToken = generateRefreshToken(user.id, refreshSessionId);

            // Set refresh token cookie
            res.cookie("refresh_token", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            // Redirect to frontend with token (you'd normally use a more secure approach)
            res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${accessToken}&userId=${user.id}&email=${user.email}&name=${user.name}&isPremium=${user.is_premium}&createdAt=${user.created_at}&provider=${user.provider}`);
        } catch (error) {
            console.error('OAuth callback error:', error);
            res.redirect('/login?error=oauth_failed');
        }
    }
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
    async (req, res) => {
        try {
            const user = req.user as any;

            // Generate session ID and tokens similar to regular login
            const refreshSessionId = crypto.randomUUID();
            await storeRefreshToken(user.id, refreshSessionId);

            const accessToken = generateAccessToken(user.id);
            const refreshToken = generateRefreshToken(user.id, refreshSessionId);

            // Set refresh token cookie
            res.cookie("refresh_token", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            // Redirect to frontend with token
            res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${accessToken}&userId=${user.id}&email=${user.email}&name=${user.name}&isPremium=${user.is_premium}&createdAt=${user.created_at}&provider=${user.provider}`);
        } catch (error) {
            console.error('OAuth callback error:', error);
            res.redirect('/login?error=oauth_failed');
        }
    }
);

export default router;