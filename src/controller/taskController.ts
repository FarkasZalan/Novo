import { Request, Response } from "express";
import { NextFunction } from "connect";
import { createTaskQuery, deleteTaskQuery, getAllTaskForProjectQuery, getTaskByIdQuery, updateTaskQuery } from "../models/task.Model";

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
        const { title, description, projectId, due_date, priority } = req.body;
        const newTask = await createTaskQuery(title, description, projectId, due_date, priority, false);
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
        const tasks = await getAllTaskForProjectQuery(projectId); // get all tasks for the project;
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
        const { title, description, projectId, due_date, priority, completed } = req.body;
        const taskId = req.params.taskId;
        const updateTask = await updateTaskQuery(title, description, projectId, due_date, priority, completed, taskId);
        if (!updateTask) {
            handleResponse(res, 404, "Task not found", null);
            return;
        }
        handleResponse(res, 200, "Task updated successfully", updateTask);
    } catch (error) {
        next(error);
    }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const taskId = req.params.taskId;
        const deletedTask = await deleteTaskQuery(taskId);
        if (!deletedTask) {
            handleResponse(res, 404, "Task not found", null);
            return;
        }
        handleResponse(res, 200, "Task deleted successfully", deletedTask);
    } catch (error) {
        next(error);
    }
};