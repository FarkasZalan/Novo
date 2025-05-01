interface ProjectMember {
    id: string,
    name: string,
    role: string,
    status: string,
    email: string,
    joined_at: Date,
    user?: User
};

export default ProjectMember;