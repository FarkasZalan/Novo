import pool from "../config/db";
import { addUserToProjectQuery } from "./projectMemberModel";
import { getBlockedTaskCountForProjectQuery, getCompletedTaskCountForProjectQuery, getInProgressTaskCountForProjectQuery, getTaskCountForProjectQuery } from "./task.Model";

export const getAllProjectForUsersQuery = async (userId: string) => {
    const result = await pool.query(`SELECT * FROM projects JOIN project_members ON projects.id = project_members.project_id WHERE project_members.user_id = $1 ORDER BY projects.updated_at DESC`, [userId]);
    return result.rows;
};

export const getProjectByIdQuery = async (id: string) => {
    const result = await pool.query("SELECT * FROM projects WHERE id = $1", [id]);
    return result.rows[0];
}

// Returning * = return all rows that was affected by the query e.g if one user was created, updated or deleted then it will return with that row from the database
export const createProjectQuery = async (name: string, description: string, owner_id: string) => {
    const result = await pool.query("INSERT INTO projects (name, description, owner_id, updated_at) VALUES ($1, $2, $3, $4) RETURNING *", [name, description, owner_id, new Date()]);
    await addUserToProjectQuery(result.rows[0].id, owner_id, 'owner', name);
    return result.rows[0];
}

export const updateProjectQuery = async (name: string, description: string, id: string) => {
    const result = await pool.query("UPDATE projects SET name = $1 , description = $2, updated_at = $3 WHERE id = $4 RETURNING *", [name, description, new Date(), id]);
    return result.rows[0];
}

export const getPremiumProjectsQuery = async (userId: string) => {
    const result = await pool.query("SELECT * FROM projects WHERE owner_id = $1 AND is_premium = true", [userId]);
    return result.rows;
}

export const updateProjectReadOnlyQuery = async (id: string, read_only: boolean) => {
    await pool.query("UPDATE projects SET read_only = $1, updated_at = $2 WHERE id = $3 RETURNING *", [read_only, new Date(), id]);
}

export const recalculateProjectStatus = async (project_id: string) => {
    const total = await getTaskCountForProjectQuery(project_id);
    const completed = await getCompletedTaskCountForProjectQuery(project_id);
    const inProgressTaskCount = await getInProgressTaskCountForProjectQuery(project_id);
    const blockedTaskCount = await getBlockedTaskCountForProjectQuery(project_id);

    let status = 'not-started';
    if (completed === total && total > 0) {
        status = 'completed';
    } else if (inProgressTaskCount > 0 || blockedTaskCount > 0 || (completed > 0 && total > completed)) {
        status = 'in-progress';
    }

    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    await pool.query(
        `UPDATE projects SET status = $1, progress = $2, total_tasks = $3, completed_tasks = $4, updated_at = $5 WHERE id = $6`,
        [status, progress, total, completed, new Date(), project_id]
    );
};

export const recalculateTaskAttachmentsCountForProjectQuery = async (id: string) => {
    await pool.query("UPDATE projects SET attachments_count = (SELECT COUNT(*) FROM files WHERE project_id = $1 AND task_id IS NULL) WHERE id = $1 RETURNING *", [id]);
}

export const deleteProjectMemberQuery = async (project_id: string, user_id: string) => {
    const result = await pool.query("DELETE FROM project_members WHERE project_id = $1 AND user_id = $2 RETURNING *", [project_id, user_id]);
    return result.rows[0];
}

export const deleteProjectQuery = async (id: string) => {
    const result = await pool.query("DELETE FROM projects WHERE id = $1 RETURNING *", [id]);
    return result.rows[0];
}