import { Request, Response } from "express";
import { deleteUserQuery, getAllUsersQuery, getUserByIdQuery, updateUserQuery } from "../models/userModel";
import { NextFunction } from "connect";
import bcrypt from "bcryptjs";

// Standardized response function
// it's a function that returns a response to the client when a request is made (CRUD operations)
const handleResponse = (res: Response, status: number, message: string, data: any) => {
    return res.status(status).json({
        status,
        message,
        data
    });
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const users = await getAllUsersQuery();
        handleResponse(res, 200, "Users fetched successfully", users);
    } catch (error) {
        next(error);
    }
};

export const getUserProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user.id;
        const user = await getUserByIdQuery(userId);
        if (!user) {
            handleResponse(res, 404, "User not found", null);
            return;
        }
        handleResponse(res, 200, "User fetched successfully", user);
    } catch (error) {
        next(error);
    }
};

// controllers/userController.ts
export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, name, password, currentPassword } = req.body;
        const userId = req.user.id;

        // Get current user data
        const currentUser = await getUserByIdQuery(userId);
        if (!currentUser) {
            handleResponse(res, 404, "User not found", null);
            return;
        }

        // If password is being changed (provided in request)
        if (password) {
            // Verify current password if it's provided
            if (!currentPassword) {
                handleResponse(res, 400, "Current password is required to change password", null);
                return;
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
            if (!isPasswordValid) {
                handleResponse(res, 400, "Current password is incorrect", null);
                return;
            }

            // Hash the new password
            const userHashedPassword = await bcrypt.hash(password, 10);
            const updatedUser = await updateUserQuery(userId, email, name, userHashedPassword);
            handleResponse(res, 200, "User updated successfully (with password change)", updatedUser);
        } else {
            // Update without changing password
            const updatedUser = await updateUserQuery(userId, email, name, currentUser.password);
            handleResponse(res, 200, "User updated successfully", updatedUser);
        }
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user.id;
        const deletedUser = await deleteUserQuery(userId);
        if (!deletedUser) {
            handleResponse(res, 404, "User not found", null);
            return;
        }

        // Remove the refresh token cookie before deleting the user
        res.clearCookie("refresh_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Only allow secure cookies in production mode
            sameSite: "lax",
            path: "/"
        });

        handleResponse(res, 200, "User deleted successfully", deletedUser);
    } catch (error) {
        next(error);
    }
};