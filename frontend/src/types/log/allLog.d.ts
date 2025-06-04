interface AllLog {
    id: string;
    table_name: string;
    operation: string;
    old_data: any;
    new_data: any;
    changed_by_name: string;
    changed_by_email: string;
    created_at: string;
    assignment: any;
    comment: any;
    milestone: any;
    file: any;
    projectMember: any;
    task_label: any;
    task: any;
    user: any;
    projectName?: string;
    project_id?: string;
    task_title?: string;
    task_id?: string;
}