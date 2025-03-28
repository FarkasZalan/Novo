import pool from "../config/db";

export const getAllProjectForUsersQuery = async (id: string) => {
    const result = await pool.query("SELECT * FROM projects WHERE user_id = $1", [id]); // send a query to the database with one of the open connection from the pool
    return result.rows
}

export const getProjectByIdQuery = async (id: string) => {
    const result = await pool.query("SELECT * FROM projects WHERE id = $1", [id]);
    return result.rows[0];
}

// Returning * = return all rows that was affected by the query e.g if one user was created, updated or deleted then it will return with that row from the database
export const createProjectQuery = async (name: string, description: string, user_id: string) => {
    const result = await pool.query("INSERT INTO projects (name, description, user_id, updated_at) VALUES ($1, $2, $3, NOW()) RETURNING *", [name, description, user_id]);
    return result.rows[0];
}

export const updateProjectQuery = async (name: string, description: string, id: string) => {
    const result = await pool.query("UPDATE projects SET name = $1 , description = $2, updated_at = NOW() WHERE id = $3 RETURNING *", [name, description, id]);
    return result.rows[0];
}

export const deleteProjectQuery = async (id: string) => {
    const result = await pool.query("DELETE FROM projects WHERE id = $1 RETURNING *", [id]);
    return result.rows[0];
}