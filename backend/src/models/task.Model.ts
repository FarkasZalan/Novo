import pool from "../config/db";

export const getAllTaskForProjectQuery = async (id: string) => {
    const result = await pool.query("SELECT * FROM tasks WHERE project_id = $1 ORDER BY updated_at DESC", [id]); // send a query to the database with one of the open connection from the pool
    return result.rows
}

export const getTaskByIdQuery = async (id: string) => {
    const result = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
    return result.rows[0];
}

// Returning * = return all rows that was affected by the query e.g if one user was created, updated or deleted then it will return with that row from the database
export const createTaskQuery = async (title: string, description: string, project_id: string, due_date: Date, priority: string) => {
    const result = await pool.query("INSERT INTO tasks (title, description, project_id, due_date, priority, updated_at, status) VALUES ($1, $2, $3, $4, $5, $6, 'not-started') RETURNING *", [title, description, project_id, due_date, priority, new Date()]);
    return result.rows[0];
}

export const updateTaskQuery = async (title: string, description: string, project_id: string, due_date: Date, priority: string, id: string, status: string) => {
    const result = await pool.query("UPDATE tasks SET title = $1, description = $2, project_id = $3, due_date = $4, priority = $5, updated_at =$6, status = $7 WHERE id = $8 RETURNING *", [title, description, project_id, due_date, priority, new Date(), status, id]);
    return result.rows[0];
}

export const getTaskCountForProjectQuery = async (id: string) => {
    const result = await pool.query("SELECT COUNT(*) FROM tasks WHERE project_id = $1", [id]);
    return parseInt(result.rows[0].count, 10);
}

export const getCompletedTaskCountForProjectQuery = async (id: string) => {
    const result = await pool.query("SELECT COUNT(*) FROM tasks WHERE project_id = $1 AND status = 'completed'", [id]);
    return parseInt(result.rows[0].count, 10);
}

export const getInProgressTaskCountForProjectQuery = async (id: string) => {
    const result = await pool.query("SELECT COUNT(*) FROM tasks WHERE project_id = $1 AND status = 'in-progress'", [id]);
    return parseInt(result.rows[0].count, 10);
}

export const deleteTaskQuery = async (id: string) => {
    const result = await pool.query("DELETE FROM tasks WHERE id = $1 RETURNING *", [id]);
    return result.rows[0];
}