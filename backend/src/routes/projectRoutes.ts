import express from "express";
import {
    createProject,
    deleteProject,
    getAllProjects,
    getProjectById,
    updateProject
} from "../controller/projectController";
import { validateProject } from "../middlewares/inputValidator";
import { authenticateToken } from "../middlewares/authenticate";
import { authorizeProject, authorizeProjectForOwner } from "../middlewares/authorization";


const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management endpoints
 */

/**
 * @swagger
 * /project/new:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: "New Project"
 *               description:
 *                 type: string
 *                 example: "Project description here"
 *               userId:
 *                 type: string
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       201:
 *         description: Project created successfully
 *       409:
 *         description: Project already exists
 */
router.post("/project/new", authenticateToken, validateProject, createProject);

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Projects fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/projects", authenticateToken, getAllProjects);


/**
 * @swagger
 * /project/{projectId}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Project fetched successfully
 *       404:
 *         description: Project not found
 */
router.get("/project/:projectId", authenticateToken, authorizeProject, getProjectById);

/**
 * @swagger
 * /project/{projectId}:
 *   put:
 *     summary: Update a project
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Project Name"
 *               description:
 *                 type: string
 *                 example: "Updated project description"
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       404:
 *         description: Project not found
 */
router.put("/project/:projectId", authenticateToken, authorizeProjectForOwner, validateProject, updateProject);

/**
 * @swagger
 * /project/{projectId}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 */
router.delete("/project/:projectId", authenticateToken, authorizeProjectForOwner, deleteProject);

export default router;
