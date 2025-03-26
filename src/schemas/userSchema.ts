import Joid from "joi";

// define user input validation schema with rules
export const userScheama = Joid.object({
    email: Joid.string().email().required(),
    name: Joid.string().min(3).required(),
});