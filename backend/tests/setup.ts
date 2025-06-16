import pool from '../src/config/db';
import { redisClient } from '../src/config/redis';

afterAll(async () => {
    await pool.end(); // Properly close the connection pool after all tests
    await redisClient.quit(); // Properly close the redis connection after all tests
});