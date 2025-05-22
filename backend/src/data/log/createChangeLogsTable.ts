import pool from "../../config/db";

// Create assignments table if it doesn't exist
const createChangeLogsTable = async () => {
    const queryText = `
        CREATE TABLE IF NOT EXISTS change_logs (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            table_name VARCHAR(255) NOT NULL,
            operation VARCHAR(255) NOT NULL,
            old_data JSONB,
            new_data JSONB,
            changed_by UUID,
            created_at TIMESTAMP DEFAULT NOW()
        );

        -- indexes
        CREATE INDEX IF NOT EXISTS idx_change_logs_table_name ON change_logs(table_name);
        CREATE INDEX IF NOT EXISTS idx_change_logs_operation ON change_logs(operation);
        CREATE INDEX IF NOT EXISTS idx_change_logs_created_at ON change_logs(created_at);
        CREATE INDEX IF NOT EXISTS idx_change_logs_changed_by ON change_logs(changed_by);

    `;

    try {
        await pool.query(queryText);
        console.log("CHange log table created successfully");
    } catch (error) {
        console.error("Error creating files table:", error);
    }
};

export default createChangeLogsTable;