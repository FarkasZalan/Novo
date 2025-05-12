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

export const updateUserPremiumStatusQuery = async (id: string, is_premium: boolean, premium_session_id: string) => {
    let premium_start_date = null;
    let premium_end_date = null;
    let session_id = null;
    if (is_premium) {
        premium_start_date = new Date();
        premium_end_date = new Date();
        premium_end_date.setDate(premium_start_date.getDate() + 30);
        session_id = premium_session_id;
    }
    const result = await pool.query("UPDATE users SET is_premium = $1, premium_start_date = $2, premium_end_date = $3, updated_at = $4, premium_session_id = $5, user_cancelled_premiunm = FALSE WHERE id = $6 RETURNING *", [is_premium, premium_start_date, premium_end_date, new Date(), session_id, id]);
    return result.rows[0];
}

export const premiumPlanCancelDateQuery = async (id: string) => {
    const result = await pool.query("UPDATE users SET user_cancelled_premiunm = TRUE, updated_at = $1 WHERE id = $2 RETURNING *", [new Date(), id]);
    return result.rows[0];
}

export const deleteUserQuery = async (id: string) => {
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
    return result.rows[0];
}