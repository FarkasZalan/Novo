import { NextFunction } from "express";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import {
    clearRefreshTokenInDB,
    createUserQuery,
    findByEmail,
    storeRefreshToken
} from "../models/authModel";
import { generateAccessToken, generateRefreshToken } from "../utils/token-utils";
import dotenv from "dotenv";
import crypto from 'crypto';

// Define the type for the global OAuth state store
// this is used to store the access token and user data in a temporary storage until the user logs in with google or github account
interface OAuthStateData {
    accessToken: string;
    user: {
        id: string;
        email: string;
        name: string;
        is_premium: boolean;
        provider: string;
        created_at: string;
    };
    expiresAt: number; // 5 minutes
}

// Declare the global variable with proper typing
// it's a dictionary where the key is the state token (use in the URL) and the value is the access token and user data
declare global {
    var oauthStateStore: { [key: string]: OAuthStateData } | undefined;
}

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
        const userHashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = await createUserQuery(email, name, userHashedPassword);
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
        const user = await findByEmail(email);
        if (!user) {
            handleResponse(res, 404, "Invalid email", null);
            return;
        }

        // Handle OAuth users trying to log in with password
        if (user.provider) {
            handleResponse(res, 400, `Please log in using your ${user.provider} account`, null);
            return;
        }

        // check if password is correct
        const validPassword = await bcrypt.compare(password, user.password);
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
        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",  // Only allow secure cookies in production mode
            sameSite: "lax",  // Changed from "strict" to "lax" to allow cross-site requests
            path: "/",  // Set path to root to ensure it's available for all routes
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
        const user = await findByEmail(req.body.email);

        // Remove the refresh token cookie
        res.clearCookie("refresh_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/" // Set path to root to ensure it's available for all routes
        });

        await clearRefreshTokenInDB(user.id);
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

        // Initialize the store if it doesn't exist
        if (!global.oauthStateStore) {
            global.oauthStateStore = {};
        }

        // Get the state data
        const stateData = global.oauthStateStore[state];

        if (!stateData) {
            handleResponse(res, 404, "State token not found or expired", null);
            return;
        }

        // Check if the state token has expired
        if (stateData.expiresAt < Date.now()) {
            // Clean up expired token
            delete global.oauthStateStore[state];
            handleResponse(res, 404, "State token expired", null);
            return;
        }

        // Clean up the used token
        delete global.oauthStateStore[state];

        // Return the state data
        handleResponse(res, 200, "OAuth state data retrieved successfully", {
            accessToken: stateData.accessToken,
            user: stateData.user
        });
    } catch (error) {
        next(error);
    }
};