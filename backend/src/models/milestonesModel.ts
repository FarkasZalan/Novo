import { addDays, endOfDay } from "date-fns";
import pool from "../config/db";
import { getLabelsForTaskQuery } from "./labelModel";

export const getAllMilestoneForReminderQuery = async () => {

    const today = new Date();
    const tomorrowEnd = endOfDay(addDays(today, 1));
    const result = await pool.query("SELECT * FROM milestones WHERE due_date < $1", [tomorrowEnd]);
    return result.rows;
}

export const getAllMilestonesForProjectQuery = async (procejt_Id: string) => {
    const result = await pool.query("SELECT * FROM milestones WHERE project_id = $1;", [procejt_Id]); // send a query to the database with one of the open connection from the pool
    return result.rows
}

export const getMilestoneByIdQuery = async (id: string) => {
    const result = await pool.query("SELECT * FROM milestones WHERE id = $1;", [id]); // send a query to the database with one of the open connection from the pool
    return result.rows[0]
}

export const createMilestoneQuery = async (procejt_Id: string, name: string, description: string, due_date: Date, color: string) => {
    const result = await pool.query("INSERT INTO milestones (project_id, name, description, due_date, created_at, all_tasks_count, completed_tasks_count, color) VALUES ($1, $2, $3, $4, $5, 0, 0, $6) RETURNING *;", [procejt_Id, name, description, due_date, new Date(), color]); // send a query to the database with one of the open connection from the pool
    return result.rows[0]
}

export const addMilestoneToTaskQuery = async (task_id: string, milestone_id: string) => {
    const result = await pool.query("UPDATE tasks Set milestone_id = $2 WHERE id = $1 RETURNING *", [task_id, milestone_id]);
    return result.rows[0];
}

export const getAllTaskForMilestoneWithSubtasksQuery = async (id: string, order_by: string, order: string, milestone_id: string) => {
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
    const tasksResult = await pool.query("SELECT tasks.*, milestones.name AS milestone_name, milestones.color AS milestone_color FROM tasks LEFT JOIN milestones ON tasks.milestone_id = milestones.id  WHERE tasks.milestone_id = $2 AND tasks.project_id = $1 ORDER BY " + finalOrderBy + " " + order + ", due_date ASC", [id, milestone_id]); // send a query to the database with one of the open connection from the pool

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

export const getAllTaskCountForMilestoneQuery = async (milestone_id: string) => {
    const result = await pool.query("SELECT COUNT(*) FROM tasks WHERE milestone_id = $1;", [milestone_id]); // send a query to the database with one of the open connection from the pool
    return parseInt(result.rows[0].count, 10);
}
export const getAllCOmpletedTaskCountForMilestoneQuery = async (milestone_id: string) => {
    const result = await pool.query("SELECT COUNT(*) FROM tasks WHERE milestone_id = $1 AND status = 'completed';", [milestone_id]); // send a query to the database with one of the open connection from the pool
    return parseInt(result.rows[0].count, 10);
}

export const getAllUnassignedTaskForMilestoneQuery = async (id: string, order_by: string, order: string) => {
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
    const tasksResult = await pool.query("SELECT tasks.* FROM tasks WHERE tasks.milestone_id IS NULL AND tasks.parent_task_id IS NULL AND tasks.project_id = $1 ORDER BY " + finalOrderBy + " " + order + ", due_date ASC", [id]); // send a query to the database with one of the open connection from the pool

    const subtasksResult = await pool.query(
        `SELECT subtasks.*, t.id AS id, t.title AS title, t.description AS description,
                t.status AS status, t.priority AS priority, t.due_date AS due_date, t.attachments_count AS attachments_count
         FROM subtasks
         JOIN tasks t ON subtasks.subtask_id = t.id
         WHERE subtasks.task_id IN (
             SELECT id FROM tasks WHERE project_id = $1
         )`,
        [id]
    )

    // Combine tasks with their subtasks
    const tasks = tasksResult.rows;
    const subtasks = subtasksResult.rows;

    const tasksWithSubtasks = tasks.map(task => {
        return {
            ...task,
            subtasks: subtasks.filter(subtask => subtask.task_id === task.id)
        };
    });

    return tasksWithSubtasks;
}

export const deleteMilestoneFromTaskQuery = async (task_id: string) => {
    const result = await pool.query("UPDATE tasks Set milestone_id = NULL WHERE id = $1 RETURNING *", [task_id]);
    return result.rows[0];
}

export const updateMilestoneQuery = async (id: string, name: string, description: string, due_date: Date) => {
    const result = await pool.query("UPDATE milestones SET name = $1, description = $2, due_date = $3 WHERE id = $4 RETURNING *", [name, description, due_date, id]); // send a query to the database with one of the open connection from the pool
    return result.rows[0]
}

export const recalculateCompletedTasksInMilestoneQuery = async (project_id: string, milestone_id: string) => {
    await pool.query(
        "UPDATE milestones SET completed_tasks_count = (SELECT COUNT(*) FROM tasks WHERE project_id = $1 AND milestone_id = $2 AND status = 'completed') WHERE id = $2 AND project_id = $1",
        [project_id, milestone_id]
    );
}

export const recalculateAllTasksInMilestoneQuery = async (project_id: string, milestone_id: string) => {
    await pool.query(
        "UPDATE milestones SET all_tasks_count = (SELECT COUNT(*) FROM tasks WHERE project_id = $1 AND milestone_id = $2) WHERE id = $2 AND project_id = $1",
        [project_id, milestone_id]
    );
}

export const deleteMilestoneQuery = async (id: string) => {
    const result = await pool.query("DELETE FROM milestones WHERE id = $1;", [id]); // send a query to the database with one of the open connection from the pool
    return result.rows[0]
}