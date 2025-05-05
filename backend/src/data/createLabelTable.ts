import pool from "../config/db";

// Create labels table if it doesn't exist
const createLabelTable = async () => {
    const queryText = ` 
     CREATE TABLE IF NOT EXISTS labels (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        color VARCHAR(255) NOT NULL
    );

        -- indexes
        CREATE INDEX IF NOT EXISTS idx_labels_project_id ON labels(project_id);
        CREATE INDEX IF NOT EXISTS idx_labels_name ON labels(name);
        CREATE INDEX IF NOT EXISTS idx_labels_color ON labels(color);

    `;

    try {
        await pool.query(queryText);
        console.log("Label table created successfully");
    } catch (error) {
        console.error("Error creating files table:", error);
    }
};

export default createLabelTable;