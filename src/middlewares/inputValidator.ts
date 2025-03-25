import { NextFunction, Request, Response } from "express";
import Joid from "joi";

// define user input validation schema with rules
const userScheama = Joid.object({
    email: Joid.string().email().required(),
    name: Joid.string().min(3).required(),
});

// middleware function to validate user input
export const validateUser = (req: Request, res: Response, next: NextFunction): void => {
    const { email, name } = req.body;
    const { error } = userScheama.validate({ email, name }); // check if user input is valid
    if (error) {
        res.status(400).json({
            status: 400,
            message: "Invalid input",
            error: error.details[0].message
        });
        return;
    }
    next(); // if user input is valid, call next middleware
};

export const projectSchema = Joid.object({
    name: Joid.string().min(2).required(),
    description: Joid.string(),
    userId: Joid.string().required()
})

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

export const taskSchema = Joid.object({
    title: Joid.string().min(2).required(),
    description: Joid.string(),
    projectId: Joid.string().required(),
    due_date: Joid.date(),
    priority: Joid.string(),
    completed: Joid.boolean().required()
})

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