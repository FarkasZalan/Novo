import pool from "../config/db";
import bcrypt from "bcrypt";

export const createUserService = async (email: string, name: string, userHashedPassword: string) => {
    const result = await pool.query("INSERT INTO users (email, name, password, updated_at) VALUES ($1, $2, $3, NOW()) RETURNING *", [email, name, userHashedPassword]);
    return result.rows[0];
}

export const findByEmail = async (email: string) => {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0];
}

// Store Refresh Token
export const storeRefreshToken = async (userId: string, refreshSessionId: string) => {
    const hashedSessionId = await bcrypt.hash(refreshSessionId, 10); // Hash the refresh session ID
    await pool.query("UPDATE users SET refresh_session_id = $1, updated_at = NOW() WHERE id = $2 RETURNING *", [hashedSessionId, userId]);

    return hashedSessionId;
}

// Clear Refresh Token on logout
export const clearRefreshTokenInDB = async (userId: string) => {
    const result = await pool.query("UPDATE users SET refresh_session_id = NULL, updated_at = NOW() WHERE id = $1 RETURNING *", [userId]);
    return result.rows[0];
}