import pool from "../config/db";

const createPendingInvitationsTable = async () => {
    const queryText = `
        CREATE TABLE IF NOT EXISTS pending_project_invitations (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
            email VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'member',
            inviter_name VARCHAR(255),
            inviter_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            UNIQUE (project_id, email)
        );

        CREATE INDEX IF NOT EXISTS idx_pending_invitations_email ON pending_project_invitations(email);
        CREATE INDEX IF NOT EXISTS idx_pending_invitations_project ON pending_project_invitations(project_id);
        CREATE INDEX IF NOT EXISTS idx_pending_invitations_created_at ON pending_project_invitations(created_at);
        CREATE INDEX IF NOT EXISTS idx_pending_invitations_role ON pending_project_invitations(role);
        CREATE INDEX IF NOT EXISTS idx_pending_invitations_inviter_name ON pending_project_invitations(inviter_name);
    `;

    try {
        await pool.query(queryText);
        console.log("Pending project invitations table created successfully");
    } catch (error) {
        console.error("Error creating pending_project_invitations table:", error);
    }
};

export default createPendingInvitationsTable;