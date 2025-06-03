import pool from "../config/db";

export const FilterAllUnassignedTaskForMilestoneQuery = async (projectId: string, title: string, order_by: string, order: string) => {
    const normalizedTitle = title.trim().toLowerCase();

    // Validate order direction to prevent SQL injection
    const safeOrder = order.toUpperCase() === "DESC" ? "DESC" : "ASC";

    // Determine final ORDER BY clause
    let finalOrderBy = "";
    if (order_by === "priority") {
        finalOrderBy = `
            CASE
                WHEN priority = 'high' THEN 1
                WHEN priority = 'medium' THEN 2
                WHEN priority = 'low' THEN 3
                ELSE 4
            END
        `;
    } else {
        // Whitelist valid columns to avoid SQL injection
        const allowedFields = ["due_date", "title", "status", "created_at"];
        finalOrderBy = allowedFields.includes(order_by) ? order_by : "due_date";
    }

    // Query tasks
    const tasksResult = await pool.query(
        `SELECT tasks.*
         FROM tasks
         WHERE project_id = $1
           AND parent_task_id IS NULL
           AND milestone_id IS NULL
           AND LOWER(title) LIKE '%' || $2 || '%'
         ORDER BY ${finalOrderBy} ${safeOrder}, due_date ASC`,
        [projectId, normalizedTitle]
    );

    // Query subtasks
    const subtasksResult = await pool.query(
        `SELECT subtasks.*, t.id AS id, t.title AS title, t.description AS description,
                t.status AS status, t.priority AS priority, t.due_date AS due_date, t.attachments_count AS attachments_count
         FROM subtasks
         JOIN tasks t ON subtasks.subtask_id = t.id
         WHERE subtasks.task_id IN (
             SELECT id FROM tasks WHERE project_id = $1
         )`,
        [projectId]
    );

    // Combine tasks with subtasks
    const tasks = tasksResult.rows;
    const subtasks = subtasksResult.rows;

    const tasksWithSubtasks = tasks.map(task => ({
        ...task,
        subtasks: subtasks.filter(subtask => subtask.task_id === task.id)
    }));

    return tasksWithSubtasks;
};

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