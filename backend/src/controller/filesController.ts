import { Request, Response } from "express";
import { NextFunction } from "connect";
import { createFileQuery, deleteFileQuery, downloadFileQuery, getAllFilesQuery, getFileByIdQuery } from "../models/filesModel";
import { getProjectByIdQuery } from "../models/projectModel";

interface File {
    project_id: string;
    filename: string;
    file_path: string;
    mimetype: string;
    size: number;
    uploaded_by: string;
    description: string
}

// Standardized response function
// it's a function that returns a response to the client when a request is made (CRUD operations)
const handleResponse = (res: Response, status: number, message: string, data: any) => {
    return res.status(status).json({
        status,
        message,
        data
    });
};

export const getFilesForProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const project = await getProjectByIdQuery(req.params.projectId);

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

export const createFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = req.params.projectId;
        const { description, uploaded_by } = req.body;
        const file = req.file;

        if (!file) {
            handleResponse(res, 400, "No file uploaded", null);
            return;
        }

        const project = await getProjectByIdQuery(projectId);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        const newFile = await createFileQuery(projectId, file.originalname, file.mimetype, file.size, uploaded_by, description, file.buffer);

        handleResponse(res, 201, "File uploaded and saved to DB", newFile);
    } catch (err) {
        next(err);
    }
};

export const downloadFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const fileId = req.params.fileId;
        const file = await downloadFileQuery(fileId);

        if (!file) {
            handleResponse(res, 404, "File not found", null);
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

export const deleteFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = req.params.projectId;
        const fileId = req.params.fileId;

        const project = await getProjectByIdQuery(projectId);

        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }


        const file = await getFileByIdQuery(fileId);

        if (!file) {
            handleResponse(res, 404, "File not found", null);
            return;
        }
        await deleteFileQuery(fileId);
        handleResponse(res, 200, "File deleted successfully", file);
    } catch (error) {
        next(error);
    }
};