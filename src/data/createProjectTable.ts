import pool from "../config/db";

// Create projects table if it doesn't exist
const createProjectsTable = async () => {
    const queryText = `
        CREATE TABLE IF NOT EXISTS projects (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Foreign key to users table
            description TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP
        )
    `;

    try {
        await pool.query(queryText); // Send a query to the database with one of the open connections from the pool
        console.log("Projects table created successfully");
    } catch (error) {
        console.error("Error creating projects table:", error);
    }
};

export default createProjectsTable;