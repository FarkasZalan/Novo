import pool from "../config/db";

export const getChangeLogsForDashboardQuery = async (projectIds: string[], limit: number) => {
    if (!projectIds.length) return [];

    let query = `
    SELECT 
      change_logs.*, 
      users.name AS changed_by_name, 
      users.email AS changed_by_email 
    FROM change_logs 
    LEFT JOIN users ON users.id = change_logs.changed_by
    WHERE (
      ${projectIds.map((_, i) => `
        old_data ->> 'project_id' = $${i + 1} OR old_data ->> 'id' = $${i + 1} OR
        new_data ->> 'project_id' = $${i + 1} OR new_data ->> 'id' = $${i + 1}
      `).join(" OR ")}
    )`;

    const baseParams = [...projectIds];

    query += ` ORDER BY created_at DESC LIMIT $${baseParams.length + 1}`;
    baseParams.push(limit.toString());

    const result = await pool.query(query, baseParams);
    return result.rows;
};

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

export const getAllLogForUserQuery = async (
    projectIds: string[],
    limit: number,
    userId: string,
    table_names?: string[]
) => {
    let query = `
    SELECT 
      change_logs.*, 
      users.name AS changed_by_name, 
      users.email AS changed_by_email 
    FROM change_logs 
    LEFT JOIN users ON users.id = change_logs.changed_by
    WHERE (`;

    const params: string[] = [];

    // Add conditions for project-related changes if projectIds exist
    if (projectIds.length > 0) {
        const projectConditions = projectIds
            .map((_, i) => `
        (old_data ->> 'project_id' = $${i + 1} OR 
         new_data ->> 'project_id' = $${i + 1} OR
         old_data ->> 'id' = $${i + 1} OR 
         new_data ->> 'id' = $${i + 1})
      `)
            .join(' OR ');

        query += projectConditions;
        params.push(...projectIds);
    }

    // Add condition for user-related changes
    if (projectIds.length > 0) {
        query += ` OR `;
    }
    query += ` (old_data ->> 'id' = $${params.length + 1} OR new_data ->> 'id' = $${params.length + 1})`;
    params.push(userId);

    query += `)`;

    // Add table_name filter if provided
    if (table_names?.length) {
        const tableParams = table_names.map((_, i) => `$${params.length + i + 1}`).join(',');
        query += ` AND table_name IN (${tableParams})`;
        params.push(...table_names);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit.toString());

    const result = await pool.query(query, params);
    return result.rows;
};


export const deleteLogQuery = async (logId: string) => {
    await pool.query("DELETE FROM change_logs WHERE id = $1 RETURNING *", [logId]);
}