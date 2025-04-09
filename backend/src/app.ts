import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool, { initializeDatabase } from "./config/db";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import projectRoutes from "./routes/projectRoutes";
import taskRoutes from "./routes/taskRoutes";
import errorHandling from "./middlewares/errorHandler";
import { setupSwagger } from "./config/swagger";
import passport from 'passport';
import session from 'express-session';
import { configurePassport } from './config/passport';

dotenv.config();

// Create express app to handle routes, middlewares, and error handling, etc
const app = express();
const port = process.env.PORT || 3000;

// app.use() is a function that is used to add middlewares, routes, etc to the express app

// Session for oauth callback

// Session:
// A session is a way to store information about user authentication so don't need to login every refresh or navigation
app.use(session({
    secret: process.env.SESSION_SECRET || 'keyboard cat', // Session ID, random long string
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session for unauthenticated users

    // session cookie to store session ID
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// Initialize passport configuration
configurePassport();

// Middlewares
// Middlewares = functions that run between request and response eg. check if user is logged in, process the request data (json) etc
// so these are process the request before reaching the controller

// CORS = it's a security feature that denies browsers from making requests to other domains, ports, or protocols
app.use(cors({
    origin: ["http://localhost:5173"], // frontend url
    credentials: true, // allow cookies
    exposedHeaders: ['set-cookie']
})); // Enable CORS

// swagger config
setupSwagger(app);

app.use(express.json()); // if the request has json data (body), it will be parsed to Javascript object and made available in req.body

// Routes
app.use("/api", authRoutes);
app.use("/api", userRoutes); // Prefix all routes with /api to avoid conflicts so now all routes start with /api
app.use("/api", projectRoutes);
app.use("/api", taskRoutes);

// Error handling middleware
app.use(errorHandling);


// Create user table if it doesn't exist before server starts
initializeDatabase().then(() => {
    console.log("Database tables initialized");
}).catch((error) => console.error("Error initializing database tables:", error));

// Testing postgres connection
app.get("/", async (_req, res) => {
    const result = await pool.query("SELECT current_database()");
    res.send("Connected to database: " + result.rows[0].current_database);
});

// Server running
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
