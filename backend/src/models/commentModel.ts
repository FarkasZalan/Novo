import pool from "../config/db";

export const createCommentQuery = async (comment: string, taskId: string, author_id: string, projectId: string) => {
    const result = await pool.query("INSERT INTO comments (comment, task_id, author_id, created_at, project_id) VALUES ($1, $2, $3, $4, $5) RETURNING *", [comment, taskId, author_id, new Date(), projectId]);
    return result.rows[0];
}

export const getAllCommentsForTaskQuery = async (taskId: string) => {
    const result = await pool.query("SELECT comments.*, users.name AS author_name, users.email AS author_email FROM comments LEFT JOIN users ON users.id = comments.author_id WHERE comments.task_id = $1", [taskId]);
    return result.rows;
}

export const getCommentByIdQuery = async (commentId: string) => {
    const result = await pool.query("SELECT comments.*, users.name AS author_name, users.email AS author_email FROM comments LEFT JOIN users ON users.id = comments.author_id WHERE comments.id = $1", [commentId]);
    return result.rows[0];
}

export const updateCommentQuery = async (comment: string, commentId: string) => {
    const result = await pool.query("UPDATE comments SET comment = $1, updated_at = $3 WHERE id = $2 RETURNING *", [comment, commentId, new Date()]);
    return result.rows[0];
}

export const deleteCommentQuery = async (commentId: string) => {
    await pool.query("DELETE FROM comments WHERE id = $1 RETURNING *", [commentId]);
}