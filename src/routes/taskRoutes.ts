import express from "express";
import { createTask, deleteTask, getAllTasks, getTaskById, updateTask } from "../controller/taskController";
import { validateProject, validateTask } from "../middlewares/inputValidator";
import { authenticateToken } from "../middlewares/authenticate";
import { authorizeProject, authorizeTask } from "../middlewares/authorization";

const router = express.Router();

// task routes with authentication and authorization
router.post("/project/:projectId/tasks/new", authenticateToken, validateTask, createTask);
router.get("/project/:projectId/tasks", authenticateToken, authorizeProject, validateProject, getAllTasks);
router.get("/project/:projectId/task/:taskId", authenticateToken, authorizeTask, getTaskById);
router.put("/project/:projectId/task/:taskId", authenticateToken, authorizeTask, validateTask, updateTask);
router.delete("/project/:projectId/task/:taskId", authenticateToken, authorizeTask, deleteTask);

export default router;