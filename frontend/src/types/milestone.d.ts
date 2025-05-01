interface Milestone {
    id: string
    name: string
    description: string
    due_date?: string
    project_id: string
    created_at: string
    all_tasks_count: number = 0
    completed_tasks_count: number = 0
}