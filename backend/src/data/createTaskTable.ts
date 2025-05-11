import pool from "../config/db";

// Create projects table if it doesn't exist
const createTasksTable = async () => {
    const queryText = `
        CREATE TABLE IF NOT EXISTS tasks (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            project_id UUID REFERENCES projects(id) ON DELETE CASCADE, -- Foreign key to projects table
            milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL, -- Foreign key to milestones table
            parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE, -- Foreign key to tasks table
            description TEXT,
            due_date Timestamp,
            priority VARCHAR(255),
            attachments_count INTEGER DEFAULT 0,
            completed BOOLEAN,
            status VARCHAR(20) DEFAULT 'not-started' CHECK (status IN ('blocked', 'not-started', 'in-progress', 'completed')),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP
        );

        -- Additional indexes for tasks table
        CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
        CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed) WHERE completed = FALSE;
        CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
        CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
        CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
        CREATE INDEX IF NOT EXISTS idx_tasks_updated_at ON tasks(updated_at);
        CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    `;

    try {
        await pool.query(queryText); // Send a query to the database with one of the open connections from the pool
        console.log("Tasks table created successfully");
    } catch (error) {
        console.error("Error creating projects table:", error);
    }
};

export default createTasksTable;