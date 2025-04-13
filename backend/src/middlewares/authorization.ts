import { Request, Response, NextFunction } from 'express';
import { getProjectByIdQuery } from '../models/projectModel';
import { getTaskByIdQuery } from '../models/task.Model';
import { Project } from '../schemas/projectSchema';

// authorization for projects and tasks
export const authorizeProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requestingUserId = req.user.id;
    const projectId = req.params.projectId;

    const project: Project = await getProjectByIdQuery(projectId);

    if (!project) {
        res.status(404).json({ status: 404, message: "Project not found" });
        return
    }

    // if the project owner is not the same as the requesting user
    if (project.owner_id !== requestingUserId) {
        res.status(403).json({ status: 403, message: "Unauthorized" });
        return
    }

    // user is authorized to access this project
    next();
}

export const authorizeTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requestingUserId = req.user.id;
    const { projectId, taskId } = req.params;

    const project: Project = await getProjectByIdQuery(projectId);

    if (!project) {
        res.status(404).json({ status: 404, message: "Project not found" });
        return
    }

    if (project.owner_id !== requestingUserId) {
        res.status(403).json({ status: 403, message: "Unauthorized" });
        return
    }

    const task = await getTaskByIdQuery(taskId);
    if (!task) {
        res.status(404).json({ status: 404, message: "Task not found" });
        return
    }

    // Task is owned by the user
    next();
}