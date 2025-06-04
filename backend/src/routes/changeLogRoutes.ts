import express from "express";
import { authenticateToken } from "../middlewares/authenticate";
import { getCommentLogs, getDahboardLogForUser, getMilestoneLogs, getProjectLogs, getTaskLogs, getUserLog } from "../controller/changesLogController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Change Logs
 *   description: Activity and change tracking
 */

/**
 * @swagger
 * /dashboard-logs:
 *   get:
 *     summary: Get recent activity logs for user's dashboard
 *     tags: [Change Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent activity logs retrieved successfully
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
 *                   example: "Project change logs successfully fetched"
 *                 data:
 *                   type: array
 *                   items:
 *                     oneOf:
 *                       - $ref: '#/components/schemas/AssignmentLog'
 *                       - $ref: '#/components/schemas/CommentLog'
 *                       - $ref: '#/components/schemas/MilestoneLog'
 *                       - $ref: '#/components/schemas/FileLog'
 *                       - $ref: '#/components/schemas/ProjectMemberLog'
 *                       - $ref: '#/components/schemas/TaskLabelLog'
 *                       - $ref: '#/components/schemas/ProjectLog'
 *                       - $ref: '#/components/schemas/TaskLog'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get("/dashboard-logs", authenticateToken, getDahboardLogForUser);

/**
 * @swagger
 * /project/{projectId}/logs:
 *   get:
 *     summary: Get change logs for a specific project
 *     tags: [Change Logs]
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
 *         description: Project change logs retrieved successfully
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
 *                   example: "Project change logs successfully fetched"
 *                 data:
 *                   type: array
 *                   items:
 *                     oneOf:
 *                       - $ref: '#/components/schemas/AssignmentLog'
 *                       - $ref: '#/components/schemas/CommentLog'
 *                       - $ref: '#/components/schemas/MilestoneLog'
 *                       - $ref: '#/components/schemas/FileLog'
 *                       - $ref: '#/components/schemas/ProjectMemberLog'
 *                       - $ref: '#/components/schemas/TaskLabelLog'
 *                       - $ref: '#/components/schemas/ProjectLog'
 *                       - $ref: '#/components/schemas/TaskLog'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have access to project
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.get("/project/:projectId/logs", authenticateToken, getProjectLogs);

/**
 * @swagger
 * /project/{projectId}/task/{taskId}/logs:
 *   get:
 *     summary: Get change logs for a specific task
 *     tags: [Change Logs]
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
 *         description: Task change logs retrieved successfully
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
 *                   example: "Project change logs successfully fetched"
 *                 data:
 *                   type: array
 *                   items:
 *                     oneOf:
 *                       - $ref: '#/components/schemas/AssignmentLog'
 *                       - $ref: '#/components/schemas/FileLog'
 *                       - $ref: '#/components/schemas/TaskLabelLog'
 *                       - $ref: '#/components/schemas/TaskLog'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have access to project
 *       404:
 *         description: Project or task not found
 *       500:
 *         description: Internal server error
 */
router.get("/project/:projectId/task/:taskId/logs", authenticateToken, getTaskLogs);

/**
 * @swagger
 * /project/{projectId}/task/{taskId}/comment/{commentId}/logs:
 *   get:
 *     summary: Get change logs for a specific comment
 *     tags: [Change Logs]
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
 *         name: commentId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the comment
 *     responses:
 *       200:
 *         description: Comment change logs retrieved successfully
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
 *                   example: "Project change logs successfully fetched"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CommentLog'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have access to project
 *       404:
 *         description: Project, task or comment not found
 *       500:
 *         description: Internal server error
 */
router.get("/project/:projectId/task/:taskId/comment/:commentId/logs", authenticateToken, getCommentLogs);

/**
 * @swagger
 * /project/{projectId}/milestone/{milestoneId}/logs:
 *   get:
 *     summary: Get change logs for a specific milestone
 *     tags: [Change Logs]
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
 *     responses:
 *       200:
 *         description: Milestone change logs retrieved successfully
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
 *                   example: "Project change logs successfully fetched"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MilestoneLog'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have access to project
 *       404:
 *         description: Project or milestone not found
 *       500:
 *         description: Internal server error
 */
router.get("/project/:projectId/milestone/:milestoneId/logs", authenticateToken, getMilestoneLogs);

/**
 * @swagger
 * /user-logs:
 *   get:
 *     summary: Get change logs for the authenticated user
 *     tags: [Change Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User change logs retrieved successfully
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
 *                   example: "Project change logs successfully fetched"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserLog'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get("/user-logs", authenticateToken, getUserLog);

/**
 * @swagger
 * components:
 *   schemas:
 *     BaseLog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The log ID
 *         table_name:
 *           type: string
 *           description: The table that was modified
 *         operation:
 *           type: string
 *           enum: [INSERT, UPDATE, DELETE]
 *           description: Type of operation
 *         changed_by:
 *           type: string
 *           description: ID of user who made the change
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: When the change was logged
 *         projectName:
 *           type: string
 *           description: Name of the project (for dashboard logs)
 * 
 *     AssignmentLog:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseLog'
 *         - type: object
 *           properties:
 *             assignment:
 *               type: object
 *               properties:
 *                 task_id:
 *                   type: string
 *                 user_id:
 *                   type: string
 *                 task_title:
 *                   type: string
 *                 assigned_by_name:
 *                   type: string
 *                 assigned_by_email:
 *                   type: string
 *                 user_name:
 *                   type: string
 *                 user_email:
 *                   type: string
 * 
 *     CommentLog:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseLog'
 *         - type: object
 *           properties:
 *             comment:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: string
 *                 user_name:
 *                   type: string
 *                 user_email:
 *                   type: string
 *                 comment:
 *                   type: string
 *                 task_title:
 *                   type: string
 * 
 *     MilestoneLog:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseLog'
 *         - type: object
 *           properties:
 *             milestone:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                 id:
 *                   type: string
 *                 project_id:
 *                   type: string
 * 
 *     FileLog:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseLog'
 *         - type: object
 *           properties:
 *             file:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                 id:
 *                   type: string
 *                 project_id:
 *                   type: string
 *                 task_id:
 *                   type: string
 *                 task_title:
 *                   type: string
 * 
 *     ProjectMemberLog:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseLog'
 *         - type: object
 *           properties:
 *             projectMember:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: string
 *                 user_name:
 *                   type: string
 *                 user_email:
 *                   type: string
 *                 project_id:
 *                   type: string
 *                 inviter_user_id:
 *                   type: string
 *                 inviter_user_name:
 *                   type: string
 *                 inviter_user_email:
 *                   type: string
 * 
 *     TaskLabelLog:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseLog'
 *         - type: object
 *           properties:
 *             task_label:
 *               type: object
 *               properties:
 *                 task_id:
 *                   type: string
 *                 task_title:
 *                   type: string
 *                 label_id:
 *                   type: string
 *                 label_name:
 *                   type: string
 *                 project_id:
 *                   type: string
 * 
 *     ProjectLog:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseLog'
 * 
 *     TaskLog:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseLog'
 *         - type: object
 *           properties:
 *             task:
 *               type: object
 *               properties:
 *                 task_id:
 *                   type: string
 *                 task_title:
 *                   type: string
 *                 project_id:
 *                   type: string
 *                 milestone_id:
 *                   type: string
 *                 milestone_name:
 *                   type: string
 *                 parent_task_id:
 *                   type: string
 *                 parent_task_title:
 *                   type: string
 * 
 *     UserLog:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseLog'
 *         - type: object
 *           properties:
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 */

export default router;