import express from "express";
import { authenticateToken } from "../middlewares/authenticate";
import { authorizeTask } from "../middlewares/authorization";
import {
    createComment,
    deleteComment,
    getAllCommentsForTask,
    updateComment,
} from "../controller/commentsController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Task comment management
 */

/**
 * @swagger
 * /project/{projectId}/task/{taskId}/comments:
 *   get:
 *     summary: Get all comments for a task
 *     tags: [Comments]
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
 *         description: List of comments retrieved successfully
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
 *                   example: "Comments fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Comment ID
 *                         example: 5f8d0d55b54764421b7156c3
 *                       comment:
 *                         type: string
 *                         description: Comment text
 *                         example: "This task needs clarification."
 *                       author_id:
 *                         type: string
 *                         description: ID of the comment author
 *                         example: 5f8d0d55b54764421b7156c3
 *                       author_name:
 *                         type: string
 *                         description: Name of the comment author
 *                         example: "Jane Doe"
 *                       author_email:
 *                         type: string
 *                         format: email
 *                         description: Email of the comment author
 *                         example: "jane@example.com"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: Timestamp when the comment was created
 *                         example: "2025-05-15T14:35:00.000Z"
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have permission to view comments on this task
 *       404:
 *         description: Project or task not found
 */
router.get("/project/:projectId/task/:taskId/comments", authenticateToken, authorizeTask, getAllCommentsForTask);

/**
 * @swagger
 * /project/{projectId}/task/{taskId}/comment/new:
 *   post:
 *     summary: Create a new comment on a task
 *     tags: [Comments]
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
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - author_id
 *               - comment
 *             properties:
 *               author_id:
 *                 type: string
 *                 description: ID of the user creating the comment
 *                 example: 5f8d0d55b54764421b7156c3
 *               comment:
 *                 type: string
 *                 description: Comment text
 *                 example: "Please review the requirements again."
 *     responses:
 *       200:
 *         description: Comment created successfully
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
 *                   example: "Comment created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Comment ID
 *                       example: 5f8d0d55b54764421b7156c3
 *                     comment:
 *                       type: string
 *                     author_id:
 *                       type: string
 *                     author_name:
 *                       type: string
 *                     author_email:
 *                       type: string
 *                       format: email
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - project is read-only or invalid input
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have permission to comment on this task
 *       404:
 *         description: Project or task not found
 */
router.post("/project/:projectId/task/:taskId/comment/new", authenticateToken, authorizeTask, createComment);

/**
 * @swagger
 * /project/{projectId}/task/{taskId}/comment/update:
 *   put:
 *     summary: Update an existing comment on a task
 *     tags: [Comments]
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
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - commentId
 *               - comment
 *             properties:
 *               commentId:
 *                 type: string
 *                 description: ID of the comment to update
 *                 example: 5f8d0d55b54764421b7156c3
 *               comment:
 *                 type: string
 *                 description: Updated comment text
 *                 example: "Updated comment content."
 *     responses:
 *       200:
 *         description: Comment updated successfully
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
 *                   example: "Comment updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     comment:
 *                       type: string
 *                     author_id:
 *                       type: string
 *                     author_name:
 *                       type: string
 *                     author_email:
 *                       type: string
 *                       format: email
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - project is read-only or invalid input
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user not author of the comment
 *       404:
 *         description: Project, task, or comment not found
 */
router.put("/project/:projectId/task/:taskId/comment/update", authenticateToken, authorizeTask, updateComment);

/**
 * @swagger
 * /project/{projectId}/task/{taskId}/comment/delete:
 *   delete:
 *     summary: Delete a comment from a task
 *     tags: [Comments]
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
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - commentId
 *             properties:
 *               commentId:
 *                 type: string
 *                 description: ID of the comment to delete
 *                 example: 5f8d0d55b54764421b7156c3
 *     responses:
 *       200:
 *         description: Comment deleted successfully
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
 *                   example: "Comment deleted successfully"
 *                 data:
 *                   type: null
 *       400:
 *         description: Bad request - project is read-only
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have permission to delete this comment
 *       404:
 *         description: Project, task, or comment not found
 */
router.delete("/project/:projectId/task/:taskId/comment/delete", authenticateToken, authorizeTask, deleteComment);

export default router;