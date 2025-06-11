import { Request, Response } from "express";
import { NextFunction } from "connect";
import { createCommentQuery, deleteCommentQuery, getAllCommentsForTaskQuery, getCommentByIdQuery, updateCommentQuery } from "../models/commentModel";
import { getAssignmentsForTaskQuery } from "../models/assignmentModel";
import { sendTaskCommentEmail, sendUpdatedTaskCommentEmail } from "../services/emailService";
import { getTaskByIdQuery } from "../models/task.Model";
import { getProjectByIdQuery } from "../models/projectModel";
import { getUserByIdQuery } from "../models/userModel";
import { Project } from "../schemas/types/projectTyoe";
import { User } from "../schemas/types/userType";
import { Comment } from "../schemas/types/commentType";

// Standardized response function
// it's a function that returns a response to the client when a request is made (CRUD operations)
const handleResponse = (res: Response, status: number, message: string, data: any) => {
    return res.status(status).json({
        status,
        message,
        data
    });
};

export const createComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const taskId = req.params.taskId;
        const projectId = req.params.projectId;
        const { author_id, comment } = req.body;

        const project: Project = await getProjectByIdQuery(projectId);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        if (project.read_only) {
            handleResponse(res, 400, "Project is read-only", null);
            return;
        }

        const createdComment: Comment = await createCommentQuery(comment, taskId, author_id, projectId);
        const newComment: Comment = await getCommentByIdQuery(createdComment.id);
        const projectOwner: User = await getUserByIdQuery(project.owner_id);

        if (projectOwner.is_premium) {
            const taskData = await getTaskByIdQuery(taskId);
            const projectData = await getProjectByIdQuery(projectId);
            const assignedUsers = await getAssignmentsForTaskQuery(taskId);
            for (const user of assignedUsers) {
                if (user.user_id === author_id) continue;
                sendTaskCommentEmail(user.user_email, newComment.author_name, newComment.author_email, taskData.title, projectData.name, newComment.comment, taskId, projectId);
            }
        }

        handleResponse(res, 200, "Comment created successfully", newComment);
    } catch (error: any) {
        next(error);
    }
};

export const getAllCommentsForTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const taskId = req.params.taskId;
        const comments: Comment[] = await getAllCommentsForTaskQuery(taskId);
        handleResponse(res, 200, "Comments fetched successfully", comments);
    } catch (error: any) {
        next(error);
    }
};

export const updateComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id;
        const taskId = req.params.taskId;
        const projectId = req.params.projectId;
        const { commentId, comment } = req.body;

        const project: Project = await getProjectByIdQuery(projectId);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        if (project.read_only) {
            handleResponse(res, 400, "Project is read-only", null);
            return;
        }

        const commentData: Comment = await getCommentByIdQuery(commentId);
        if (commentData.author_id !== userId) {
            handleResponse(res, 403, "You are not authorized to update this comment", null);
            return;
        }

        if (commentData.comment === comment) {
            handleResponse(res, 200, "Comment is already up to date", commentData);
            return;
        }

        const updatedComment: Comment = await updateCommentQuery(comment, commentId);

        const projectOwner: User = await getUserByIdQuery(project.owner_id);

        if (projectOwner.is_premium) {
            const taskData = await getTaskByIdQuery(taskId);
            const projectData = await getProjectByIdQuery(projectId);
            const assignedUsers = await getAssignmentsForTaskQuery(taskId);
            for (const user of assignedUsers) {
                if (user.user_id === userId) continue;
                sendUpdatedTaskCommentEmail(user.user_email, updatedComment.author_name, updatedComment.author_email, taskData.title, projectData.name, commentData.comment, comment, taskId, projectId, updatedComment.updated_at);
            }
        }

        handleResponse(res, 200, "Comment updated successfully", updatedComment);
    } catch (error: any) {
        next(error);
    }
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const commentId = req.body.commentId;
        const projectId = req.params.projectId;

        const project: Project = await getProjectByIdQuery(projectId);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        if (project.read_only) {
            handleResponse(res, 400, "Project is read-only", null);
            return;
        }
        await deleteCommentQuery(commentId);
        handleResponse(res, 200, "Comment deleted successfully", null);
    } catch (error: any) {
        next(error);
    }
};