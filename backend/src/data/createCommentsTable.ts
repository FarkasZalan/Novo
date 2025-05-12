import pool from "../config/db";

// create comment table if it doesn't exist
const createCommentTable = async () => {
    const queryText = `
    CREATE TABLE IF NOT EXISTS comments (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      author_id UUID REFERENCES users(id) ON DELETE SET NULL DEFAULT NULL,
      task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      comment TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP
    );
    
    -- Additional indexes for users table
        CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
        CREATE INDEX IF NOT EXISTS idx_comments_task_id ON comments(task_id);
        CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
        CREATE INDEX IF NOT EXISTS idx_comments_updated_at ON comments(updated_at);
    `

    try {
        await pool.query(queryText); // send a query to the database with one of the open connection from the pool
        console.log("Comment table created successfully");
    } catch (error) {
        console.error("Error creating comment table:", error);
    }
}

export default createCommentTable