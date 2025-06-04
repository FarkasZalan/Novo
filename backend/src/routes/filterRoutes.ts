import express from "express";
import { authenticateToken } from "../middlewares/authenticate";
import {
    getAllFilteredLogForUser,
    getAllTaskByNameBasedOnMilestone,
    getAllUnassignedTaskForMilestone,
    getAllUserByNameOrEmail,
} from "../controller/FilterController";
import { authorizeProject, authorizeProjectForOwnerAndAdmin } from "../middlewares/authorization";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Filters
 *   description: Endpoints for filtering users, tasks, and logs
 */

/**
 * @swagger
 * /all-filtered-logs:
 *   get:
 *     summary: Get all activity logs for the authenticated user, optionally filtered
 *     tags: [Filters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Return logs from this date (inclusive)
 *         example: "2025-05-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Return logs up to this date (inclusive)
 *         example: "2025-05-31"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter logs by type (e.g., "comment", "assignment")
 *         example: "comment"
 *     responses:
 *       200:
 *         description: List of filtered logs retrieved successfully
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
 *                   example: "Logs fetched successfully"
 *                 data:
 *                   type: array
 *                   description: Array of log entries
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Log ID
 *                         example: "5f8d0d55b54764421b7156c3"
 *                       user_id:
 *                         type: string
 *                         description: ID of the user who performed the action
 *                         example: "5f8d0d55b54764421b7156c3"
 *                       action:
 *                         type: string
 *                         description: Description of the action
 *                         example: "Created a new comment"
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                         description: When the action occurred
 *                         example: "2025-05-15T14:35:00.000Z"
 *                       metadata:
 *                         type: object
 *                         description: Additional data related to the log entry
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       400:
 *         description: Bad request - invalid filter parameters
 */
router.get("/all-filtered-logs", authenticateToken, getAllFilteredLogForUser);

/**
 * @swagger
 * /project/{projectId}/all-user-filter:
 *   get:
 *     summary: Get all users in a project matching a name or email filter (owner/admin only)
 *     tags: [Filters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the project
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search term to match against user name or email
 *         example: "john"
 *     responses:
 *       200:
 *         description: List of users matching the filter
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
 *                   example: "Users fetched successfully"
 *                 data:
 *                   type: array
 *                   description: Array of users
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: User ID
 *                         example: "5f8d0d55b54764421b7156c3"
 *                       name:
 *                         type: string
 *                         description: User's full name
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         format: email
 *                         description: User's email address
 *                         example: "john@example.com"
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user is not owner or admin of this project
 *       404:
 *         description: Project not found
 */
router.get("/project/:projectId/all-user-filter", authenticateToken, authorizeProjectForOwnerAndAdmin, getAllUserByNameOrEmail);

/**
 * @swagger
 * /project/{projectId}/milestone/{milestoneId}/all-task-filter:
 *   get:
 *     summary: Get all tasks under a specific milestone matching a name filter
 *     tags: [Filters]
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
 *         name: milestoneId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the milestone
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: false
 *         description: Search term to match against task title
 *         example: "design"
 *     responses:
 *       200:
 *         description: List of tasks matching the filter
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
 *                   example: "Tasks fetched successfully"
 *                 data:
 *                   type: array
 *                   description: Array of tasks
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Task ID
 *                         example: "5f8d0d55b54764421b7156c3"
 *                       title:
 *                         type: string
 *                         description: Task title
 *                         example: "Design homepage"
 *                       milestone_id:
 *                         type: string
 *                         description: Milestone ID that the task belongs to
 *                         example: "5f8d0d55b54764421b7156c4"
 *                       status:
 *                         type: string
 *                         description: Current status of the task
 *                         example: "in progress"
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have permission to view tasks for this project
 *       404:
 *         description: Project or milestone not found
 */
router.get("/project/:projectId/milestone/:milestoneId/all-task-filter", authenticateToken, authorizeProject, getAllTaskByNameBasedOnMilestone);

/**
 * @swagger
 * /project/{projectId}/unassigned-tasks-filter:
 *   get:
 *     summary: Get all tasks under a project that are not yet assigned to any user (owner/admin only)
 *     tags: [Filters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the project
 *       - in: query
 *         name: milestoneId
 *         schema:
 *           type: string
 *         required: false
 *         description: (Optional) Filter unassigned tasks by milestone ID
 *         example: "5f8d0d55b54764421b7156c4"
 *     responses:
 *       200:
 *         description: List of unassigned tasks retrieved successfully
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
 *                   example: "Unassigned tasks fetched successfully"
 *                 data:
 *                   type: array
 *                   description: Array of unassigned tasks
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Task ID
 *                         example: "5f8d0d55b54764421b7156c3"
 *                       title:
 *                         type: string
 *                         description: Task title
 *                         example: "Backend API integration"
 *                       milestone_id:
 *                         type: string
 *                         description: Milestone ID for the task
 *                         example: "5f8d0d55b54764421b7156c4"
 *                       due_date:
 *                         type: string
 *                         format: date
 *                         description: Due date of the task
 *                         example: "2025-06-15"
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user is not owner or admin of this project
 *       404:
 *         description: Project not found
 */
router.get("/project/:projectId/unassigned-tasks-filter", authenticateToken, authorizeProjectForOwnerAndAdmin, getAllUnassignedTaskForMilestone);

export default router;
