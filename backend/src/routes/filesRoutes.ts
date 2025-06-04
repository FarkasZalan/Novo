import express from "express";
import { authenticateToken } from "../middlewares/authenticate";
import {
    authorizeProject,
    authorizeProjectForOwnerAndAdmin,
    authorizeTask,
    authorizeTaskForOwnerAndAdmin,
} from "../middlewares/authorization";
import { upload } from "../middlewares/fileUpload";
import {
    getFilesForProject,
    deleteFileFromProject,
    uploadProjectFile,
    downloadFile,
    getAllFilesForTask,
    uploadTaskFile,
    deleteFileFromTask,
} from "../controller/filesController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: File management for projects and tasks
 */

/**
 * @swagger
 * /project/{projectId}/files:
 *   get:
 *     summary: Get all files for a project
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the project
 *     responses:
 *       200:
 *         description: Files fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Files fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: File ID
 *                         example: "5f8d0d55b54764421b7156c3"
 *                       file_name:
 *                         type: string
 *                         description: Original file name
 *                         example: "document.pdf"
 *                       mime_type:
 *                         type: string
 *                         description: MIME type of the file
 *                         example: "application/pdf"
 *                       size:
 *                         type: integer
 *                         description: File size in bytes
 *                         example: 102400
 *                       uploaded_by:
 *                         type: string
 *                         description: ID of the user who uploaded the file
 *                         example: "5f8d0d55b54764421b7156c3"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: Timestamp when the file was uploaded
 *                         example: "2025-05-20T10:15:00.000Z"
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have permission to view project files
 *       404:
 *         description: Project not found
 */
router.get("/project/:projectId/files", authenticateToken, authorizeProject, getFilesForProject);

/**
 * @swagger
 * /project/{projectId}/files:
 *   post:
 *     summary: Upload a file to a project (owner/admin only)
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the project
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - uploaded_by
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload
 *               uploaded_by:
 *                 type: string
 *                 description: ID of the user uploading the file
 *                 example: "5f8d0d55b54764421b7156c3"
 *     responses:
 *       201:
 *         description: File uploaded and saved to the database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "File uploaded and saved to DB"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: File ID
 *                       example: "5f8d0d55b54764421b7156c3"
 *                     file_name:
 *                       type: string
 *                     mime_type:
 *                       type: string
 *                     size:
 *                       type: integer
 *                     uploaded_by:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - no file uploaded or project is read-only
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have permission to upload to this project
 *       404:
 *         description: Project not found
 */
router.post("/project/:projectId/files", authenticateToken, authorizeProjectForOwnerAndAdmin, upload.single("file"), uploadProjectFile);

/**
 * @swagger
 * /project/{projectId}/files/{fileId}:
 *   get:
 *     summary: Download a project file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the project
 *       - in: path
 *         name: fileId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the file to download
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have permission to download this file
 *       404:
 *         description: Project or file not found
 */
router.get("/project/:projectId/files/:fileId", authenticateToken, authorizeProject, downloadFile);

/**
 * @swagger
 * /project/{projectId}/files/{fileId}:
 *   delete:
 *     summary: Delete a file from a project (owner/admin only)
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the project
 *       - in: path
 *         name: fileId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the file to delete
 *     responses:
 *       200:
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "File deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Deleted file ID
 *                     file_name:
 *                       type: string
 *                     mime_type:
 *                       type: string
 *                     size:
 *                       type: integer
 *                     uploaded_by:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have permission to delete this file
 *       404:
 *         description: Project or file not found
 */
router.delete("/project/:projectId/files/:fileId", authenticateToken, authorizeProjectForOwnerAndAdmin, deleteFileFromProject);

/**
 * @swagger
 * /project/{projectId}/task/{taskId}/files:
 *   get:
 *     summary: Get all files for a task
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the project
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the task
 *     responses:
 *       200:
 *         description: Files fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Files fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: File ID
 *                         example: "5f8d0d55b54764421b7156c3"
 *                       file_name:
 *                         type: string
 *                       mime_type:
 *                         type: string
 *                       size:
 *                         type: integer
 *                       uploaded_by:
 *                         type: string
 *                       task_id:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have permission to view task files
 *       404:
 *         description: Project or task not found
 */
router.get("/project/:projectId/task/:taskId/files", authenticateToken, authorizeTask, getAllFilesForTask);

/**
 * @swagger
 * /project/{projectId}/task/{taskId}/files:
 *   post:
 *     summary: Upload a file to a task (task owner/admin only)
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the project
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the task
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - uploaded_by
 *               - task_id
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload
 *               uploaded_by:
 *                 type: string
 *                 description: ID of the user uploading the file
 *                 example: "5f8d0d55b54764421b7156c3"
 *               task_id:
 *                 type: string
 *                 description: ID of the task
 *                 example: "5f8d0d55b54764421b7156c3"
 *     responses:
 *       201:
 *         description: File uploaded and saved to the database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "File uploaded and saved to DB"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: File ID
 *                       example: "5f8d0d55b54764421b7156c3"
 *                     file_name:
 *                       type: string
 *                     mime_type:
 *                       type: string
 *                     size:
 *                       type: integer
 *                     uploaded_by:
 *                       type: string
 *                     task_id:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - no file uploaded or project is read-only
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have permission to upload to this task
 *       404:
 *         description: Project or task not found
 */
router.post("/project/:projectId/task/:taskId/files", authenticateToken, authorizeTaskForOwnerAndAdmin, upload.single("file"), uploadTaskFile);

/**
 * @swagger
 * /project/{projectId}/task/{taskId}/files/{fileId}:
 *   get:
 *     summary: Download a task file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the project
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the task
 *       - in: path
 *         name: fileId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the file to download
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have permission to download this file
 *       404:
 *         description: Project, task, or file not found
 */
router.get("/project/:projectId/task/:taskId/files/:fileId", authenticateToken, authorizeProject, downloadFile);

/**
 * @swagger
 * /project/{projectId}/task/{taskId}/files/{fileId}:
 *   delete:
 *     summary: Delete a file from a task (task owner/admin only)
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the project
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the task
 *       - in: path
 *         name: fileId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the file to delete
 *     responses:
 *       200:
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "File deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Deleted file ID
 *                     file_name:
 *                       type: string
 *                     mime_type:
 *                       type: string
 *                     size:
 *                       type: integer
 *                     uploaded_by:
 *                       type: string
 *                     task_id:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have permission to delete this file
 *       404:
 *         description: Project, task, or file not found
 */
router.delete("/project/:projectId/task/:taskId/files/:fileId", authenticateToken, authorizeTaskForOwnerAndAdmin, deleteFileFromTask);

export default router;
