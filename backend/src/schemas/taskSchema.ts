import Joid from "joi";

export const taskSchema = Joid.object({
    title: Joid.string().min(2).required(),
    description: Joid.string().optional().allow(''),
    due_date: Joid.date().optional().allow(null),
    priority: Joid.string().optional().allow(null),
    status: Joid.string().required()
})