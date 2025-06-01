import pool from "../config/db";

// create user table if it doesn't exist
const createUserTable = async () => {
    const queryText = `
    CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      is_premium BOOLEAN DEFAULT FALSE,
      premium_session_id VARCHAR(255) DEFAULT NULL,
      premium_start_date TIMESTAMP DEFAULT NULL,
      premium_end_date TIMESTAMP DEFAULT NULL,
      user_cancelled_premium BOOLEAN DEFAULT FALSE,
      refresh_session_id VARCHAR(255),
      provider VARCHAR(50),
      reset_password_token VARCHAR(255),
      reset_password_expires TIMESTAMP,
      is_verified BOOLEAN DEFAULT FALSE,
      verification_token VARCHAR(255),
      verification_token_expires TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );
    
    -- Additional indexes for users table
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email); -- Already covered by UNIQUE
        CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_password_token) WHERE reset_password_token IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token) WHERE verification_token IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_users_is_premium ON users(is_premium) WHERE is_premium = TRUE;
        CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
    `

    try {
        await pool.query(queryText); // send a query to the database with one of the open connection from the pool
        console.log("User table created successfully");
    } catch (error) {
        console.error("Error creating user table:", error);
    }
}

export default createUserTable