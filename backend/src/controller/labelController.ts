import { Request, Response } from "express";
import { NextFunction } from "connect";
import { addLabelToTaskQuery, createLabelQuery, deleteLabelFromTaskQuery, deleteLabelQuery, getAllLabelForProjectQuery, getLabelsForTaskQuery, updateLabelQuery } from "../models/labelModel";

// Standardized response function
// it's a function that returns a response to the client when a request is made (CRUD operations)
const handleResponse = (res: Response, status: number, message: string, data: any) => {
    return res.status(status).json({
        status,
        message,
        data
    });
};

export const createLabel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const project_id = req.params.projectId;
        const { name, description, color } = req.body;
        const label = await createLabelQuery(name, description, project_id, color);
        handleResponse(res, 200, "Label created successfully", label);
    } catch (error: any) {
        next(error);
    }
};

export const updateLabel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const label_id = req.params.labelId;
        const { name, description, color } = req.body;
        const label = await updateLabelQuery(name, description, color, label_id);
        handleResponse(res, 200, "Label updated successfully", label);
    } catch (error: any) {
        next(error);
    }
};

export const deleteLabel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const label_id = req.params.labelId;
        await deleteLabelQuery(label_id);
        handleResponse(res, 200, "Label deleted successfully", null);
    } catch (error: any) {
        next(error);
    }
};

export const getAllLabelForProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const project_id = req.params.projectId;
        const labels = await getAllLabelForProjectQuery(project_id);
        handleResponse(res, 200, "Labels fetched successfully", labels);
    } catch (error: any) {
        next(error);
    }
};

// task label related

export const addLabelToTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { labelIds } = req.body;
        const taskId = req.params.taskId;
        const updatedTaskLabels = [];
        for (const label_id of labelIds) {
            const updateTask = await addLabelToTaskQuery(taskId, label_id);
            if (!updateTask) {
                handleResponse(res, 404, "Task not found", null);
                return;
            }
            updatedTaskLabels.push(updateTask);
        }
        handleResponse(res, 200, "Task updated successfully", updatedTaskLabels);
    } catch (error: any) {
        next(error);
    }
};

export const getAllLabelForTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const task_id = req.params.taskId;
        const labels = await getLabelsForTaskQuery(task_id);
        handleResponse(res, 200, "Labels fetched successfully", labels);
    } catch (error: any) {
        next(error);
    }
};

export const deleteLabelFromTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { taskId } = req.body;
        const label_id = req.params.labelId;
        const updateTask = await deleteLabelFromTaskQuery(taskId, label_id);
        if (!updateTask) {
            handleResponse(res, 404, "Task not found", null);
            return;
        }
        handleResponse(res, 200, "Task updated successfully", updateTask);
    } catch (error: any) {
        next(error);
    }
};