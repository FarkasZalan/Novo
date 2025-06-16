import { Request, Response, NextFunction } from 'express';
import { getProjectByIdQuery } from '../models/projectModel';
import { getTaskByIdQuery } from '../models/task.Model';
import { Project } from '../schemas/projectSchema';
import { getProjectMembersQuery } from '../models/projectMemberModel';
import { Task } from '../schemas/types/taskType';
import { ProjectMember } from '../schemas/types/projectMemberType';

// authorization for projects and tasks
export const authorizeProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requestingUserId = req.user.id;
    const projectId = req.params.projectId;

    const projectMembers = await getProjectMembersQuery(projectId);

    if (!projectMembers.find((member: ProjectMember) => member.user_id === requestingUserId)) {
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

    // user is the owner of this project (for change or delete the project)
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

    if (!projectMembers.find((member: ProjectMember) => member.user_id === requestingUserId && (member.role === "owner" || member.role === "admin"))) {
        res.status(403).json({ status: 403, message: "Unauthorized" });
        return
    }

    // user is authorized to access this project - owner or admin (for add new users, tasks, files...)
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

    if (!projectMembers.find((member: ProjectMember) => member.user_id === requestingUserId)) {
        res.status(403).json({ status: 403, message: "Unauthorized" });
        return
    }

    const task: Task = await getTaskByIdQuery(taskId);
    if (!task) {
        res.status(404).json({ status: 404, message: "Task not found" });
        return
    }

    // user is authorized to access this task
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

    if (!projectMembers.find((member: ProjectMember) => member.user_id === requestingUserId && (member.role === "owner" || member.role === "admin"))) {
        res.status(403).json({ status: 403, message: "Unauthorized" });
        return
    }

    const task: Task = await getTaskByIdQuery(taskId);
    if (!task) {
        res.status(404).json({ status: 404, message: "Task not found" });
        return
    }

    // user is authorized to access this task - owner or admin(create, update, delete...)
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

    if (!projectMembers.find((member: ProjectMember) => member.user_id === requestingUserId)) {
        res.status(403).json({ status: 403, message: "Unauthorized" });
        return
    }

    const task: Task = await getTaskByIdQuery(taskId);
    if (!task) {
        res.status(404).json({ status: 404, message: "Task not found" });
        return
    }

    // user is authorized to access this task (assign myself, unassign myself)
    next();
}

export const authorizeAssignmentsForOwnerAndAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requestingUserId = req.user.id;
    const { projectId, taskId } = req.params;

    const project: Project = await getProjectByIdQuery(projectId);

    if (!project) {
        res.status(404).json({ status: 404, message: "Project not found" });
        return
    }

    const projectMembers = await getProjectMembersQuery(projectId);

    if (!projectMembers.find((member: ProjectMember) => member.user_id === requestingUserId && (member.role === "owner" || member.role === "admin"))) {
        res.status(403).json({ status: 403, message: "Unauthorized" });
        return
    }

    const task = await getTaskByIdQuery(taskId);
    if (!task) {
        res.status(404).json({ status: 404, message: "Task not found" });
        return
    }

    // user is authorized to access this task - owner or admin (assign others, unassign others)
    next();
}