import pool from "../config/db";

export const FilterAllUnassignedTaskForMilestoneQuery = async (projectId: string, title: string) => {
    const normalizedTitle = title.trim().toLowerCase();
    const result = await pool.query("SELECT tasks.* FROM tasks WHERE project_id = $1 AND milestone_id IS NULL AND LOWER(title)  LIKE '%' || $2 || '%';", [projectId, normalizedTitle]); // send a query to the database with one of the open connection from the pool
    return result.rows
}

export const filterTaskByTitleBasedOnMilestoneQuery = async (projectId: string, milestone_id: string, title: string) => {
    const normalizedTitle = title.trim().toLowerCase();
    if (milestone_id) {
        const result = await pool.query("SELECT tasks.* FROM tasks WHERE project_id = $1 AND milestone_id = $2 AND LOWER(title)  LIKE '%' || $3 || '%'", [projectId, milestone_id, normalizedTitle]);
        return result.rows;
    } else {
        const result = await pool.query("SELECT tasks.* FROM tasks WHERE project_id = $1 AND LOWER(title)  LIKE '%' || $2 || '%'", [projectId, normalizedTitle]);
        return result.rows;
    }
}

// LOWER = ensures case sensitive
// REPLACE (..., ' ', '') = removes whitespaces
// %${name}% = 
export const filterUserByNameOrEmailQuery = async (nameOrEmail: string) => {
    const normalizedNameOrEmail = nameOrEmail.trim().toLowerCase();

    const result = await pool.query(
        `
      SELECT *
      FROM users
      WHERE LOWER(name)  LIKE '%' || $1 || '%'
         OR LOWER(email) LIKE '%' || $1 || '%'
    `,
        [normalizedNameOrEmail]
    );
    return result.rows;
};