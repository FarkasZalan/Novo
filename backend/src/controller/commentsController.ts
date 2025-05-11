import { Request, Response } from "express";
import { NextFunction } from "connect";
import { createCommentQuery, deleteCommentQuery, getAllCommentsForTaskQuery, getCommentByIdQuery, updateCommentQuery } from "../models/commentModel";

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
        const { author_id, comment } = req.body;
        const createdComment = await createCommentQuery(comment, taskId, author_id);
        const newComment = await getCommentByIdQuery(createdComment.id);
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
        const { commentId, comment } = req.body;

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
        await deleteCommentQuery(commentId);
        handleResponse(res, 200, "Comment deleted successfully", null);
    } catch (error: any) {
        next(error);
    }
};