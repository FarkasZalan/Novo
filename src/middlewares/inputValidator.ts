import { NextFunction, Request, Response } from "express";
import Joid from "joi";

// define user input validation schema with rules
const userScheama = Joid.object({
    email: Joid.string().email().required(),
    name: Joid.string().min(3).required(),
});

// middleware function to validate user input
const validateUser = (req: Request, res: Response, next: NextFunction): void => {
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

export default validateUser;