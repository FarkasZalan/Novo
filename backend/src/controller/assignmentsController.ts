import { Request, Response } from "express";
import { NextFunction } from "connect";
import { createAssignmentQuery, deleteAssignmentQuery, getAssignmentsForTaskQuery } from "../models/assignmentModel";
import { getUserByIdQuery } from "../models/userModel";
import { sendTaskAssignmentEmail } from "../services/emailService";
import { getTaskByIdQuery } from "../models/task.Model";
import { getProjectById } from "./projectController";
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

export const createAssignmentMyself = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const task_id = req.params.taskId
        const project_id = req.params.projectId
        const user_id = req.user.id
        const assigned_by = req.user.id;

        const currentUser = await getUserByIdQuery(assigned_by);
        if (!currentUser) {
            handleResponse(res, 404, "User not found", null);
            return;
        }

        const newAssignment = await createAssignmentQuery(task_id, user_id, project_id, assigned_by)

        handleResponse(res, 201, "Assignment created successfully", newAssignment);
    } catch (error: Error | any) {
        next(error);
    }
};

export const createAssignmentForUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const task_id = req.params.taskId
        const project_id = req.params.projectId
        const assigned_by = req.user.id;
        const { users } = req.body;

        const currentUser = await getUserByIdQuery(assigned_by);
        if (!currentUser) {
            handleResponse(res, 404, "User not found", null);
            return;
        }

        if (!Array.isArray(users) || users.length === 0) {
            handleResponse(res, 400, "No users provided", null);
        }

        const addedUsers = [];
        const task = await getTaskByIdQuery(task_id);
        const project = await getProjectByIdQuery(project_id);

        for (const user of users) {
            const { id: user_id } = user;

            try {
                if (!user_id) {
                    handleResponse(res, 400, "No user id provided", null);
                    return;
                }

                const newAssignment = await createAssignmentQuery(task_id, user_id, project_id, assigned_by);
                if (user_id !== assigned_by) {
                    sendTaskAssignmentEmail(user.email, currentUser.name, currentUser.email, task.title, project.name, task_id, project_id, task.due_date);
                }

                addedUsers.push({ newAssignment, status: 'success' });
            } catch (error: any) {
                if (error.code === "23505") {
                    addedUsers.push({ user_id, status: "exists" });
                } else {
                    addedUsers.push({ user_id, status: "error" });
                }
            }
        }

        handleResponse(res, 201, "Assignments created successfully", addedUsers);
    } catch (error: Error | any) {
        next(error);
    }
};

export const getAllAssignmentsForTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const assignments = await getAssignmentsForTaskQuery(req.params.taskId)
        handleResponse(res, 200, "Assignments fetched successfully", assignments);
    } catch (error: any) {
        next(error);
    }
}

export const deleteAssignmentsFromTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const task_id = req.params.taskId
        const user_id = req.body.user_id
        const deleteAssignment = await deleteAssignmentQuery(task_id, user_id)
        handleResponse(res, 200, "Assignments fetched successfully", deleteAssignment);
    } catch (error: any) {
        next(error);
    }
}