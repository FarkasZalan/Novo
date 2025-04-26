import { getFilesForProject, deleteFileFromProject, uploadProjectFile, downloadFile, getAllFilesForTask, uploadTaskFile } from "../controller/filesController";
import { authenticateToken } from "../middlewares/authenticate";
import { authorizeProject, authorizeProjectForOwnerAndAdmin, authorizeTask, authorizeTaskForOwnerAndAdmin } from "../middlewares/authorization";
import express from "express";
import { upload } from "../middlewares/fileUpload";

const router = express.Router();

// project files routes
router.get("/project/:projectId/files", authenticateToken, authorizeProject, getFilesForProject);

router.post("/project/:projectId/files", authenticateToken, authorizeProjectForOwnerAndAdmin, upload.single("file"), uploadProjectFile);

router.get("/project/:projectId/files/:fileId", authenticateToken, authorizeProject, downloadFile);

router.delete("/project/:projectId/files/:fileId", authenticateToken, authorizeProjectForOwnerAndAdmin, deleteFileFromProject);

// task files routes
router.get("/project/:projectId/task/:taskId/files", authenticateToken, authorizeTask, getAllFilesForTask);

router.post("/project/:projectId/task/:taskId/files", authenticateToken, authorizeTaskForOwnerAndAdmin, upload.single("file"), uploadTaskFile);

router.get("/project/:projectId/task/:taskId/files/:fileId", authenticateToken, authorizeProject, downloadFile);

router.delete("/project/:projectId/task/:taskId/files/:fileId", authenticateToken, authorizeTaskForOwnerAndAdmin, deleteFileFromProject);

export default router;