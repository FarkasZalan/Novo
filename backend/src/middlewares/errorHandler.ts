import { NextFunction, Request, Response } from "express";

// global error handling middleware
const errorHandling = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.code === "LIMIT_FILE_SIZE") {
        res.status(413).json({
            status: 413,
            message: "File size limit exceeded"
        })
    } else {
        res.status(500).json({
            status: 500,
            message: "Something went wrong",
            error: err.message
        })
    }
}

export default errorHandling