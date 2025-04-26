import pool from "../config/db";

// project files querys
export const getAllFilesQuery = async (procejtId: string) => {
    const result = await pool.query("SELECT files.*, users.name AS uploaded_by_name, users.email AS uploaded_by_email FROM files LEFT JOIN users ON users.id = files.uploaded_by WHERE files.project_id = $1 ORDER BY files.created_at DESC;", [procejtId]); // send a query to the database with one of the open connection from the pool
    return result.rows
}

export const uploadFileForProjectQuery = async (project_id: string, file_name: string, mime_type: string, size: number, uploaded_by_id: number, file_data?: Buffer) => {
    const result = await pool.query("INSERT INTO files (project_id, file_name, mime_type, size, uploaded_by, file_data, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *", [project_id, file_name, mime_type, size, uploaded_by_id, file_data, new Date()]);
    return result.rows[0]
}

// task files querys
export const uploadFileForTaskQuery = async (project_id: string, file_name: string, mime_type: string, size: number, uploaded_by_id: number, task_id: string, file_data?: Buffer) => {
    const result = await pool.query("INSERT INTO files (project_id, file_name, mime_type, size, uploaded_by, task_id, file_data, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *", [project_id, file_name, mime_type, size, uploaded_by_id, task_id, file_data, new Date()]);
    return result.rows[0]
}

export const getAllFilesForTaskQuery = async (taskId: string) => {
    const result = await pool.query("SELECT * FROM files WHERE task_id = $1", [taskId]); // send a query to the database with one of the open connection from the pool
    return result.rows
}

// basic files querys
export const getFileByIdQuery = async (id: string) => {
    const result = await pool.query("SELECT * FROM files WHERE id = $1", [id]); // send a query to the database with one of the open connection from the pool
    return result.rows[0]
}

export const downloadFileQuery = async (id: string) => {
    const result = await pool.query("SELECT file_data, file_name, mime_type FROM files WHERE id = $1", [id]); // send a query to the database with one of the open connection from the pool
    return result.rows[0]
}

export const deleteFileQuery = async (id: string) => {
    await pool.query("DELETE FROM files WHERE id = $1 RETURNING *", [id]); // send a query to the database with one of the open connection from the pool
}