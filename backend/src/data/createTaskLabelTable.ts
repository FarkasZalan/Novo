import pool from "../config/db";

// Create labels table if it doesn't exist
const createTaskLabelTable = async () => {
    const queryText = `
    CREATE TABLE IF NOT EXISTS task_labels (
        task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
        PRIMARY KEY (task_id, label_id)
    );

        -- indexes
        CREATE INDEX IF NOT EXISTS idx_task_labels_task_id ON task_labels(task_id);
        CREATE INDEX IF NOT EXISTS idx_task_labels_label_id ON task_labels(label_id);

    `;

    try {
        await pool.query(queryText);
        console.log("Task label table created successfully");
    } catch (error) {
        console.error("Error creating files table:", error);
    }
};

export default createTaskLabelTable;