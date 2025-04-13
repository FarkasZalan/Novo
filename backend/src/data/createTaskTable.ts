import pool from "../config/db";

// Create projects table if it doesn't exist
const createTasksTable = async () => {
    const queryText = `
        CREATE TABLE IF NOT EXISTS tasks (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            project_id UUID REFERENCES projects(id) ON DELETE CASCADE, -- Foreign key to projects table
            description TEXT,
            due_date Timestamp,
            priority VARCHAR(255),
            completed BOOLEAN,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP
        );

        -- Additional indexes for tasks table
        CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
        CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed) WHERE completed = FALSE;
        CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
        CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
        CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
    `;

    try {
        await pool.query(queryText); // Send a query to the database with one of the open connections from the pool
        console.log("Tasks table created successfully");
    } catch (error) {
        console.error("Error creating projects table:", error);
    }
};

export default createTasksTable;