import express from "express";
import { createTask, deleteTask, getAllTasks, getTaskById, updateTask } from "../controller/taskController";
import { validateProject, validateTask } from "../middlewares/inputValidator";
import { authenticateToken } from "../middlewares/authenticate";
import { authorizeProject, authorizeTask } from "../middlewares/authorization";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management endpoints
 */

/**
 * @swagger
 * /project/{projectId}/tasks/new:
 *   post:
 *     summary: Create a new task in a project
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project where the task is created
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Design Homepage"
 *               description:
 *                 type: string
 *                 example: "Create a homepage design for the project"
 *               due_date:
 *                 type: string
 *                 format: date
 *                 example: "2024-04-15"
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 example: "high"
 *               completed:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Task already exists
 */
router.post("/project/:projectId/tasks/new", authenticateToken, validateTask, createTask);

/**
 * @swagger
 * /project/{projectId}/tasks:
 *   get:
 *     summary: Get all tasks for a specific project
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project to fetch tasks for
 *     responses:
 *       200:
 *         description: Tasks fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */
router.get("/project/:projectId/tasks", authenticateToken, authorizeProject, getAllTasks);

/**
 * @swagger
 * /project/{projectId}/task/{taskId}:
 *   get:
 *     summary: Get a specific task by ID
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project the task belongs to
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the task to retrieve
 *     responses:
 *       200:
 *         description: Task fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */
router.get("/project/:projectId/task/:taskId", authenticateToken, authorizeTask, getTaskById);

/**
 * @swagger
 * /project/{projectId}/task/{taskId}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project the task belongs to
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the task to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Update Homepage Design"
 *               description:
 *                 type: string
 *                 example: "Modify homepage design based on client feedback"
 *               due_date:
 *                 type: string
 *                 format: date
 *                 example: "2024-04-20"
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 example: "medium"
 *               completed:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */
router.put("/project/:projectId/task/:taskId", authenticateToken, authorizeTask, validateTask, updateTask);

/**
 * @swagger
 * /project/{projectId}/task/{taskId}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project the task belongs to
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the task to delete
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */
router.delete("/project/:projectId/task/:taskId", authenticateToken, authorizeTask, deleteTask);

export default router;
