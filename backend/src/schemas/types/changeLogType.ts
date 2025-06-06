export type BaseLog = {
    id: string;
    table_name: string;
    operation: 'CREATE' | 'UPDATE' | 'DELETE';
    new_data?: any;
    old_data?: any;
    changed_by?: string;
    created_at?: string;
    [key: string]: any; // For additional unknown props
};

export type AssignmentDetails = {
    task_id: string;
    user_id: string;
    task_title: string;
    assigned_by_name: string;
    assigned_by_email: string;
    user_name: string;
    user_email: string;
};

export type CommentDetails = {
    user_id: string;
    user_name: string;
    user_email: string;
    comment: string;
    task_title: string;
};

export type MilestoneDetails = {
    title: string;
    id: string;
    project_id: string;
};

export type FileDetails = {
    title: string;
    id: string;
    project_id: string;
    task_id?: string;
    task_title: string;
};

export type ProjectMemberDetails = {
    user_id: string;
    user_name: string;
    user_email: string;
    project_id: string;
    inviter_user_id: string;
    inviter_user_name: string;
    inviter_user_email: string;
};

export type TaskLabelDetails = {
    task_id: string;
    task_title: string;
    label_id: string;
    label_name: string;
    project_id: string;
};

export type TaskDetails = {
    task_id: string;
    task_title: string;
    project_id: string;
    milestone_id: string;
    milestone_name?: string;
    parent_task_id?: string;
    parent_task_title?: string;
};

export type UserDetails = {
    id: string;
    name: string;
    email: string;
};

export type ChangeLog =
    | (BaseLog & { assignment: AssignmentDetails; projectName: string })
    | (BaseLog & { comment: CommentDetails; projectName: string })
    | (BaseLog & { milestone: MilestoneDetails; projectName: string })
    | (BaseLog & { file: FileDetails; projectName: string })
    | (BaseLog & { projectMember: ProjectMemberDetails; projectName: string })
    | (BaseLog & { task_label: TaskLabelDetails; projectName: string })
    | (BaseLog & { task: TaskDetails; projectName: string })
    | (BaseLog & { user: UserDetails })
    | (BaseLog & { projectName: string }) // for logs like "projects" or "pending_project_invitations"
    ;