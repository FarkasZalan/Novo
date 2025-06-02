import { addDays, endOfDay } from "date-fns";
import pool from "../config/db";
import { getLabelsForTaskQuery } from "../models/labelModel";

export const getAllTaskForReminderQuery = async () => {
    const today = new Date();
    const tomorrowEnd = endOfDay(addDays(today, 1));
    const result = await pool.query("SELECT * FROM tasks WHERE status != 'completed' AND due_date < $1", [tomorrowEnd]);
    return result.rows;
}

export const getTaskNameForLogsQuery = async (id: string) => {
    const result = await pool.query("SELECT title FROM tasks WHERE id = $1", [id]); // send a query to the database with one of the open connection from the pool
    return result.rows[0]?.title;
}

export const getAllTaskForProjectQuery = async (id: string, order_by: string, order: string) => {
    let finalOrderBy = "";

    if (order_by === "priority") {
        finalOrderBy = `
        CASE
            WHEN priority = 'high' THEN 1
            WHEN priority = 'medium' THEN 2
            WHEN priority = 'low' THEN 3
            ELSE 4
        END
        `
    } else {
        finalOrderBy = order_by
    }
    const tasksResult = await pool.query("SELECT tasks.*, milestones.name AS milestone_name, milestones.color AS milestone_color FROM tasks LEFT JOIN milestones ON tasks.milestone_id = milestones.id  WHERE tasks.project_id = $1 ORDER BY " + finalOrderBy + " " + order + ", due_date ASC", [id]); // send a query to the database with one of the open connection from the pool

    const subtasksResult = await pool.query(
        `SELECT subtasks.*, t.id AS id, t.title AS title, t.description AS description,
                t.status AS status, t.priority AS priority, t.due_date AS due_date, t.attachments_count AS attachments_count,
                m.name AS milestone_name, m.id AS milestone_id, m.color AS milestone_color
         FROM subtasks
         JOIN tasks t ON subtasks.subtask_id = t.id
         LEFT JOIN milestones m ON t.milestone_id = m.id
         WHERE subtasks.task_id IN (
             SELECT id FROM tasks WHERE project_id = $1
         )`,
        [id]
    )

    // Combine tasks with their subtasks
    const tasks = tasksResult.rows;
    const subtasks = subtasksResult.rows;

    for (const subtask of subtasks) {
        subtask.labels = await getLabelsForTaskQuery(subtask.id);
    }

    const tasksWithSubtasks = tasks.map(task => {
        return {
            ...task,
            subtasks: subtasks.filter(subtask => subtask.task_id === task.id)
        };
    });

    return tasksWithSubtasks;
}

export const getAllTaskForProjectWithNoParentQuery = async (id: string, order_by: string, order: string) => {
    let finalOrderBy = "";

    if (order_by === "priority") {
        finalOrderBy = `
        CASE
            WHEN priority = 'high' THEN 1
            WHEN priority = 'medium' THEN 2
            WHEN priority = 'low' THEN 3
            ELSE 4
        END
        `
    } else {
        finalOrderBy = order_by
    }
    const tasksResult = await pool.query("SELECT tasks.*, milestones.name AS milestone_name, milestones.color AS milestone_color FROM tasks LEFT JOIN milestones ON tasks.milestone_id = milestones.id  WHERE tasks.parent_task_id IS NULL AND tasks.project_id = $1 ORDER BY " + finalOrderBy + " " + order + ", due_date ASC", [id]); // send a query to the database with one of the open connection from the pool

    const subtasksResult = await pool.query(
        `SELECT subtasks.*, t.id AS id, t.title AS title, t.description AS description,
                t.status AS status, t.priority AS priority, t.due_date AS due_date, t.attachments_count AS attachments_count,
                m.name AS milestone_name, m.id AS milestone_id, m.color AS milestone_color
         FROM subtasks
         JOIN tasks t ON subtasks.subtask_id = t.id
         LEFT JOIN milestones m ON t.milestone_id = m.id
         WHERE subtasks.task_id IN (
             SELECT id FROM tasks WHERE project_id = $1
         )`,
        [id]
    )

    // Combine tasks with their subtasks
    const tasks = tasksResult.rows;
    const subtasks = subtasksResult.rows;

    for (const subtask of subtasks) {
        subtask.labels = await getLabelsForTaskQuery(subtask.id);
    }

    const tasksWithSubtasks = tasks.map(task => {
        return {
            ...task,
            subtasks: subtasks.filter(subtask => subtask.task_id === task.id)
        };
    });

    return tasksWithSubtasks;
}

