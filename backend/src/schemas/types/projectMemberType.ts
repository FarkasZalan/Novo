export interface ProjectMember {
    project_id: string;
    user_id: string;
    role: string;
    joined_at: Date;
    inviter_name: string;
    inviter_user_id: string;
}