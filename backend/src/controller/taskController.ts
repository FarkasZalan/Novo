import { Request, Response } from "express";
import { NextFunction } from "connect";
import { createTaskQuery, deleteTaskQuery, getAllTaskForProjectQuery, getCompletedTaskCountForProjectQuery, getInProgressTaskCountForProjectQuery, getTaskByIdQuery, getTaskCountForProjectQuery, updateTaskQuery, updateTaskStatusQuery } from "../models/task.Model";
import { recalculateProjectStatus } from "../models/projectModel";
import { recalculateAllTasksInMilestoneQuery, recalculateCompletedTasksInMilestoneQuery } from "../models/milestonesModel";

// Standardized response function
// it's a function that returns a response to the client when a request is made (CRUD operations)
const handleResponse = (res: Response, status: number, message: string, data: any) => {
    return res.status(status).json({
        status,
        message,
        data
    });
};

export const createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = req.params.projectId;
        const { title, description, due_date, priority, status } = req.body;
        const newTask = await createTaskQuery(title, description, projectId, due_date, priority, status);

        if (newTask.milestone_id) {
            await recalculateAllTasksInMilestoneQuery(projectId, newTask.milestone_id)
            await recalculateCompletedTasksInMilestoneQuery(projectId, newTask.milestone_id)
        }
        await recalculateProjectStatus(projectId);
        handleResponse(res, 201, "Task created successfully", newTask);
    } catch (error: Error | any) {
        // Check for unique constraint violation (duplicate email)
        if (error.code === "23505") {
            handleResponse(res, 409, "Task already exists", null);
        } else {
            // Pass other errors to the next middleware (errorHandling middleware)
            next(error);
        }
    }
};

export const getAllTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = req.params.projectId;
        const orderBy = typeof req.query.order_by === 'string' ? req.query.order_by : "updated_at";
        const order = typeof req.query.order === 'string' ? req.query.order : "desc";
        const tasks = await getAllTaskForProjectQuery(projectId, orderBy, order); // get all tasks for the project;
        handleResponse(res, 200, "Tasks fetched successfully", tasks);
    } catch (error) {
        next(error);
    }
};

export const getTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const task = await getTaskByIdQuery(req.params.taskId);
        if (!task) {
            handleResponse(res, 404, "Task not found", null);
            return;
        }
        handleResponse(res, 200, "Task fetched successfully", task);
    } catch (error) {
        next(error);
    }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = req.params.projectId;
        const { title, description, due_date, priority, status } = req.body;
        const taskId = req.params.taskId;

        const updateTask = await updateTaskQuery(title, description, projectId, due_date, priority, taskId, status);


        if (!updateTask) {
            handleResponse(res, 404, "Task not found", null);
            return;
        }

        if (updateTask.milestone_id) {
            await recalculateAllTasksInMilestoneQuery(projectId, updateTask.milestone_id)
            await recalculateCompletedTasksInMilestoneQuery(projectId, updateTask.milestone_id)
        }
        await recalculateProjectStatus(projectId);
        handleResponse(res, 200, "Task updated successfully", updateTask);
    } catch (error) {
        next(error);
    }
};

export const updateTaskStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = req.params.projectId;
        const taskId = req.params.taskId;
        const { status } = req.body;

        const updateTask = await updateTaskStatusQuery(status, taskId);
        if (!updateTask) {
            handleResponse(res, 404, "Task not found", null);
            return;
        }

        if (updateTask.milestone_id) {
            await recalculateAllTasksInMilestoneQuery(projectId, updateTask.milestone_id)
            await recalculateCompletedTasksInMilestoneQuery(projectId, updateTask.milestone_id)
        }
        await recalculateProjectStatus(projectId);
        handleResponse(res, 200, "Task updated successfully", updateTask);
    } catch (error) {
        next(error);
    }
}

export const getTaskCountForProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = req.params.projectId;
        const taskCount = await getTaskCountForProjectQuery(projectId);
        const completedTaskCount = await getCompletedTaskCountForProjectQuery(projectId);
        const inProgressTaskCount = await getInProgressTaskCountForProjectQuery(projectId);

        handleResponse(res, 200, "Task count fetched successfully", { taskCount, completedTaskCount, inProgressTaskCount });
    } catch (error) {
        next(error);
    }
}

export const deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const taskId = req.params.taskId;
        const projectId = req.params.projectId;
        const deletedTask = await deleteTaskQuery(taskId);
        if (!deletedTask) {
            handleResponse(res, 404, "Task not found", null);
            return;
        }

        if (deletedTask.milestone_id) {
            await recalculateAllTasksInMilestoneQuery(projectId, deletedTask.milestone_id)
            await recalculateCompletedTasksInMilestoneQuery(projectId, deletedTask.milestone_id)
        }

        await recalculateProjectStatus(projectId);
        handleResponse(res, 200, "Task deleted successfully", deletedTask);
    } catch (error) {
        next(error);
    }
};