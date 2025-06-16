import pool from "../../config/db";

// store the changes in the change_logs table with:
// table_name, operation, old_data, new_data, changed_by, created_at
export const createChangeLogTriggerFunction = async () => {
    const query = `
    CREATE OR REPLACE FUNCTION log_table_changes()
    RETURNS TRIGGER AS $$
    DECLARE
        user_id UUID;
    BEGIN
        BEGIN
            user_id := current_setting('app.user_id')::UUID;
        EXCEPTION WHEN OTHERS THEN
            user_id := NULL;
        END;

        IF TG_OP = 'INSERT' THEN
            INSERT INTO change_logs (table_name, operation, new_data, changed_by)
            VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW), user_id);
            RETURN NEW;
        ELSIF TG_OP = 'UPDATE' THEN
            INSERT INTO change_logs (table_name, operation, old_data, new_data, changed_by)
            VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), user_id);
            RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
            INSERT INTO change_logs (table_name, operation, old_data, changed_by)
            VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), user_id);
            RETURN OLD;
        END IF;
        RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;
    `;

    try {
        await pool.query(query);
        console.log("Trigger function 'log_table_changes' created.");
    } catch (error) {
        console.error("Failed to create trigger function:", error);
        throw error;
    }
};
