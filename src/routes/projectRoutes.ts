import express from "express";
import { createProject, deleteProject, getAllProjects, getProjectById, updateProject } from "../controller/projectController";
import { authenticateToken } from "../middlewares/authorization";
import { validateProject } from "../middlewares/inputValidator";

const router = express.Router();

// Create a project for a specific user
router.post("/create-project", authenticateToken, validateProject, createProject);

// Get all projects for a specific user
router.get("/user/:userId/projects", authenticateToken, getAllProjects);

// Get a specific project by ID for a specific user
router.get("/project/:projectId", authenticateToken, getProjectById);

// Update a specific project by ID for a specific user
router.put("/project/:projectId", authenticateToken, validateProject, updateProject);

// Delete a specific project by ID for a specific user
router.delete("/project/:projectId", authenticateToken, deleteProject);

export default router;