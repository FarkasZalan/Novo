import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { generateAccessToken } from '../utils/token-utils';
import bcrypt from "bcryptjs";
import { getUserByIdQuery } from '../models/userModel';
import pool from '../config/db';
import format from 'pg-format';


declare module "express-serve-static-core" {
    interface Request {
        user: { id: string }; // for req.user
    }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    // Bearer token
    // Bearer token = "Bearer <token>" is a type of access token in HTTP, used to authenticate requests so basically whoever is holding the token can access the resources
    // no extra verification required
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Access token not found' })
        return;
    }

    // Verify access token
    jwt.verify(token, process.env.JWT_SECRET as string, async (err: any, user: any) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Access token expired' });
            }
            return res.status(403).json({ message: 'Invalid access token' });
        }
        req.user = { id: user.id }; // add user id to request
        await pool.query(format("SET app.user_id = %L", user.id));
        next(); // call next middleware
    });
};

// Refresh token endpoint
export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const refreshToken = req.cookies.refresh_token; // Get refresh token from cookie
        if (!refreshToken) {
            res.status(400).json({
                message: "No refresh token found in cookies",
                code: "NO_REFRESH_TOKEN" // specific errror code for easier handling on frontend (AuthProvider.tsx)
            });
            return;
        }

        // Verify and decode refresh token
        let decoded: any;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string);
        } catch (jwtError) {
            res.status(400).json({
                message: "Invalid refresh token",
                code: "INVALID_REFRESH_TOKEN"
            });
        }

        // Check if the decoded token has the required properties
        if (!decoded.id) {
            res.status(403).json({ message: "Invalid refresh token format" });
            return;
        }

        // Fetch user from DB
        const user = await getUserByIdQuery(decoded.id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Check if user has a refresh session ID
        if (!user.refresh_session_id) {
            res.status(403).json({ message: "No refresh session found" });
            return;
        }

        // Check if the decoded token has the sessionId property
        if (!decoded.refreshSessionId) {
            res.status(403).json({ message: "Invalid refresh token format" });
            return;
        }

        // Compare session ID from token with the hashed session ID from DB
        const isValidSession = await bcrypt.compare(decoded.refreshSessionId, user.refresh_session_id);
        if (!isValidSession) {
            res.status(403).json({ message: "Invalid session" });
            return;
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(user.id);

        res.status(200).json({
            message: "Access token refreshed successfully",
            accessToken: newAccessToken,
            user
        });
    } catch (error) {
        res.status(400).json({
            message: "Invalid refresh token",
            code: "INVALID_REFRESH_TOKEN"
        });
        return;
    }
};