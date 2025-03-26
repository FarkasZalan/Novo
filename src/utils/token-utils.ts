import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const generateAccessToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: "1h" });
};

export const generateRefreshToken = (id: string, refreshSessionId: string) => {
    return jwt.sign({ id, refreshSessionId }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: "7d" });
};