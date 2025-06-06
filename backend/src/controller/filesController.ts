import { Request, Response } from "express";
import { NextFunction } from "connect";
import { uploadFileForProjectQuery, deleteFileQuery, downloadFileQuery, getAllFilesForTaskQuery, getAllFilesQuery, getFileByIdQuery, uploadFileForTaskQuery } from "../models/filesModel";
import { getProjectByIdQuery, recalculateTaskAttachmentsCountForProjectQuery } from "../models/projectModel";
import { getTaskByIdQuery, recalculateTaskAttachmentsCountForTaskQuery } from "../models/task.Model";
import { Project } from "../schemas/types/projectTyoe";

// Standardized response function
// it's a function that returns a response to the client when a request is made (CRUD operations)
const handleResponse = (res: Response, status: number, message: string, data: any) => {
    return res.status(status).json({
        status,
        message,
        data
    });
};

// project files controller functions
export const getFilesForProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const project: Project = await getProjectByIdQuery(req.params.projectId);

        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }
        const files = await getAllFilesQuery(project.id)

        handleResponse(res, 200, "Files fetched successfully", files);
    } catch (error) {
        next(error);
    }
};

export const uploadProjectFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = req.params.projectId;
        const { uploaded_by } = req.body;
        const file = req.file;

        if (!file) {
            handleResponse(res, 400, "No file uploaded", null);
            return;
        }

        const project: Project = await getProjectByIdQuery(projectId);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        if (project.read_only) {
            handleResponse(res, 400, "Project is read-only", null);
            return;
        }

        const newFile = await uploadFileForProjectQuery(projectId, file.originalname, file.mimetype, file.size, uploaded_by, file.buffer);
        await recalculateTaskAttachmentsCountForProjectQuery(projectId);

        handleResponse(res, 201, "File uploaded and saved to DB", newFile);
    } catch (err) {
        next(err);
    }
};

export const deleteFileFromProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = req.params.projectId;
        const fileId = req.params.fileId;

        const project: Project = await getProjectByIdQuery(projectId);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        if (project.read_only) {
            handleResponse(res, 400, "Project is read-only", null);
            return;
        }


        const file = await getFileByIdQuery(fileId);

        if (!file) {
            handleResponse(res, 404, "File not found", null);
            return;
        }
        await deleteFileQuery(fileId);
        await recalculateTaskAttachmentsCountForProjectQuery(projectId);
        handleResponse(res, 200, "File deleted successfully", file);
    } catch (error) {
        next(error);
    }
};

// task files controller functions
export const getAllFilesForTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const project: Project = await getProjectByIdQuery(req.params.projectId);

        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        const task = await getTaskByIdQuery(req.params.taskId);

        if (!task) {
            handleResponse(res, 404, "Task not found", null);
            return;
        }
        const taskId = req.params.taskId;
        const files = await getAllFilesForTaskQuery(taskId);

        handleResponse(res, 200, "Files fetched successfully", files);
    } catch (error) {
        next(error);
    }
}

export const uploadTaskFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = req.params.projectId;
        const { uploaded_by, task_id } = req.body;
        const file = req.file;

        if (!file) {
            handleResponse(res, 400, "No file uploaded", null);
            return;
        }

        const project: Project = await getProjectByIdQuery(projectId);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        if (project.read_only) {
            handleResponse(res, 400, "Project is read-only", null);
            return;
        }

        const task = await getTaskByIdQuery(task_id);

        if (!task) {
            handleResponse(res, 404, "Task not found", null);
            return;
        }

        const newFile = await uploadFileForTaskQuery(projectId, file.originalname, file.mimetype, file.size, uploaded_by, task_id, file.buffer);

        await recalculateTaskAttachmentsCountForTaskQuery(task_id);

        handleResponse(res, 201, "File uploaded and saved to DB", newFile);
    } catch (err) {
        next(err);
    }
};

export const deleteFileFromTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = req.params.projectId;
        const taskId = req.params.taskId;
        const fileId = req.params.fileId;

        const project: Project = await getProjectByIdQuery(projectId);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        if (project.read_only) {
            handleResponse(res, 400, "Project is read-only", null);
            return;
        }

        const task = await getTaskByIdQuery(taskId);

        if (!task) {
            handleResponse(res, 404, "Task not found", null);
            return;
        }

        const file = await getFileByIdQuery(fileId);

        if (!file) {
            handleResponse(res, 404, "File not found", null);
            return;
        }
        await deleteFileQuery(fileId);
        await recalculateTaskAttachmentsCountForTaskQuery(taskId);
        handleResponse(res, 200, "File deleted successfully", file);
    } catch (error) {
        next(error);
    }
};


// basic file controller functions
export const downloadFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const fileId = req.params.fileId;
        const projectId = req.params.projectId;

        const file = await downloadFileQuery(fileId);

        if (!file) {
            handleResponse(res, 404, "File not found", null);
            return;
        }

        const project: Project = await getProjectByIdQuery(projectId);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        if (project.read_only) {
            handleResponse(res, 400, "Project is read-only", null);
            return;
        }

        // Set the response headers
        res.setHeader("Content-Type", file.mime_type);
        res.setHeader("Content-Disposition", `attachment; filename="${file.file_name}"`);

        // Send the file data (Buffer) directly 
        res.send(file.file_data);
    } catch (error) {
        next(error);
    }
}