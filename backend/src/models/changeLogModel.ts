import pool from "../config/db";

export const getChangeLogsForProject = async (projectId: number) => {
    const result = await pool.query(`SELECT 
        change_logs.*, users.name AS changed_by_name, users.email AS changed_by_email 
        FROM change_logs 
        LEFT JOIN users ON users.id = change_logs.changed_by
        WHERE (old_data ->> 'project_id' = $1 OR new_data ->> 'project_id' = $1) 
        ORDER BY created_at DESC`, [projectId]);
    return result.rows;
};
