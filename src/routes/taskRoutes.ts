import express from "express";
import { authenticateToken } from "../middlewares/authorization";
import { createTask, deleteTask, getAllTasks, getTaskById, updateTask } from "../controller/taskController";
import { validateTask } from "../middlewares/inputValidator";

const router = express.Router();

// Create a task for a specific user
router.post("/create-task", authenticateToken, validateTask, createTask);

// Get all tasks for a specific project
router.get("/user/:userId/project/:projectId/tasks", authenticateToken, getAllTasks);

// Get a specific task by ID for a specific project
router.get("/task/:taskId", authenticateToken, getTaskById);

// Update a specific task by ID for a specific project
router.put("/task/:taskId", authenticateToken, validateTask, updateTask);

// Delete a specific task by ID for a specific project
router.delete("/task/:taskId", authenticateToken, deleteTask);

export default router;