import Joid from "joi";

export const labelSchema = Joid.object({
    project_id: Joid.string().required(),
    name: Joid.string().required(),
    description: Joid.string().optional().allow(''),
    color: Joid.string().required()
})

export interface Label {
    id: string;
    project_id: string;
    name: string;
    description: string;
    color: string;
}
