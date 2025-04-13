import { Request, Response } from "express";
import { NextFunction } from "connect";
import { createProjectQuery, deleteProjectQuery, getAllProjectForUsersQuery, getProjectByIdQuery, updateProjectQuery } from "../models/projectModel";

// Standardized response function
// it's a function that returns a response to the client when a request is made (CRUD operations)
const handleResponse = (res: Response, status: number, message: string, data: any) => {
    return res.status(status).json({
        status,
        message,
        data
    });
};

export const createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, description, ownerId } = req.body;
        const newProject = await createProjectQuery(name, description, ownerId);
        handleResponse(res, 201, "Project created successfully", newProject);
    } catch (error: Error | any) {
        // Check for unique constraint violation (duplicate email)
        if (error.code === "23505") {
            handleResponse(res, 409, "Project already exists", null);
        } else {
            // Pass other errors to the next middleware (errorHandling middleware)
            next(error);
        }
    }
};

export const getAllProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const ownerId = req.user.id;
        const projects = await getAllProjectForUsersQuery(ownerId); // get all projects for the user;
        handleResponse(res, 200, "Projects fetched successfully", projects);
    } catch (error) {
        next(error);
    }
};

export const getProjectById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const project = await getProjectByIdQuery(req.params.projectId);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }
        handleResponse(res, 200, "Project fetched successfully", project);
    } catch (error) {
        next(error);
    }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, description } = req.body;
        const procejtId = req.params.projectId;
        const updateProject = await updateProjectQuery(name, description, procejtId);
        if (!updateProject) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }
        handleResponse(res, 200, "Project updated successfully", updateProject);
    } catch (error) {
        next(error);
    }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const procejtId = req.params.projectId;
        const deletedProject = await deleteProjectQuery(procejtId);
        if (!deletedProject) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }
        handleResponse(res, 200, "Project deleted successfully", deletedProject);
    } catch (error) {
        next(error);
    }
};