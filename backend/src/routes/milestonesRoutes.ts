import express from "express";
import { authenticateToken } from "../middlewares/authenticate";
import {
    authorizeProject,
    authorizeProjectForOwnerAndAdmin,
} from "../middlewares/authorization";
import {
    getAllMilestonesForProject,
    getMilestoneById,
    getAllTaskForMilestone,
    getAllUnassignedTaskForMilestone,
    createMilestone,
    addMilestoneToTask,
    deleteMilestoneFromTask,
    updateMilestone,
    deleteMilestone,
} from "../controller/milestonesController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Milestones
 *   description: Project milestone management
 */

/**
 * @swagger
 * /project/{projectId}/milestones:
 *   get:
 *     summary: Get all milestones for a project
 *     tags: [Milestones]
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
 *         description: Milestones fetched successfully
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
 *                   example: "Milestones fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Milestone ID
 *                         example: "5f8d0d55b54764421b7156c3"
 *                       name:
 *                         type: string
 *                         description: Milestone name
 *                         example: "Release v1.0"
 *                       description:
 *                         type: string
 *                         description: Milestone description
 *                         example: "Finalize all features for v1.0"
 *                       due_date:
 *                         type: string
 *                         format: date
 *                         description: Milestone due date
 *                         example: "2025-06-30"
 *                       color:
 *                         type: string
 *                         description: Hex code for milestone color
 *                         example: "#FF5733"
 *                       project_id:
 *                         type: string
 *                         description: Project ID associated with the milestone
 *                         example: "5f8d0d55b54764421b7156c4"
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have permission to view milestones
 *       404:
 *         description: Project not found
 */
router.get("/project/:projectId/milestones", authenticateToken, authorizeProject, getAllMilestonesForProject);

/**
 * @swagger
 * /project/{projectId}/milestone/{milestoneId}:
 *   get:
 *     summary: Get a milestone by ID
 *     tags: [Milestones]
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
 *         description: Milestone fetched successfully
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
 *                   example: "Milestone fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Milestone ID
 *                       example: "5f8d0d55b54764421b7156c3"
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     due_date:
 *                       type: string
 *                       format: date
 *                     color:
 *                       type: string
 *                     project_id:
 *                       type: string
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have permission to view this milestone
 *       404:
 *         description: Project or milestone not found
 */
router.get("/project/:projectId/milestone/:milestoneId", authenticateToken, authorizeProject, getMilestoneById);

/**
 * @swagger
 * /project/{projectId}/milestone/{milestoneId}/tasks:
 *   get:
 *     summary: Get all tasks (with subtasks) under a milestone
 *     tags: [Milestones]
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
 *         description: Tasks fetched successfully for the milestone
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
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Task ID
 *                         example: "5f8d0d55b54764421b7156c5"
 *                       title:
 *                         type: string
 *                         description: Task title
 *                         example: "Implement login"
 *                       status:
 *                         type: string
 *                         description: Current status of the task
 *                         example: "in progress"
 *                       priority:
 *                         type: string
 *                         description: Task priority
 *                         example: "high"
 *                       milestone_id:
 *                         type: string
 *                         description: ID of the associated milestone
 *                       labels:
 *                         type: array
 *                         description: Labels associated with the task
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             color:
 *                               type: string
 *                       parent_task_id:
 *                         type: string
 *                         nullable: true
 *                       parent_task_name:
 *                         type: string
 *                         nullable: true
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have permission to view tasks
 *       404:
 *         description: Project or milestone not found
 */
router.get("/project/:projectId/milestone/:milestoneId/tasks", authenticateToken, authorizeProject, getAllTaskForMilestone);

/**
 * @swagger
 * /project/{projectId}/milestone/tasks/unassigned:
 *   get:
 *     summary: Get all tasks under a project that are not assigned to any milestone
 *     tags: [Milestones]
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
 *         description: Unassigned tasks fetched successfully
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
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Task ID
 *                         example: "5f8d0d55b54764421b7156c6"
 *                       title:
 *                         type: string
 *                       status:
 *                         type: string
 *                       priority:
 *                         type: string
 *                       labels:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             color:
 *                               type: string
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have permission to view tasks
 *       404:
 *         description: Project not found
 */
router.get("/project/:projectId/milestone/tasks/unassigned", authenticateToken, authorizeProject, getAllUnassignedTaskForMilestone);

