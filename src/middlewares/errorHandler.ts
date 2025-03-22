import { Request, Response } from "express";

// Centralized error handling middleware
const errorHandling = (err: any, _req: Request, res: Response) => {
    console.error(err);
    res.status(500).json({
        status: 500,
        message: "Something went wrong",
        error: err.message
    })
}

export default errorHandling