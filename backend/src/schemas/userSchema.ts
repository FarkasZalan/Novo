import Joi from "joi";

// define user input validation schema with rules
export const userScheama = Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().min(3).required(),
    password: Joi.string().min(6).required(),
    isPremium: Joi.boolean()
});