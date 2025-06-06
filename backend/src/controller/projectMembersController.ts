import { Request, Response } from "express";
import { NextFunction } from "connect";
import { getUserByIdQuery } from "../models/userModel";
import { inviteToProjectQuery, addUserToProjectQuery, getProjectMembersQuery, deleteUserFromProjectQuery, deletePendingUserQuery, getProjectMemberQuery, getPendingUsersQuery, getPendingUserQuery, updateProjectMemberRoleQuery, updatePendingUserRoleQuery } from "../models/projectMemberModel";
import { sendProjectInviteExistingUserEmail, sendProjectInviteNewUserEmail } from "../services/emailService";
import { getProjectByIdQuery, updateProjectReadOnlyQuery } from "../models/projectModel";
import { User } from "../schemas/types/userType";
import { Project } from "../schemas/types/projectTyoe";

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
        const { users, currentUserId } = req.body;

        const currentUser: User = await getUserByIdQuery(currentUserId);

        const project: Project = await getProjectByIdQuery(projectId);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        if (project.read_only) {
            handleResponse(res, 400, "Project is read-only", null);
            return;
        }

        const owner: User = await getUserByIdQuery(project.owner_id);

        const currentProjectMembers = await getProjectMembersQuery(projectId);
        const pendingUsers = await getPendingUsersQuery(projectId);

        if (!currentUser) {
            handleResponse(res, 403, "Unauthorized", null);
            return;
        }

        if (!Array.isArray(users) || users.length === 0) {
            handleResponse(res, 400, "No users provided", null);
            return;
        }

        if (!owner.is_premium) {
            if (currentProjectMembers.length + pendingUsers.length + users.length > 6) {
                handleResponse(res, 400, "Premium error", owner);
                return;
            }
        }

        const addedUsers = [];

        for (const user of users) {
            const { id: userId, role = "member" } = user;

            try {
                if (!userId) {
                    await inviteToProjectQuery(projectId, user.email, role, currentUser.name, currentUser.id);
                    await sendProjectInviteNewUserEmail(user.email, currentUser.name, project.name, currentUser.email);
                } else {
                    await addUserToProjectQuery(projectId, userId, role, currentUser.name, currentUser.id);
                    await sendProjectInviteExistingUserEmail(user.email, currentUser.name, project.name, projectId, currentUser.email);
                }
                addedUsers.push({ userId, status: "success" });
            } catch (error: any) {
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

export const resendProjectInvite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = req.params.projectId;
        const { inviteUserId, currentUserId } = req.body.data;

        const project: Project = await getProjectByIdQuery(projectId);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        if (project.read_only) {
            handleResponse(res, 400, "Project is read-only", null);
            return;
        }

        const user: User = await getUserByIdQuery(currentUserId);

        if (!user) {
            handleResponse(res, 404, "User not found", null);
            return;
        }

        const inviteUser = await getPendingUserQuery(projectId, inviteUserId);

        if (!inviteUser) {
            handleResponse(res, 404, "Invited user not found", null);
            return;
        }

        await sendProjectInviteNewUserEmail(inviteUser.email, user.name, project.name, user.email);

        handleResponse(res, 200, "Invite resent successfully", null);
    } catch (error) {
        next(error);
    }
}

export const getAllProjectMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = req.params.projectId;
        const usersFromProject = await getProjectMembersQuery(projectId);

        const users: User[] = await Promise.all(
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

export const updateProjectMemberRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = req.params.projectId;
        const { userId, currentUserId, role } = req.body.data;

        const project: Project = await getProjectByIdQuery(projectId);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        if (project.read_only) {
            handleResponse(res, 400, "Project is read-only", null);
            return;
        }

        const currentUser: any = await getProjectMemberQuery(projectId, currentUserId);

        if (!currentUser) {
            handleResponse(res, 404, "Current user not found", null);
            return;
        }

        if (currentUser.role === "owner" || currentUser.role === 'admin') {
            let inviteToUpdate = await getUserByIdQuery(userId);

            if (!inviteToUpdate) {
                inviteToUpdate = await getPendingUserQuery(projectId, userId);

                if (!inviteToUpdate) {
                    handleResponse(res, 404, "User not found", null);
                    return;
                }

                await updatePendingUserRoleQuery(inviteToUpdate.id, role);
            } else {
                await updateProjectMemberRoleQuery(projectId, inviteToUpdate.id, role);
            }
        } else {
            handleResponse(res, 400, "You don't have permission to update this user", null);
            return;
        }

        handleResponse(res, 200, "Project updated successfully", null);
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

            const project: Project = await getProjectByIdQuery(projectId);

            if (!project) {
                handleResponse(res, 404, "Project not found", null);
                return;
            }

            const projectMembers = await getProjectMembersQuery(projectId);
            const pendingUsers = await getPendingUsersQuery(projectId);

            if (projectMembers.length + pendingUsers.length <= 5) {
                await updateProjectReadOnlyQuery(projectId, false);
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