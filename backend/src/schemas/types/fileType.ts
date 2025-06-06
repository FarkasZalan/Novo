export interface File {
    id: string;
    file_name: string;
    file_path: string;
    mime_type: string;
    size: number;
    uploaded_by_name: string;
    uploaded_by_email: string;
    task_id?: string;
    created_at: string;
    file_data?: Buffer
}