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

export const getAllLogForUserQuery = async (projectId: string, limit: number, userId: string, table_names?: string[]) => {
    let query = `SELECT 
        change_logs.*, users.name AS changed_by_name, users.email AS changed_by_email 
        FROM change_logs 
        LEFT JOIN users ON users.id = change_logs.changed_by
        WHERE (`;

    // Main conditions
    query += `old_data ->> 'project_id' = $1 OR new_data ->> 'project_id' = $1 
             OR old_data ->> 'id' = $1 OR new_data ->> 'id' = $1 
             OR old_data ->> 'id' = $3 OR new_data ->> 'id' = $3`;

    // Add table_name filter if provided
    if (table_names && table_names.length > 0) {
        // Create placeholders for each table name ($4, $5, etc.)
        const tableNamePlaceholders = table_names.map((_, i) => `$${i + 4}`).join(',');
        query += `) AND table_name IN (${tableNamePlaceholders})`;
    } else {
        query += `)`;
    }

    query += ` ORDER BY created_at DESC LIMIT $2`;

    // Combine all parameters
    const params = [projectId, limit, userId];
    if (table_names && table_names.length > 0) {
        params.push(...table_names);
    }

    const result = await pool.query(query, params);
    return result.rows;
};

export const deleteLogQuery = async (logId: string) => {
    await pool.query("DELETE FROM change_logs WHERE id = $1 RETURNING *", [logId]);
}