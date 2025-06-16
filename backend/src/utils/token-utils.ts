import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Generate access and refresh tokens for login (access token)
export const generateAccessToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: "5m" });
};

// if the access token expires generate a new refresh token so the user is not log out and if have valid refresh token then re-generate access token
export const generateRefreshToken = (id: string, refreshSessionId: string) => {
    return jwt.sign({ id, refreshSessionId }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: "7d" });
};