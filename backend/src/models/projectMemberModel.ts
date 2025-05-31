import pool from "../config/db";

export const addUserToProjectQuery = async (project_id: string, user_id: string, role: string, inviter_name: string, inviter_user_id: string) => {
    await pool.query("INSERT INTO project_members (project_id, user_id, role, inviter_name, inviter_user_id) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (project_id, user_id) DO NOTHING RETURNING *", [project_id, user_id, role, inviter_name, inviter_user_id]);
}

export const inviteToProjectQuery = async (project_id: string, email: string, role: string, inviter_name: string, inviter_user_id: string) => {
    await pool.query("INSERT INTO pending_project_invitations (project_id, email, role, inviter_name, inviter_user_id) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (project_id, email) DO NOTHING RETURNING *", [project_id, email, role, inviter_name, inviter_user_id]);
}

export const getPendingUsersQuery = async (project_id: string) => {
    const result = await pool.query("SELECT * FROM pending_project_invitations WHERE project_id = $1", [project_id]); // send a query to the database with one of the open connection from the pool
    return result.rows
}

export const getPendingUserQuery = async (project_id: string, user_id: string) => {
    const result = await pool.query("SELECT * FROM pending_project_invitations WHERE project_id = $1 AND id = $2", [project_id, user_id]); // send a query to the database with one of the open connection from the pool
    return result.rows[0]
}

export const getPendingProjectsForPendingUserByEmailQuery = async (email: string) => {
    const result = await pool.query("SELECT * FROM pending_project_invitations WHERE email = $1", [email]); // send a query to the database with one of the open connection from the pool
    return result.rows
}

export const getProjectMembersQuery = async (project_id: string) => {
    const result = await pool.query("SELECT * FROM project_members WHERE project_id = $1", [project_id]); // send a query to the database with one of the open connection from the pool
    return result.rows
}

export const getProjectMemberQuery = async (project_id: string, user_id: string) => {
    const result = await pool.query("SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2", [project_id, user_id]); // send a query to the database with one of the open connection from the pool
    return result.rows[0]
}

// count the active project members and pending invitations with the same project id
export const getProjectTotalMemberCountsQuery = async (project_id: string) => {
    const result = await pool.query(`
        SELECT 
        (
            SELECT COUNT(*) FROM project_members WHERE project_id = $1 
        ) + (
            SELECT COUNT(*) FROM pending_project_invitations WHERE project_id = $1
        ) AS total_member_count`,
        [project_id]); // send a query to the database with one of the open connection from the pool
    return parseInt(result.rows[0].total_member_count, 10)
}

export const updateProjectMemberRoleQuery = async (project_id: string, user_id: string, role: string) => {
    await pool.query("UPDATE project_members SET role = $1 WHERE project_id = $2 AND user_id = $3 RETURNING *", [role, project_id, user_id]);
}

export const updatePendingUserRoleQuery = async (invite_id: string, role: string) => {
    await pool.query("UPDATE pending_project_invitations SET role = $1 WHERE id = $2 RETURNING *", [role, invite_id]);
}

export const deleteUserFromProjectQuery = async (project_id: string, user_id: string) => {
    await pool.query("DELETE FROM project_members WHERE project_id = $1 AND user_id = $2 RETURNING *", [project_id, user_id]);
}

export const deletePendingUserQuery = async (invite_id: string) => {
    await pool.query("DELETE FROM pending_project_invitations WHERE id = $1 RETURNING*", [invite_id]);
}