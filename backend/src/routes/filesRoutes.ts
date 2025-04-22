import { getFilesForProject, deleteFile, createFile, downloadFile } from "../controller/filesController";
import { authenticateToken } from "../middlewares/authenticate";
import { authorizeProject } from "../middlewares/authorization";
import express from "express";
import { upload } from "../middlewares/fileUpload";

const router = express.Router();

router.get("/project/:projectId/files", authenticateToken, authorizeProject, getFilesForProject);

router.post("/project/:projectId/files", authenticateToken, authorizeProject, upload.single("file"), createFile);

router.get("/project/:projectId/files/:fileId", authenticateToken, authorizeProject, downloadFile);

router.delete("/project/:projectId/files/:fileId", authenticateToken, authorizeProject, deleteFile);

export default router;