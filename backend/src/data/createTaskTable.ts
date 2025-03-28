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
        )
    `;

    try {
        await pool.query(queryText); // Send a query to the database with one of the open connections from the pool
        console.log("Tasks table created successfully");
    } catch (error) {
        console.error("Error creating projects table:", error);
    }
};

export default createTasksTable;