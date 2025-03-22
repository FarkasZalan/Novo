import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db";
import userRoutes from "./routes/userRoutes";
import errorHandling from "./middlewares/errorHandler";
import createUserTable from "./data/createUserTable";

dotenv.config();

// Create express app to handle routes, middlewares, and error handling, etc
const app = express();
const port = process.env.PORT || 3000;

// app.use() is a function that is used to add middlewares, routes, etc to the express app

// Middlewares
// Middlewares = functions that run between request and response eg. check if user is logged in, process the request data (json) etc

// CORS = it's a security feature that denies browsers from making requests to other domains, ports, or protocols
app.use(cors()); // Enable CORS

app.use(express.json()); // if the request has json data (body), it will be parsed to Javascript object and made available in req.body

// Routes
app.use("/api", userRoutes); // Prefix all routes with /api to avoid conflicts so now all routes start with /api

// Error handling middleware
app.use(errorHandling);

// Create user table if it doesn't exist before server starts
createUserTable();

// Testing postgres connection
app.get("/", async (_req, res) => {
    const result = await pool.query("SELECT current_database()");
    res.send("Connected to database: " + result.rows[0].current_database);
});

// Server running
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
