import { Request, Response } from "express";
import { createUserService, deleteUserService, getAllUsersService, getUserByIdService, updateUserService } from "../models/userModel";
import { NextFunction } from "connect";

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

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, name } = req.body;
        const newUser = await createUserService(email, name);
        handleResponse(res, 201, "User created successfully", newUser);
    } catch (error: Error | any) {
        // Check for unique constraint violation (duplicate email)
        if (error.code === "23505") {
            handleResponse(res, 409, "Email already exists", null);
        } else {
            // Pass other errors to the next middleware (errorHandling middleware)
            next(error);
        }
    }
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
        const user = await getUserByIdService(parseInt(req.params.id));
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
        const updatedUser = await updateUserService(parseInt(req.params.id), email, name);
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
        const deletedUser = await deleteUserService(parseInt(req.params.id));
        if (!deletedUser) {
            handleResponse(res, 404, "User not found", null);
            return;
        }
        handleResponse(res, 200, "User deleted successfully", deletedUser);
    } catch (error) {
        next(error);
    }
};