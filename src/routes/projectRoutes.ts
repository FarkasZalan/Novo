import express from "express";
import { createProject, deleteProject, getAllProjects, getProjectById, updateProject } from "../controller/projectController";
import { validateProject } from "../middlewares/inputValidator";
import { authenticateToken } from "../middlewares/authenticate";
import { authorizeProject } from "../middlewares/authorization";

const router = express.Router();

// Create a project for a specific user
router.post("/project/new", authenticateToken, validateProject, createProject);

// Get all projects for a specific user
router.get("/projects", authenticateToken, getAllProjects);

// Get a specific project by ID for a specific user
router.get("/project/:projectId", authenticateToken, authorizeProject, getProjectById);

// Update a specific project by ID for a specific user
router.put("/project/:projectId", authenticateToken, authorizeProject, validateProject, updateProject);

// Delete a specific project by ID for a specific user
router.delete("/project/:projectId", authenticateToken, authorizeProject, deleteProject);

export default router;