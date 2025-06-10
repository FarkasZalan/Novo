import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool, { initializeDatabase } from "./config/db";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import projectRoutes from "./routes/projectRoutes";
import assignmentRoutes from "./routes/assignmentRoutes";
import projectMemberRoutes from "./routes/projectMemberRoutes";
import fileRoutes from "./routes/filesRoutes";
import taskRoutes from "./routes/taskRoutes";
import labelRoutes from "./routes/labelRoutes";
import milestoneRoutes from "./routes/milestonesRoutes";
import changeLogsRoutes from "./routes/changeLogRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import webhookForPaymentRoute from "./routes/webhookForPaymentRoute";
import commentRoutes from "./routes/commentRoutes";
import filterRoutes from "./routes/filterRoutes";
import errorHandling from "./middlewares/errorHandler";
import { setupSwagger } from "./config/swagger";
import passport from 'passport';
import session from 'express-session';
import { configurePassport } from './config/passport';
import cookieParser from 'cookie-parser';
import { connectRedis, redisClient } from "./config/redis";
import { RedisStore } from "connect-redis";

dotenv.config();

// Create express app to handle routes, middlewares, and error handling, etc
const app = express();
const port = process.env.PORT || 3000;

// app.use() is a function that is used to add middlewares, routes, etc to the express app

// Session for oauth callback

// Session:
// A session is a way to store information about user authentication so don't need to login every refresh or navigation
// now we store session in redis

// session is required to OAuth because we need to store the state of the user in the session what retuns from the OAuth provider (Google or Github auth screen)
// and with this session don't need to login every refresh or navigation
app.use(session({
    store: new RedisStore({
        client: redisClient,
        prefix: 'session:'
    }),
    secret: process.env.SESSION_SECRET as string, // Session ID, random long string
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session for unauthenticated users

    // session cookie to store session ID
    cookie: {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        maxAge: 5 * 60 * 1000 // 5 min
    }
}));

app.use(passport.initialize());

// integrate express session with passport
// store the user id in the session
// after login the passport remembers the user id in the session

// this is necesary for OAuth
app.use(passport.session());

// Initialize passport configuration
configurePassport();

// Middlewares
// Middlewares = functions that run between request and response eg. check if user is logged in, process the request data (json) etc
// so these are process the request before reaching the controller

// CORS = it's a security feature that denies browsers from making requests to other domains, ports, or protocols
app.use(cors({
    origin: [process.env.FRONTEND_URL! || "http://localhost:5173"], // frontend url
    credentials: true, // allow cookies
    exposedHeaders: ['set-cookie'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
})); // Enable CORS

app.enable('trust proxy');

// Cookie parser middleware
app.use(cookieParser());

// swagger config
setupSwagger(app);


app.use("/api", webhookForPaymentRoute);

app.use(express.json()); // if the request has json data (body), it will be parsed to Javascript object and made available in req.body

// Routes
app.use("/api", authRoutes);
app.use("/api", userRoutes); // Prefix all routes with /api to avoid conflicts so now all routes start with /api
app.use("/api", projectRoutes);
app.use("/api", projectMemberRoutes);
app.use("/api", fileRoutes);
app.use("/api", taskRoutes);
app.use("/api", assignmentRoutes);
app.use("/api", milestoneRoutes);
app.use("/api", labelRoutes);
app.use("/api", commentRoutes);
app.use("/api", paymentRoutes);
app.use("/api", changeLogsRoutes);
app.use("/api", filterRoutes);

// Error handling middleware
app.use(errorHandling);


// Create user table if it doesn't exist before server starts
initializeDatabase().then(() => {
    console.log("Database tables initialized");
    // Connect to Redis
    return connectRedis();
}).catch((error) => console.error("Error initializing database tables:", error));

// Testing postgres connection
app.get("/", async (_req: Request, res: Response) => {
    const result = await pool.query("SELECT current_database()");
    res.send("Connected to database: " + result.rows[0].current_database);
});

// Server running
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