/**
 * @swagger
 * /project/{projectId}/milestone/new:
 *   post:
 *     summary: Create a new milestone for a project
 *     tags: [Milestones]
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
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - due_date
 *               - color
 *             properties:
 *               name:
 *                 type: string
 *                 description: Milestone name (must be unique within project)
 *                 example: "Release v2.0"
 *               description:
 *                 type: string
 *                 description: Milestone description
 *                 example: "Complete all features for v2.0"
 *               due_date:
 *                 type: string
 *                 format: date
 *                 description: Due date of the milestone
 *                 example: "2025-09-30"
 *               color:
 *                 type: string
 *                 description: Hex code for milestone color or empty string to auto-assign
 *                 example: "#33FF57"
 *     responses:
 *       201:
 *         description: Milestone created successfully
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
 *                   example: "Milestone created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Milestone ID
 *                       example: "5f8d0d55b54764421b7156c3"
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     due_date:
 *                       type: string
 *                       format: date
 *                     color:
 *                       type: string
 *                     project_id:
 *                       type: string
 *       400:
 *         description: Bad request - project is read-only or milestone name conflict
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have permission to create milestones for this project
 *       404:
 *         description: Project not found
 *       409:
 *         description: Conflict - milestone already exists
 */
router.post("/project/:projectId/milestone/new", authenticateToken, authorizeProjectForOwnerAndAdmin, createMilestone);

/**
 * @swagger
 * /project/{projectId}/milestone/{milestoneId}/add:
 *   put:
 *     summary: Assign one or more tasks (and their subtasks) to a milestone
 *     tags: [Milestones]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskIds
 *             properties:
 *               taskIds:
 *                 type: array
 *                 description: Array of task IDs to assign
 *                 items:
 *                   type: string
 *                   example: "5f8d0d55b54764421b7156c5"
 *     responses:
 *       200:
 *         description: Tasks updated successfully with milestone
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
 *                   example: "Task updated successfully"
 *                 data:
 *                   type: array
 *                   description: Array of updated task objects
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       milestone_id:
 *                         type: string
 *       400:
 *         description: Bad request - project is read-only or invalid input
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have permission to modify tasks
 *       404:
 *         description: Project, milestone, or task not found
 */
router.put("/project/:projectId/milestone/:milestoneId/add", authenticateToken, authorizeProjectForOwnerAndAdmin, addMilestoneToTask);

/**
 * @swagger
 * /project/{projectId}/milestone/{milestoneId}/remove:
 *   put:
 *     summary: Remove a milestone from a single task (and its subtasks)
 *     tags: [Milestones]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *             properties:
 *               taskId:
 *                 type: string
 *                 description: ID of the task from which to remove the milestone
 *                 example: "5f8d0d55b54764421b7156c5"
 *     responses:
 *       200:
 *         description: Milestone removed from task successfully
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
 *                   example: "Milestone removed from task successfully"
 *                 data:
 *                   type: null
 *       400:
 *         description: Bad request - project is read-only or task is a subtask
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have permission to modify tasks
 *       404:
 *         description: Project, milestone, or task not found
 */
router.put("/project/:projectId/milestone/:milestoneId/remove", authenticateToken, authorizeProjectForOwnerAndAdmin, deleteMilestoneFromTask);

/**
 * @swagger
 * /project/{projectId}/milestone/{milestoneId}/update:
 *   put:
 *     summary: Update an existing milestone
 *     tags: [Milestones]
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
 *         description: ID of the milestone to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - due_date
 *               - color
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated milestone name
 *                 example: "Release v2.1"
 *               description:
 *                 type: string
 *                 description: Updated milestone description
 *                 example: "Finalize feature X"
 *               due_date:
 *                 type: string
 *                 format: date
 *                 description: Updated due date
 *                 example: "2025-07-31"
 *               color:
 *                 type: string
 *                 description: Updated hex code for milestone color
 *                 example: "#3357FF"
 *     responses:
 *       200:
 *         description: Milestone updated successfully
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
 *                   example: "Milestone updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     due_date:
 *                       type: string
 *                       format: date
 *                     color:
 *                       type: string
 *                     project_id:
 *                       type: string
 *       400:
 *         description: Bad request - project is read-only, milestone name conflict, or no changes detected
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have permission to update milestones
 *       404:
 *         description: Project or milestone not found
 */
router.put("/project/:projectId/milestone/:milestoneId/update", authenticateToken, authorizeProjectForOwnerAndAdmin, updateMilestone);

/**
 * @swagger
 * /project/{projectId}/milestone/{milestoneId}/delete:
 *   delete:
 *     summary: Delete a milestone from a project
 *     tags: [Milestones]
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
 *         description: ID of the milestone to delete
 *     responses:
 *       200:
 *         description: Milestone deleted successfully
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
 *                   example: "Milestone deleted successfully"
 *                 data:
 *                   type: null
 *       400:
 *         description: Bad request - project is read-only
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have permission to delete milestones
 *       404:
 *         description: Project or milestone not found
 */
router.delete("/project/:projectId/milestone/:milestoneId/delete", authenticateToken, authorizeProjectForOwnerAndAdmin, deleteMilestone);

export default router;
