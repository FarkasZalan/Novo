import { Request, Response } from "express";
import { deleteUserService, getAllUsersService, getUserByIdService, updateUserService } from "../models/userModel";
import { NextFunction } from "connect";
import bcrypt from "bcrypt";

// Standardized response function
// it's a function that returns a response to the client when a request is made (CRUD operations)
// it's make the routes more readable
const handleResponse = (res: Response, status: number, message: string, data: any) => {
    return res.status(status).json({
        status,
        message,
        data
    });
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const users = await getAllUsersService();
        handleResponse(res, 200, "Users fetched successfully", users);
    } catch (error) {
        next(error);
    }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await getUserByIdService(req.params.id);
        if (!user) {
            handleResponse(res, 404, "User not found", null);
            return;
        }
        handleResponse(res, 200, "User fetched successfully", user);
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, name } = req.body;
        const userHashedPassword = await bcrypt.hash(req.body.password, 10);
        const updatedUser = await updateUserService(req.params.id, email, name, userHashedPassword);
        if (!updatedUser) {
            handleResponse(res, 404, "User not found", null);
            return;
        }
        handleResponse(res, 200, "User updated successfully", updatedUser);
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const deletedUser = await deleteUserService(req.params.id);
        if (!deletedUser) {
            handleResponse(res, 404, "User not found", null);
            return;
        }

        // Remove the refresh token cookie before deleting the user
        res.clearCookie("refresh_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Only allow secure cookies in production mode
            sameSite: "strict", // Prevent CSRF attacks
            path: "/auth/refresh-token"
        });

        handleResponse(res, 200, "User deleted successfully", deletedUser);
    } catch (error) {
        next(error);
    }
};