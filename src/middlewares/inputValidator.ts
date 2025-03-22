import Joid from "joi";

// define user input validation schema with rules
const userScheama = Joid.object({
    email: Joid.string().email().required(),
    name: Joid.string().min(3).required(),
});

// middleware function to validate user input
const validateUser = (req: any, res: any, next: any) => {
    const { email, name } = req.body;
    const { error } = userScheama.validate({ email, name }); // check if user input is valid
    if (error) {
        return res.status(400).json({
            status: 400,
            message: "Invalid input",
            error: error.details[0].message
        });
    }
    next(); // if user input is valid, call next middleware
};

export default validateUser;