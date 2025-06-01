import pool from "../config/db";

export const getChangeLogsForProjectQuery = async (projectId: string, limit: number) => {
    const result = await pool.query(`SELECT 
        change_logs.*, users.name AS changed_by_name, users.email AS changed_by_email 
        FROM change_logs 
        LEFT JOIN users ON users.id = change_logs.changed_by
        WHERE (old_data ->> 'project_id' = $1 OR new_data ->> 'project_id' = $1 OR old_data ->> 'id' = $1 OR new_data ->> 'id' = $1) 
        ORDER BY created_at DESC LIMIT $2`, [projectId, limit]);
    return result.rows;
};

export const getChangeLogsForTaskQuery = async (taskId: string, limit: number) => {
    const result = await pool.query(`SELECT 
        change_logs.*, users.name AS changed_by_name, users.email AS changed_by_email 
        FROM change_logs 
        LEFT JOIN users ON users.id = change_logs.changed_by
        WHERE (old_data ->> 'task_id' = $1 OR new_data ->> 'task_id' = $1 OR old_data ->> 'id' = $1 OR new_data ->> 'id' = $1) 
        ORDER BY created_at DESC LIMIT $2`, [taskId, limit]);
    return result.rows;
};

export const getChangeLogsForCommentQuery = async (commmentId: string) => {
    const result = await pool.query(`SELECT 
        change_logs.*, users.name AS changed_by_name, users.email AS changed_by_email 
        FROM change_logs 
        LEFT JOIN users ON users.id = change_logs.changed_by
        WHERE (old_data ->> 'id' = $1 OR new_data ->> 'id' = $1 AND operation = 'UPDATE') 
        ORDER BY created_at DESC`, [commmentId]);
    return result.rows;
};

export const getChangeLogsForMilestoneQuery = async (milestoneId: string, limit: number) => {
    const result = await pool.query(`SELECT 
        change_logs.*, users.name AS changed_by_name, users.email AS changed_by_email 
        FROM change_logs 
        LEFT JOIN users ON users.id = change_logs.changed_by
        WHERE (old_data ->> 'id' = $1 OR new_data ->> 'id' = $1 AND operation = 'UPDATE')
        ORDER BY created_at DESC LIMIT $2`, [milestoneId, limit]);
    return result.rows;
};

export const getChangeLogsForUserQuery = async (userId: string, limit: number) => {
    const result = await pool.query(`SELECT 
        change_logs.*, users.name AS changed_by_name, users.email AS changed_by_email 
        FROM change_logs 
        LEFT JOIN users ON users.id = change_logs.changed_by
        WHERE (old_data ->> 'id' = $1 OR new_data ->> 'id' = $1 AND operation = 'UPDATE')
        ORDER BY created_at DESC LIMIT $2`, [userId, limit]);
    return result.rows;
};

export const deleteLogQuery = async (logId: string) => {
    await pool.query("DELETE FROM change_logs WHERE id = $1 RETURNING *", [logId]);
}