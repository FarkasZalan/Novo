import { NextFunction } from "express";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { clearRefreshTokenInDB, createUserService, findByEmail, storeRefreshToken } from "../models/authModel";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt-helpers";
import dotenv from "dotenv";

dotenv.config();

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
        const newUser = await createUserService(email, name, userHashedPassword);
        handleResponse(res, 201, "User created successfully", newUser);
    } catch (error: Error | any) {
        // Check for unique constraint violation (duplicate email)
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

        // check if password is correct
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            handleResponse(res, 401, "Invalid password", null);
            return;
        }

        // JWT

        // 1. Create new refresh session ID
        const refreshSessionId = crypto.randomUUID(); // Generate a unique refresh session ID

        // 2. Store the hashed session ID in the database before generating the refresh token
        await storeRefreshToken(user.id, refreshSessionId);

        // 3. Generate access and refresh token with the new stored refresh session ID
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id, refreshSessionId);


        // 4. Store refresh token in a HTTP-only cookie
        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Only allow secure cookies in production mode
            sameSite: "strict", // Prevent CSRF attacks
            path: "/auth/refresh-token",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        handleResponse(res, 200, "User logged in successfully", {
            accessToken,
            user
        });
    } catch (error) {
        next(error);
    }
};

export const logoutUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await findByEmail(req.body.email);
        // Remove the refresh token cookie
        res.clearCookie("refresh_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Only allow secure cookies in production mode
            sameSite: "strict", // Prevent CSRF attacks
            path: "/auth/refresh-token"
        });

        await clearRefreshTokenInDB(user.id);
        handleResponse(res, 200, "User logged out successfully", null);
    } catch (error) {
        next(error);
    }
};