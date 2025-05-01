import { Request, Response, NextFunction } from 'express';
import { getProjectByIdQuery } from '../models/projectModel';
import { getTaskByIdQuery } from '../models/task.Model';
import { Project } from '../schemas/projectSchema';
import { getProjectMembersQuery } from '../models/projectMemberModel';
import { getUserByIdQuery } from '../models/userModel';

// authorization for projects and tasks
export const authorizeProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requestingUserId = req.user.id;
    const projectId = req.params.projectId;

    const projectMembers = await getProjectMembersQuery(projectId);

    if (!projectMembers.find(member => member.user_id === requestingUserId)) {
        res.status(403).json({ status: 403, message: "Unauthorized" });
        return
    }

    const project: Project = await getProjectByIdQuery(projectId);

    if (!project) {
        res.status(404).json({ status: 404, message: "Project not found" });
        return
    }

    // user is authorized to access this project
    next();
}

export const authorizeProjectForOwner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requestingUserId = req.user.id;
    const projectId = req.params.projectId;

    const project: Project = await getProjectByIdQuery(projectId);

    if (!project) {
        res.status(404).json({ status: 404, message: "Project not found" });
        return
    }

    if (project.owner_id !== requestingUserId) {
        res.status(403).json({ status: 403, message: "Unauthorized" });
        return
    }

    // user is authorized to access this project
    next();
}

export const authorizeProjectForOwnerAndAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requestingUserId = req.user.id;
    const projectId = req.params.projectId;

    const project: Project = await getProjectByIdQuery(projectId);

    if (!project) {
        res.status(404).json({ status: 404, message: "Project not found" });
        return
    }

    const projectMembers = await getProjectMembersQuery(projectId);

    if (!projectMembers.find(member => member.user_id === requestingUserId && (member.role === "owner" || member.role === "admin"))) {
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

    const projectMembers = await getProjectMembersQuery(projectId);

    if (!projectMembers.find(member => member.user_id === requestingUserId)) {
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

export const authorizeTaskForOwnerAndAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requestingUserId = req.user.id;
    const { projectId, taskId } = req.params;

    const project: Project = await getProjectByIdQuery(projectId);

    if (!project) {
        res.status(404).json({ status: 404, message: "Project not found" });
        return
    }

    const projectMembers = await getProjectMembersQuery(projectId);

    if (!projectMembers.find(member => member.user_id === requestingUserId && (member.role === "owner" || member.role === "admin"))) {
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

export const authorizeAssignmentsForMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requestingUserId = req.user.id;
    const { projectId, taskId } = req.params;

    const project: Project = await getProjectByIdQuery(projectId);

    if (!project) {
        res.status(404).json({ status: 404, message: "Project not found" });
        return
    }

    const projectMembers = await getProjectMembersQuery(projectId);

    if (!projectMembers.find(member => member.user_id === requestingUserId)) {
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

export const authorizeAssignmentsForOwnerAndAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requestingUserId = req.user.id;
    const { projectId, taskId } = req.params;
    const users = req.body

    const project: Project = await getProjectByIdQuery(projectId);

    if (!project) {
        res.status(404).json({ status: 404, message: "Project not found" });
        return
    }

    const projectMembers = await getProjectMembersQuery(projectId);

    if (!projectMembers.find(member => member.user_id === requestingUserId && (member.role === "owner" || member.role === "admin"))) {
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