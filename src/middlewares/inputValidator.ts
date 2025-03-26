import { NextFunction, Request, Response } from "express";
import { userScheama } from "../schemas/userSchema";
import { projectSchema } from "../schemas/projectSchema";
import { taskSchema } from "../schemas/taskSchema";

// middleware functions to validate inputs
export const validateUser = (req: Request, res: Response, next: NextFunction): void => {
    const { email, name } = req.body;
    const { error } = userScheama.validate({ email, name }); // check if the input is valid
    if (error) {
        res.status(400).json({
            status: 400,
            message: "Invalid input",
            error: error.details[0].message
        });
        return;
    }
    next(); // if the input is valid, call next middleware
};

export const validateProject = (req: Request, res: Response, next: NextFunction): void => {
    const { name, description, userId } = req.body;
    const { error } = projectSchema.validate({ name, description, userId });
    if (error) {
        res.status(400).json({
            status: 400,
            message: "Invalid input",
            error: error.details[0].message
        });
        return;
    }
    next();
}

export const validateTask = (req: Request, res: Response, next: NextFunction): void => {
    const { title, description, projectId, due_date, priority, completed } = req.body;
    const { error } = taskSchema.validate({ title, description, projectId, due_date, priority, completed });
    if (error) {
        res.status(400).json({
            status: 400,
            message: "Invalid input",
            error: error.details[0].message
        });
        return;
    }
    next();
}