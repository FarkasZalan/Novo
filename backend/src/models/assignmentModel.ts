import pool from "../config/db";

export const getAssignmentsForTaskQuery = async (task_id: string) => {
    const result = await pool.query(`
        SELECT 
            assignments.*, 
            users.name AS user_name, 
            users.email AS user_email,
            assigned_by_user.name AS assigned_by_name
        FROM assignments
        LEFT JOIN users ON users.id = assignments.user_id
        LEFT JOIN users AS assigned_by_user ON assigned_by_user.id = assignments.assigned_by
        WHERE assignments.task_id = $1
        ORDER BY assignments.assigned_at DESC;
    `, [task_id]);
    return result.rows;
}

export const getAssignmentsForUserQuery = async (user_id: string) => {
    const result = await pool.query("SELECT * FROM assignments WHERE user_id = $1;", [user_id]); // send a query to the database with one of the open connection from the pool
    return result.rows
}

export const createAssignmentQuery = async (task_id: string, user_id: string, project_id: string, assigned_by: string) => {
    const result = await pool.query("INSERT INTO assignments (task_id, user_id, project_id, assigned_at, assigned_by) VALUES ($1, $2, $3, $4, $5);", [task_id, user_id, project_id, new Date(), assigned_by]); // send a query to the database with one of the open connection from the pool
    return result.rows
}

export const deleteAssignmentQuery = async (task_id: string, user_id: string) => {
    const result = await pool.query("DELETE FROM assignments WHERE task_id = $1 AND user_id = $2;", [task_id, user_id]); // send a query to the database with one of the open connection from the pool
    return result.rows
}