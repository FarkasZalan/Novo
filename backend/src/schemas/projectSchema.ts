import Joid from "joi";

export const projectSchema = Joid.object({
    name: Joid.string().min(2).required(),
    description: Joid.string(),
    userId: Joid.string().required()
})

// for authorization
export interface Project {
    name: string;
    description: string;
    user_id: string;
}

