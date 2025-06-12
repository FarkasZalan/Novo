import pool from '../src/config/db';
import { redisClient } from '../src/config/redis';

afterAll(async () => {
    await pool.end(); // Properly close the connection pool
    await redisClient.quit();
});