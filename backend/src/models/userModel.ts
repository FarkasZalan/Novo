import pool from "../config/db";

export const getAllUsersQuery = async () => {
    const result = await pool.query("SELECT * FROM users"); // send a query to the database with one of the open connection from the pool
    return result.rows
}

export const getUserByIdQuery = async (id: string) => {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0];
}

export const updateUserQuery = async (id: string, email: string, name: string, userHashedPassword: string) => {
    const result = await pool.query("UPDATE users SET email = $1, name = $2 , password = $3, updated_at = $4 WHERE id = $5 RETURNING *", [email, name, userHashedPassword, new Date(), id]);
    return result.rows[0];
}

export const deleteUserQuery = async (id: string) => {
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
    return result.rows[0];
}