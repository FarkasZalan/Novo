import pool from "../config/db";

// Create assignments table if it doesn't exist
const createAssignmentsTable = async () => {
    const queryText = `
        CREATE TABLE IF NOT EXISTS assignments (
        task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        project_id UUID NOT NULL,
        user_id UUID NOT NULL,
        assigned_at TIMESTAMP DEFAULT NOW(),
        assigned_by UUID REFERENCES users(id) ON DELETE SET NULL, -- who assigned the task
        PRIMARY KEY (task_id, user_id),
        FOREIGN KEY (project_id, user_id) REFERENCES project_members(project_id, user_id) ON DELETE CASCADE
);

        -- indexes
        CREATE INDEX IF NOT EXISTS idx_assignments_task_id ON assignments(task_id);
        CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON assignments(user_id);
        CREATE INDEX IF NOT EXISTS idx_assignments_assigned_at ON assignments(assigned_at);

    `;

    try {
        await pool.query(queryText);
        console.log("Assignments table created successfully");
    } catch (error) {
        console.error("Error creating files table:", error);
    }
};

export default createAssignmentsTable;