import pool from "../config/db";

// Create projects table if it doesn't exist
const createProjectsTable = async () => {
    const queryText = `
        CREATE TABLE IF NOT EXISTS projects (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            owner_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Foreign key to users table
            description TEXT,
            status VARCHAR(20) DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed')),
            progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
            total_tasks INTEGER DEFAULT 0,
            completed_tasks INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP
        );

         -- Additional indexes for projects table
        CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
        CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
        CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);
        CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
        CREATE INDEX IF NOT EXISTS idx_projects_total_tasks ON projects(total_tasks);
        CREATE INDEX IF NOT EXISTS idx_projects_completed_tasks ON projects(completed_tasks);
    `;

    try {
        await pool.query(queryText); // Send a query to the database with one of the open connections from the pool
        console.log("Projects table created successfully");
    } catch (error) {
        console.error("Error creating projects table:", error);
    }
};

export default createProjectsTable;