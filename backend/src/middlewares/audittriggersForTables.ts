import pool from "../config/db";

export const addAuditTriggers = async () => {
    const tables = [
        "tasks",
        "projects",
        "users",
        "milestones",
        "comments",
        "files",
        "project_members",
        "assignments",
        "pending_project_invitations",
        "task_labels",
        "subtasks"
    ];

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        for (const table of tables) {
            await client.query(`DROP TRIGGER IF EXISTS ${table}_change_log ON ${table};`);

            await client.query(`
        CREATE TRIGGER ${table}_change_log
        AFTER INSERT OR UPDATE OR DELETE ON ${table}
        FOR EACH ROW EXECUTE FUNCTION log_table_changes();
      `);

            console.log(`Audit trigger added to ${table}`);
        }

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error adding audit triggers:", error);
        throw error;
    } finally {
        client.release();
    }
};
