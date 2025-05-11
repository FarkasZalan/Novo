import { addDays, endOfDay } from "date-fns";
import pool from "../config/db";

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

export const createMilestoneQuery = async (procejt_Id: string, name: string, description: string, due_date: Date) => {
    const result = await pool.query("INSERT INTO milestones (project_id, name, description, due_date, created_at, all_tasks_count, completed_tasks_count) VALUES ($1, $2, $3, $4, $5, 0, 0) RETURNING *;", [procejt_Id, name, description, due_date, new Date()]); // send a query to the database with one of the open connection from the pool
    return result.rows[0]
}

export const addMilestoneToTaskQuery = async (task_id: string, milestone_id: string) => {
    const result = await pool.query("UPDATE tasks Set milestone_id = $2 WHERE id = $1 RETURNING *", [task_id, milestone_id]);
    return result.rows[0];
}

export const getAllTaskForMilestoneQuery = async (milestone_id: string) => {
    const result = await pool.query("SELECT tasks.* FROM tasks WHERE milestone_id = $1;", [milestone_id]); // send a query to the database with one of the open connection from the pool
    return result.rows
}

export const getAllTaskCountForMilestoneQuery = async (milestone_id: string) => {
    const result = await pool.query("SELECT COUNT(*) FROM tasks WHERE milestone_id = $1;", [milestone_id]); // send a query to the database with one of the open connection from the pool
    return parseInt(result.rows[0].count, 10);
}
export const getAllCOmpletedTaskCountForMilestoneQuery = async (milestone_id: string) => {
    const result = await pool.query("SELECT COUNT(*) FROM tasks WHERE milestone_id = $1 AND status = 'completed';", [milestone_id]); // send a query to the database with one of the open connection from the pool
    return parseInt(result.rows[0].count, 10);
}

export const getAllUnassignedTaskForMilestoneQuery = async (projectId: string) => {
    const result = await pool.query("SELECT tasks.* FROM tasks WHERE project_id = $1 AND milestone_id IS NULL;", [projectId]); // send a query to the database with one of the open connection from the pool
    return result.rows
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