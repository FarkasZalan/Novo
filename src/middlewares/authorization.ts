import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { generateAccessToken } from '../utils/jwt-helpers';
import bcrypt from "bcrypt";
import { findByEmail } from '../models/authModel';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization']; // Bearer <token>
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Access token not found' })
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired access token' });
        }
        req.body.user = user; // add user to request
        next();
    });
};

// Refresh token endpoint
export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const refreshToken = req.cookies.refresh_token; // Get refresh token from cookie
        if (!refreshToken) {
            res.status(401).json({ message: "Refresh token not found" });
        }

        // Verify refresh token
        // Decode refresh token
        const decoded: any = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string);

        // Fetch user from DB
        const user = await findByEmail(decoded.id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
        }

        // Compare seession ID from token with the hashed session ID from DB
        const isValidSession = await bcrypt.compare(decoded.sessionId, user.refresh_session_id);
        if (!isValidSession) {
            res.status(403).json({ message: "Invalid session" });
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(user.id);

        res.status(200).json({
            message: "Access token refreshed successfully",
            accessToken: newAccessToken,
            user
        });
    } catch (error) {
        res.status(403).json({ message: "Invalid refresh token" });
    }
};