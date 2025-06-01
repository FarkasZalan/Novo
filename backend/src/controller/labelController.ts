import { Request, Response } from "express";
import { NextFunction } from "connect";
import { createLabelQuery, deleteLabelQuery, getAllLabelForProjectQuery, getLabelQuery, getLabelsForTaskQuery, updateLabelQuery } from "../models/labelModel";
import { getProjectByIdQuery } from "../models/projectModel";

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

        const project = await getProjectByIdQuery(project_id);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        if (project.read_only) {
            handleResponse(res, 400, "Project is read-only", null);
            return;
        }

        const label = await createLabelQuery(name, description, project_id, color);
        handleResponse(res, 200, "Label created successfully", label);
    } catch (error: any) {
        next(error);
    }
};

export const updateLabel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const label_id = req.params.labelId;
        const project_id = req.params.projectId;

        const { name, description, color } = req.body;

        const project = await getProjectByIdQuery(project_id);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        if (project.read_only) {
            handleResponse(res, 400, "Project is read-only", null);
            return;
        }

        const oldLabel = await getLabelQuery(label_id);
        if (!oldLabel) {
            handleResponse(res, 404, "Label not found", null);
            return;
        }

        if (oldLabel.name === name && oldLabel.description === description && oldLabel.color === color) {
            handleResponse(res, 200, "No changes detected", oldLabel);
            return;
        }

        const label = await updateLabelQuery(name, description, color, label_id);
        handleResponse(res, 200, "Label updated successfully", label);
    } catch (error: any) {
        next(error);
    }
};

export const deleteLabel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const label_id = req.params.labelId;
        const project_id = req.params.projectId;

        const project = await getProjectByIdQuery(project_id);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        if (project.read_only) {
            handleResponse(res, 400, "Project is read-only", null);
            return;
        }

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

export const getAllLabelForTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const task_id = req.params.taskId;
        const labels = await getLabelsForTaskQuery(task_id);
        handleResponse(res, 200, "Labels fetched successfully", labels);
    } catch (error: any) {
        next(error);
    }
};
