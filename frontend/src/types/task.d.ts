export interface Task {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: 'low' | 'medium' | 'high';
    due_date?: string;
    attachments_count: number;
    milestone_id?: string;
    milestone_name?: string;
    labels?: Label[];
    parent_task_id?: string;
    parent_task_name?: string;
    parent_due_date?: string;
    parent_status?: string;
    subtasks?: Task[];
    created_at: string;
    updated_at: string;
    milestone_color: string
}