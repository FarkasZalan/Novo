import express from "express";
import { createProject, deleteProject, getAllProjects, getProjectById, updateProject } from "../controller/projectController";
import { validateProject } from "../middlewares/inputValidator";
import { authenticateToken } from "../middlewares/authenticate";
import { authorizeProject } from "../middlewares/authorization";

const router = express.Router();

// project routes with authentication and authorization
router.post("/project/new", authenticateToken, validateProject, createProject);
router.get("/projects", authenticateToken, getAllProjects);
router.get("/project/:projectId", authenticateToken, authorizeProject, getProjectById);
router.put("/project/:projectId", authenticateToken, authorizeProject, validateProject, updateProject);
router.delete("/project/:projectId", authenticateToken, authorizeProject, deleteProject);

export default router;