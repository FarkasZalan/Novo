import pool from "../config/db";

// Create assignments table if it doesn't exist
const createMilestoneTable = async () => {
    const queryText = `
        CREATE TABLE IF NOT EXISTS milestones (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        due_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        all_tasks_count INTEGER DEFAULT 0,
        completed_tasks_count INTEGER DEFAULT 0
);

        -- indexes
        CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON milestones(project_id);
        CREATE INDEX IF NOT EXISTS idx_milestones_name ON milestones(name);
        CREATE INDEX IF NOT EXISTS idx_milestones_due_date ON milestones(due_date);
        CREATE INDEX IF NOT EXISTS idx_milestones_created_at ON milestones(created_at);
        CREATE INDEX IF NOT EXISTS idx_milestones_all_tasks_count ON milestones(all_tasks_count);
        CREATE INDEX IF NOT EXISTS idx_milestones_completed_tasks_count ON milestones(completed_tasks_count);

    `;

    try {
        await pool.query(queryText);
        console.log("Milestone table created successfully");
    } catch (error) {
        console.error("Error creating files table:", error);
    }
};

export default createMilestoneTable;