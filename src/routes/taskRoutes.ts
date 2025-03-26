import express from "express";
import { createTask, deleteTask, getAllTasks, getTaskById, updateTask } from "../controller/taskController";
import { validateProject, validateTask } from "../middlewares/inputValidator";
import { authenticateToken } from "../middlewares/authenticate";
import { authorizeProject, authorizeTask } from "../middlewares/authorization";

const router = express.Router();

// Create a task for a specific user
router.post("/project/:projectId/tasks/new", authenticateToken, validateTask, createTask);

// Get all tasks for a specific project
router.get("/project/:projectId/tasks", authenticateToken, authorizeProject, validateProject, getAllTasks);

// Get a specific task by ID for a specific project
router.get("/project/:projectId/task/:taskId", authenticateToken, authorizeTask, getTaskById);

// Update a specific task by ID for a specific project
router.put("/project/:projectId/task/:taskId", authenticateToken, authorizeTask, validateTask, updateTask);

// Delete a specific task by ID for a specific project
router.delete("/project/:projectId/task/:taskId", authenticateToken, authorizeTask, deleteTask);

export default router;