import express from "express";
import { createAssignmentForUsers, createAssignmentMyself, deleteAssignmentsFromTask, getAllAssignmentsForTask } from "../controller/assignmentsController";
import { authenticateToken } from "../middlewares/authenticate";
import { authorizeAssignmentsForMember, authorizeAssignmentsForOwnerAndAdmin } from "../middlewares/authorization";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Assignments
 *   description: Task assignment management
 */

/**
 * @swagger
 * /project/{projectId}/task/{taskId}/assignments:
 *   get:
 *     summary: Get all assignments for a task
 *     tags: [Assignments]
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
 *         description: List of assignments retrieved successfully
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
 *                   example: "Assignments fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Assignment ID
 *                       task_id:
 *                         type: string
 *                       user_id:
 *                         type: string
 *                       assigned_by:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have permission
 *       404:
 *         description: Project or task not found
 */
router.get("/project/:projectId/task/:taskId/assignments", authenticateToken, authorizeAssignmentsForMember, getAllAssignmentsForTask);

/**
 * @swagger
 * /project/{projectId}/task/{taskId}/assign-myself:
 *   post:
 *     summary: Assign yourself to a task
 *     tags: [Assignments]
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
 *       201:
 *         description: Successfully assigned yourself to the task
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
 *                   example: "Assignment created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     task_id:
 *                       type: string
 *                     user_id:
 *                       type: string
 *                     assigned_by:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - project is read-only
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have permission
 *       404:
 *         description: Project, task or user not found
 */
router.post("/project/:projectId/task/:taskId/assign-myself", authenticateToken, authorizeAssignmentsForMember, createAssignmentMyself);

/**
 * @swagger
 * /project/{projectId}/task/{taskId}/assign-users:
 *   post:
 *     summary: Assign multiple users to a task (admin/owner only)
 *     tags: [Assignments]
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
 *               - users
 *             properties:
 *               users:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: User ID to assign
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: User email (for notification)
 *     responses:
 *       201:
 *         description: Users assigned successfully
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
 *                   example: "Assignments created successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       newAssignment:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           task_id:
 *                             type: string
 *                           user_id:
 *                             type: string
 *                           assigned_by:
 *                             type: string
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                       status:
 *                         type: string
 *                         enum: [success, exists, error]
 *       400:
 *         description: Bad request - no users provided or project is read-only
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have permission
 *       404:
 *         description: Project, task or user not found
 */
router.post("/project/:projectId/task/:taskId/assign-users", authenticateToken, authorizeAssignmentsForOwnerAndAdmin, createAssignmentForUsers);

/**
 * @swagger
 * /project/{projectId}/task/{taskId}/assign-myself:
 *   delete:
 *     summary: Remove yourself from a task assignment
 *     tags: [Assignments]
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
 *         description: Successfully removed yourself from the task
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
 *                   example: "Assignment removed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     task_id:
 *                       type: string
 *                     user_id:
 *                       type: string
 *       400:
 *         description: Bad request - project is read-only
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have permission
 *       404:
 *         description: Project, task or assignment not found
 */
router.delete("/project/:projectId/task/:taskId/assign-myself", authenticateToken, authorizeAssignmentsForMember, deleteAssignmentsFromTask);

/**
 * @swagger
 * /project/{projectId}/task/{taskId}/assign-users:
 *   delete:
 *     summary: Remove user assignments from a task (admin/owner only)
 *     tags: [Assignments]
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
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: ID of user to unassign
 *     responses:
 *       200:
 *         description: Successfully removed user assignment
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
 *                   example: "Assignment removed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     task_id:
 *                       type: string
 *                     user_id:
 *                       type: string
 *       400:
 *         description: Bad request - project is read-only
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have permission
 *       404:
 *         description: Project, task or assignment not found
 */
router.delete("/project/:projectId/task/:taskId/assign-users", authenticateToken, authorizeAssignmentsForOwnerAndAdmin, deleteAssignmentsFromTask);

export default router;