export const getTaskByIdQuery = async (id: string) => {
    const tasksResult = await pool.query("SELECT tasks.*, milestones.name AS milestone_name, milestones.color AS milestone_color FROM tasks LEFT JOIN milestones ON tasks.milestone_id = milestones.id WHERE tasks.id = $1", [id]);

    const subtasksResult = await pool.query(
        `SELECT subtasks.*, t.id AS id, t.title AS title, t.description AS description,
                t.status AS status, t.priority AS priority, t.due_date AS due_date, t.attachments_count AS attachments_count,
                m.name AS milestone_name, m.id AS milestone_id, m.color AS milestone_color
         FROM subtasks
         JOIN tasks t ON subtasks.subtask_id = t.id
         LEFT JOIN milestones m ON t.milestone_id = m.id
         WHERE subtasks.task_id = $1`,
        [id]
    )

    const tasks = tasksResult.rows;
    const subtasks = subtasksResult.rows;

    for (const subtask of subtasks) {
        subtask.labels = await getLabelsForTaskQuery(subtask.id);
    }

    const tasksWithSubtasks = tasks.map(task => {
        return {
            ...task,
            subtasks: subtasks.filter(subtask => subtask.task_id === task.id)
        };
    });

    return tasksWithSubtasks[0];
}

export const getSubtasksForTaskQuery = async (id: string) => {
    const result = await pool.query("SELECT subtasks.*, m.id as milestone_id FROM subtasks JOIN tasks t ON subtasks.subtask_id = t.id LEFT JOIN milestones m ON t.milestone_id = m.id WHERE subtasks.task_id = $1", [id]);
    return result.rows;
}

// Returning * = return all rows that was affected by the query e.g if one user was created, updated or deleted then it will return with that row from the database
export const createTaskQuery = async (title: string, description: string, project_id: string, due_date: Date, priority: string, status: string, parent_task_id?: string) => {
    const result = await pool.query("INSERT INTO tasks (title, description, project_id, due_date, priority, updated_at, status, parent_task_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *", [title, description, project_id, due_date, priority, new Date(), status, parent_task_id]);
    return result.rows[0];
}

export const updateTaskQuery = async (title: string, description: string, project_id: string, due_date: Date, priority: string, id: string, status: string) => {
    const result = await pool.query("UPDATE tasks SET title = $1, description = $2, project_id = $3, due_date = $4, priority = $5, updated_at =$6, status = $7 WHERE id = $8 RETURNING *", [title, description, project_id, due_date, priority, new Date(), status, id]);
    return result.rows[0];
}

export const updateTaskStatusQuery = async (status: string, id: string) => {
    const result = await pool.query("UPDATE tasks SET status = $1, updated_at = $2 WHERE id = $3 RETURNING *", [status, new Date(), id]);
    return result.rows[0];
}

export const addSubtaskToTaskQuery = async (task_id: string, subtask_id: string) => {
    const result = await pool.query("INSERT INTO subtasks (task_id, subtask_id) VALUES ($1, $2) RETURNING *", [task_id, subtask_id]);
    return result.rows[0];
}

export const getParentTaskForSubtaskQuery = async (subtask_id: string) => {
    const result = await pool.query("SELECT task_id FROM subtasks WHERE subtask_id = $1", [subtask_id]);
    return result.rows[0]?.task_id.toString();
}

export const removeSubtaskFromTaskQuery = async (task_id: string, subtask_id: string) => {
    const result = await pool.query("DELETE FROM subtasks WHERE task_id = $1 AND subtask_id = $2 RETURNING *", [task_id, subtask_id]);
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

export const getBlockedTaskCountForProjectQuery = async (id: string) => {
    const result = await pool.query("SELECT COUNT(*) FROM tasks WHERE project_id = $1 AND status = 'blocked'", [id]);
    return parseInt(result.rows[0].count, 10);
}

export const recalculateTaskAttachmentsCountForTaskQuery = async (id: string) => {
    await pool.query("UPDATE tasks SET attachments_count = (SELECT COUNT(*) FROM files WHERE task_id = $1) WHERE id = $1 RETURNING *", [id]);
}

export const deleteTaskQuery = async (id: string) => {
    const result = await pool.query("DELETE FROM tasks WHERE id = $1 RETURNING *", [id]);
    return result.rows[0];
}
