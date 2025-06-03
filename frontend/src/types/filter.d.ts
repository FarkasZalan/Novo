type Filter = {
    status?: string;
    priority?: string;
    labelIds?: string[];
    orderBy?: 'due_date' | 'updated_at';
    orderDirection?: 'asc' | 'desc';
};