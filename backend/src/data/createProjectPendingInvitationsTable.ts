import pool from "../config/db";

const createPendingInvitationsTable = async () => {
    const queryText = `
        CREATE TABLE IF NOT EXISTS pending_project_invitations (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
            email VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'member',
            created_at TIMESTAMP DEFAULT NOW(),
            UNIQUE (project_id, email)
        );

        CREATE INDEX IF NOT EXISTS idx_pending_invitations_email ON pending_project_invitations(email);
        CREATE INDEX IF NOT EXISTS idx_pending_invitations_project ON pending_project_invitations(project_id);
    `;

    try {
        await pool.query(queryText);
        console.log("Pending project invitations table created successfully");
    } catch (error) {
        console.error("Error creating pending_project_invitations table:", error);
    }
};

export default createPendingInvitationsTable;