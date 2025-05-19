import { Request, Response } from "express";
import { NextFunction } from "connect";
import { createCommentQuery, deleteCommentQuery, getAllCommentsForTaskQuery, getCommentByIdQuery, updateCommentQuery } from "../models/commentModel";
import { getAssignmentsForTaskQuery } from "../models/assignmentModel";
import { sendTaskCommentEmail } from "../services/emailService";
import { getTaskByIdQuery } from "../models/task.Model";
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

export const createComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const taskId = req.params.taskId;
        const projectId = req.params.projectId;
        const { author_id, comment } = req.body;

        const project = await getProjectByIdQuery(projectId);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        if (project.read_only) {
            handleResponse(res, 400, "Project is read-only", null);
            return;
        }

        const createdComment = await createCommentQuery(comment, taskId, author_id);
        const newComment = await getCommentByIdQuery(createdComment.id);

        const taskData = await getTaskByIdQuery(taskId);
        const projectData = await getProjectByIdQuery(projectId);
        const assignedUsers = await getAssignmentsForTaskQuery(taskId);
        for (const user of assignedUsers) {
            if (user.user_id === author_id) continue;
            sendTaskCommentEmail(user.user_email, newComment.author_name, newComment.author_email, taskData.title, projectData.name, newComment.comment, taskId, projectId);
        }
        handleResponse(res, 200, "Comment created successfully", newComment);
    } catch (error: any) {
        next(error);
    }
};

export const getAllCommentsForTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const taskId = req.params.taskId;
        const comments = await getAllCommentsForTaskQuery(taskId);
        handleResponse(res, 200, "Comments fetched successfully", comments);
    } catch (error: any) {
        next(error);
    }
};

export const updateComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id;
        const projectId = req.params.projectId;
        const { commentId, comment } = req.body;

        const project = await getProjectByIdQuery(projectId);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        if (project.read_only) {
            handleResponse(res, 400, "Project is read-only", null);
            return;
        }

        const commentData = await getCommentByIdQuery(commentId);
        if (commentData.author_id !== userId) {
            handleResponse(res, 403, "You are not authorized to update this comment", null);
            return;
        }
        const updatedComment = await updateCommentQuery(comment, commentId);
        const updatedCommentData = await getCommentByIdQuery(updatedComment.id);
        handleResponse(res, 200, "Comment updated successfully", updatedCommentData);
    } catch (error: any) {
        next(error);
    }
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const commentId = req.body.commentId;
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
        await deleteCommentQuery(commentId);
        handleResponse(res, 200, "Comment deleted successfully", null);
    } catch (error: any) {
        next(error);
    }
};