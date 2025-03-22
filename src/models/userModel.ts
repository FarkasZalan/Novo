import pool from "../config/db";

export const getAllUsersService = async () => {
    const result = await pool.query("SELECT * FROM users"); // send a query to the database with one of the open connection from the pool
    return result.rows
}

export const getUserByIdService = async (id: number) => {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0];
}

export const createUserService = async (email: string, name: string) => {
    const result = await pool.query("INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *", [email, name]);
    return result.rows[0];
}

export const updateUserService = async (id: number, email: string, name: string) => {
    const result = await pool.query("UPDATE users SET email = $1, name = $2 WHERE id = $3 RETURNING *", [email, name, id]);
    return result.rows[0];
}

export const deleteUserService = async (id: number) => {
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
    return result.rows[0];
}