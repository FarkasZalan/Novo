import pool from "../config/db";

// Create files table if it doesn't exist
const createFilesTable = async () => {
    const queryText = `
        CREATE TABLE IF NOT EXISTS files (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            project_id UUID REFERENCES projects(id) ON DELETE CASCADE, -- Foreign key to projects table
            task_id UUID REFERENCES tasks(id) ON DELETE CASCADE DEFAULT NULL, -- Foreign key to tasks table
            file_name VARCHAR(255) NOT NULL,
            mime_type VARCHAR(100) NOT NULL, -- File type (application/pdf, image/png, etc.)
            size BIGINT NOT NULL, -- File size in bytes
            uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Who uploaded the file
            file_data BYTEA NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );

        -- Additional indexes for files table
        CREATE INDEX IF NOT EXISTS idx_files_project_id ON files(project_id);
        CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(uploaded_by);
        CREATE INDEX IF NOT EXISTS idx_files_mime_type ON files(mime_type);
        CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at);
        CREATE INDEX IF NOT EXISTS idx_files_task_id ON files(task_id);
    `;

    try {
        await pool.query(queryText);
        console.log("Files table created successfully");
    } catch (error) {
        console.error("Error creating files table:", error);
    }
};

export default createFilesTable;