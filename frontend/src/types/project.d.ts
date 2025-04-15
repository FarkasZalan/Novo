interface Project {
    id?: string;
    name: string;
    description: string;
    owner_id: string;
    progress: number;
    status: "not-started" | "in-progress" | "completed";
    members: number;
    total_tasks: number;
    completed_tasks: number;
    tasks: {
        total: number;
        completed: number;
    };
}