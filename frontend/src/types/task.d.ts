export interface Task {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: 'low' | 'medium' | 'high';
    due_date?: string;
}