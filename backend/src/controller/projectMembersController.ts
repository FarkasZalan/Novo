import { Request, Response } from "express";
import { NextFunction } from "connect";
import { getUserByIdQuery } from "../models/userModel";
import { inviteToProjectQuery, addUserToProjectQuery, getProjectMembersQuery, deleteUserFromProjectQuery, deletePendingUserQuery, getProjectMemberQuery, getPendingUsersQuery, getPendingUserQuery } from "../models/projectMemberModel";

// Standardized response function
// it's a function that returns a response to the client when a request is made (CRUD operations)
const handleResponse = (res: Response, status: number, message: string, data: any) => {
    return res.status(status).json({
        status,
        message,
        data
    });
};

export const addUsersToProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = req.params.projectId;
        const { users } = req.body;

        if (!Array.isArray(users) || users.length === 0) {
            handleResponse(res, 400, "No users provided", null);
        }

        const addedUsers = [];

        for (const user of users) {
            const { userId, role = "member" } = user;

            try {
                if (!userId) {
                    await inviteToProjectQuery(projectId, user.email, role);
                } else {
                    await addUserToProjectQuery(projectId, userId, role);
                }
                addedUsers.push({ userId, status: "success" });
            } catch (error: any) {
                console.log("huhhh", error);
                if (error.code === "23505") {
                    addedUsers.push({ userId, status: "exists" });
                } else {
                    addedUsers.push({ userId, status: "error" });
                }
            }
        }


        handleResponse(res, 200, "Project updated successfully", addedUsers);
    } catch (error) {
        next(error);
    }
}

export const getAllProjectMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = req.params.projectId;
        const usersFromProject = await getProjectMembersQuery(projectId);

        const users = await Promise.all(
            usersFromProject.map(async (user) => {
                const userData = await getUserByIdQuery(user.user_id);
                return { ...user, user: userData };
            })
        )
        if (!users) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        const pendingUsers = await getPendingUsersQuery(projectId);


        handleResponse(res, 200, "Project fetched successfully", [users, pendingUsers]);
    } catch (error) {
        next(error);
    }
}

export const removeUserFromProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = req.params.projectId;
        const { userId, currentUserId } = req.body

        const currentUser: any = await getProjectMemberQuery(projectId, currentUserId);

        if (!currentUser) {
            handleResponse(res, 404, "Current user not found", null);
            return;
        }

        if (currentUser.role === "owner" || currentUser.role === 'admin') {
            let inviteToRemove = await getUserByIdQuery(userId);

            if (!inviteToRemove) {
                inviteToRemove = await getPendingUserQuery(projectId, userId);

                if (!inviteToRemove) {
                    handleResponse(res, 404, "User not found", null);
                    return;
                }

                if (inviteToRemove.role === "owner") {
                    handleResponse(res, 400, "You cannot remove the project owner", null);
                    return
                }

                await deletePendingUserQuery(inviteToRemove.id);
            } else {
                if (inviteToRemove.role === "owner") {
                    handleResponse(res, 400, "You cannot remove the project owner", null);
                    return
                }
                await deleteUserFromProjectQuery(projectId, userId);
            }
        } else {
            handleResponse(res, 400, "You do not have permission to remove users from this project", null);
            return
        }
        handleResponse(res, 200, "User removed successfully", null);
    } catch (error) {
        next(error);
    }
}

export const leaveProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = req.params.projectId;
        const { userId, currentUserId } = req.body

        const currentUser: any = await getProjectMemberQuery(projectId, currentUserId);

        if (!currentUser) {
            handleResponse(res, 404, "Current user not found", null);
            return;
        }

        if (currentUser.role === "owner") {
            handleResponse(res, 400, "You cannot leave your own project, you must delete it", null);
            return
        }

        await deleteUserFromProjectQuery(projectId, userId);
        handleResponse(res, 200, "User removed successfully", null);
    } catch (error) {
        next(error);
    }
}