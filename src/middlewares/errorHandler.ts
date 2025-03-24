import { NextFunction, Request, Response } from "express";

// Centralized error handling middleware
const errorHandling = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).json({
        status: 500,
        message: "Something went wrong",
        error: err.message
    })
}

export default errorHandling