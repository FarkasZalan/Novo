import pool from "../config/db";
import { addUserToProjectQuery } from "./projectMemberModel";

export const getAllProjectForUsersQuery = async (userId: string) => {
    const result = await pool.query(`SELECT * FROM projects JOIN project_members ON projects.id = project_members.project_id WHERE project_members.user_id = $1`, [userId]);
    return result.rows;
};

export const getProjectByIdQuery = async (id: string) => {
    const result = await pool.query("SELECT * FROM projects WHERE id = $1", [id]);
    return result.rows[0];
}

// Returning * = return all rows that was affected by the query e.g if one user was created, updated or deleted then it will return with that row from the database
export const createProjectQuery = async (name: string, description: string, owner_id: string) => {
    const result = await pool.query("INSERT INTO projects (name, description, owner_id, updated_at) VALUES ($1, $2, $3, NOW()) RETURNING *", [name, description, owner_id]);
    await addUserToProjectQuery(result.rows[0].id, owner_id, 'owner', name);
    return result.rows[0];
}

export const updateProjectQuery = async (name: string, description: string, id: string) => {
    const result = await pool.query("UPDATE projects SET name = $1 , description = $2, updated_at = NOW() WHERE id = $3 RETURNING *", [name, description, id]);
    return result.rows[0];
}

export const deleteProjectMemberQuery = async (project_id: string, user_id: string) => {
    const result = await pool.query("DELETE FROM project_members WHERE project_id = $1 AND user_id = $2 RETURNING *", [project_id, user_id]);
    return result.rows[0];
}

export const deleteProjectQuery = async (id: string) => {
    const result = await pool.query("DELETE FROM projects WHERE id = $1 RETURNING *", [id]);
    return result.rows[0];
}