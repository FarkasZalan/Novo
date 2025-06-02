import { Request, Response } from "express";
import { NextFunction } from "connect";
import { createProjectQuery, deleteProjectQuery, getAllProjectForUsersQuery, getProjectByIdQuery, updateProjectQuery } from "../models/projectModel";
import { getProjectTotalMemberCountsQuery } from "../models/projectMemberModel";
import { createLabelQuery } from "../models/labelModel";
import { DEFAULT_COLORS } from "../utils/default-colors";

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

        for (const label of DEFAULT_COLORS) {
            await createLabelQuery(label.name, label.description, newProject.id, label.color);
        }
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
        const projectsWithMembers = await Promise.all(projects.map(async (project) => {
            const memberCount = await getProjectTotalMemberCountsQuery(project.id);
            return {
                ...project,
                memberCount
            };
        }));

        handleResponse(res, 200, "Projects fetched successfully", projectsWithMembers);
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
        const projectId = req.params.projectId;

        const project = await getProjectByIdQuery(projectId);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        if (project.read_only) {
            handleResponse(res, 400, "Project is read-only", null);
            return;
        }

        if (project.name === name && project.description === description) {
            handleResponse(res, 200, "No changes detected", project);
            return;
        }

        const updateProject = await updateProjectQuery(name, description, projectId);
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
        const projectId = req.params.projectId;

        const project = await getProjectByIdQuery(projectId);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        if (project.read_only) {
            handleResponse(res, 400, "Project is read-only", null);
            return;
        }

        const deletedProject = await deleteProjectQuery(projectId);
        if (!deletedProject) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }
        handleResponse(res, 200, "Project deleted successfully", deletedProject);
    } catch (error) {
        next(error);
    }
};