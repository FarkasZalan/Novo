import Joid from "joi";

export const taskSchema = Joid.object({
    title: Joid.string().min(2).required(),
    description: Joid.string(),
    projectId: Joid.string().required(),
    due_date: Joid.date(),
    priority: Joid.string(),
    completed: Joid.boolean().required()
})