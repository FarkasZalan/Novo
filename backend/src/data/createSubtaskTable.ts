import pool from "../config/db";

// Create labels table if it doesn't exist
const createSubtaskTable = async () => {
    const queryText = `
    CREATE TABLE IF NOT EXISTS subtasks (
        task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        subtask_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        PRIMARY KEY (task_id, subtask_id)
    );

        -- indexes
        CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);
        CREATE INDEX IF NOT EXISTS idx_subtasks_subtask_id ON subtasks(subtask_id);

    `;

    try {
        await pool.query(queryText);
        console.log("Task label table created successfully");
    } catch (error) {
        console.error("Error creating files table:", error);
    }
};

export default createSubtaskTable;