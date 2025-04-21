import pool from "../config/db";

const createProjectMembersTable = async () => {
    const queryText = `
        CREATE TABLE IF NOT EXISTS project_members (
            project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            role VARCHAR(50) DEFAULT 'member',
            joined_at TIMESTAMP DEFAULT NOW(),
            inviter_name VARCHAR(255),
            PRIMARY KEY (project_id, user_id)
        );

        CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);
        CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
        CREATE INDEX IF NOT EXISTS idx_project_members_role ON project_members(role);
        CREATE INDEX IF NOT EXISTS idx_project_members_joined_at ON project_members(joined_at);
        CREATE INDEX IF NOT EXISTS idx_project_members_inviter_name ON project_members(inviter_name);
    `;

    try {
        await pool.query(queryText);
        console.log("Project members table created successfully");
    } catch (error) {
        console.error("Error creating project_members table:", error);
    }
};

export default createProjectMembersTable;
