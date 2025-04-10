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
      refresh_session_id VARCHAR(255),
      provider VARCHAR(50),
      provider_id VARCHAR(255),
      reset_password_token VARCHAR(255),
      reset_password_expires TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`

    try {
        await pool.query(queryText); // send a query to the database with one of the open connection from the pool
        console.log("User table created successfully");
    } catch (error) {
        console.error("Error creating user table:", error);
    }
}

export default createUserTable