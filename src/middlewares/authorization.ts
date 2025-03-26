import { Request, Response, NextFunction } from 'express';
import { getProjectByIdService } from '../models/projectModel';
import { getTaskByIdService } from '../models/task.Model';

// make authorization
export const authorizeProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requestingUserId = req.user.id;
    const projectId = req.params.projectId;

    const project: any = await getProjectByIdService(projectId);

    if (!project) {
        res.status(404).json({ status: 404, message: "Project not found" });
        return
    }

    if (project.user_id !== requestingUserId) {
        res.status(403).json({ status: 403, message: "Unauthorized" });
        return
    }

    // user is authorized to access this project
    next();
}

export const authorizeTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requestingUserId = req.user.id;
    const { projectId, taskId } = req.params;

    const project: any = await getProjectByIdService(projectId);

    if (!project) {
        res.status(404).json({ status: 404, message: "Project not found" });
        return
    }

    console.log(project.user_id, requestingUserId);
    if (project.user_id !== requestingUserId) {
        res.status(403).json({ status: 403, message: "Unauthorized" });
        return
    }

    const task = await getTaskByIdService(taskId);
    if (!task) {
        res.status(404).json({ status: 404, message: "Task not found" });
        return
    }

    // Task is owned by the user
    next();
}