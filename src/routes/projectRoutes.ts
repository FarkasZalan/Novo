import express from "express";
import { createProject, deleteProject, getAllProjects, getProjectById, updateProject } from "../controller/projectController";

const router = express.Router();

// Create a project for a specific user
router.post("/user/:userId/project", createProject);

// Get all projects for a specific user
router.get("/user/:userId/projects", getAllProjects);

// Get a specific project by ID for a specific user
router.get("/user/:userId/project/:projectId", getProjectById);

// Update a specific project by ID for a specific user
router.put("/user/:userId/project/:projectId", updateProject);

// Delete a specific project by ID for a specific user
router.delete("/user/:userId/project/:projectId", deleteProject);

export default router;