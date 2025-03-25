import pool from "../config/db";

export const getAllTaskForProjectService = async (id: string) => {
    const result = await pool.query("SELECT * FROM tasks WHERE project_id = $1", [id]); // send a query to the database with one of the open connection from the pool
    return result.rows
}

export const getTaskByIdService = async (id: string) => {
    const result = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
    return result.rows[0];
}

// Returning * = return all rows that was affected by the query e.g if one user was created, updated or deleted then it will return with that row from the database
export const createTaskService = async (title: string, description: string, project_id: string, due_date: Date, priority: string, completed: boolean) => {
    console.log(title, description, project_id, due_date, priority, completed);
    const result = await pool.query("INSERT INTO tasks (title, description, project_id, due_date, priority, completed, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *", [title, description, project_id, due_date, priority, completed]);
    return result.rows[0];
}

export const updateTaskService = async (title: string, description: string, project_id: string, due_date: Date, priority: string, completed: boolean, id: string) => {
    const result = await pool.query("UPDATE tasks SET title = $1, description = $2, project_id = $3, due_date = $4, priority = $5, completed = $6, updated_at = NOW() WHERE id = $7 RETURNING *", [title, description, project_id, due_date, priority, completed, id]);
    return result.rows[0];
}

export const deleteTaskService = async (id: string) => {
    const result = await pool.query("DELETE FROM tasks WHERE id = $1 RETURNING *", [id]);
    return result.rows[0];
}