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
    const result = await pool.query("UPDATE users SET email = $1, name = $2 , password = $3 WHERE id = $4 RETURNING *", [email, name, userHashedPassword, id]);
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
    const result = await pool.query("UPDATE users SET is_premium = $1, premium_start_date = $2, premium_end_date = $3, premium_session_id = $4, user_cancelled_premium = FALSE WHERE id = $5 RETURNING *", [is_premium, premium_start_date, premium_end_date, session_id, id]);
    return result.rows[0];
}

export const premiumPlanCancelDateQuery = async (id: string) => {
    const result = await pool.query("UPDATE users SET user_cancelled_premium = TRUE WHERE id = $1 RETURNING *", [id]);
    return result.rows[0];
}

export const deleteUserQuery = async (id: string) => {
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
    return result.rows[0];
}

// LOWER = ensures case sensitive
// REPLACE (..., ' ', '') = removes whitespaces
// %${name}% = 
export const filterUserByNameOrEmailQuery = async (nameOrEmail: string) => {
    const normalizedNameOrEmail = nameOrEmail.trim().toLowerCase();

    const result = await pool.query(
        `
      SELECT *
      FROM users
      WHERE LOWER(name)  LIKE '%' || $1 || '%'
         OR LOWER(email) LIKE '%' || $1 || '%'
    `,
        [normalizedNameOrEmail]
    );
    return result.rows;
};
