import pool from "../config/db";

export const deleteLogQuery = async (logId: string) => {
    await pool.query("DELETE FROM change_logs WHERE id = $1 RETURNING *", [logId]);
}