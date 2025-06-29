import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// redis is used for store the sessions for oauth auth

const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log('Connected to Redis');
    } catch (error) {
        console.error('Redis connection error:', error);
    }
};

export { redisClient, connectRedis };