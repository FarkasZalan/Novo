import express from "express";
import { authenticateToken } from "../middlewares/authenticate";
import {
    authorizeProject,
    authorizeProjectForOwnerAndAdmin,
} from "../middlewares/authorization";
import {
    createLabel,
    deleteLabel,
    getAllLabelForProject,
    getAllLabelForTask,
    updateLabel,
} from "../controller/labelController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Labels
 *   description: Project and task label management
 */

/**
 * @swagger
 * /project/{projectId}/labels:
 *   get:
 *     summary: Get all labels for a project
 *     tags: [Labels]
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
 *         description: Labels fetched successfully
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
 *                   example: "Labels fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Label ID
 *                         example: "5f8d0d55b54764421b7156c3"
 *                       name:
 *                         type: string
 *                         description: Label name
 *                         example: "Bug"
 *                       description:
 *                         type: string
 *                         description: Label description
 *                         example: "Issues that need fixing"
 *                       color:
 *                         type: string
 *                         description: Hex code for label color
 *                         example: "#FF0000"
 *                       project_id:
 *                         type: string
 *                         description: Project ID associated with the label
 *                         example: "5f8d0d55b54764421b7156c4"
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have permission to view labels for this project
 *       404:
 *         description: Project not found
 */
router.get("/project/:projectId/labels", authenticateToken, authorizeProject, getAllLabelForProject);

/**
 * @swagger
 * /project/{projectId}/label/new:
 *   post:
 *     summary: Create a new label for a project
 *     tags: [Labels]
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
 *               - color
 *             properties:
 *               name:
 *                 type: string
 *                 description: Label name (must be unique within project)
 *                 example: "Feature"
 *               description:
 *                 type: string
 *                 description: Description of the label
 *                 example: "New feature request"
 *               color:
 *                 type: string
 *                 description: Hex code for label color
 *                 example: "#00FF00"
 *     responses:
 *       200:
 *         description: Label created successfully
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
 *                   example: "Label created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Created label ID
 *                       example: "5f8d0d55b54764421b7156c3"
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     color:
 *                       type: string
 *                     project_id:
 *                       type: string
 *       400:
 *         description: Bad request - project is read-only, label name already exists, or invalid input
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have permission to create labels for this project
 *       404:
 *         description: Project not found
 */
router.post("/project/:projectId/label/new", authenticateToken, authorizeProjectForOwnerAndAdmin, createLabel);

/**
 * @swagger
 * /project/{projectId}/label/{labelId}/update:
 *   put:
 *     summary: Update an existing label for a project
 *     tags: [Labels]
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
 *         name: labelId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the label to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - color
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated label name
 *                 example: "Bug"
 *               description:
 *                 type: string
 *                 description: Updated label description
 *                 example: "Defects that need fixing"
 *               color:
 *                 type: string
 *                 description: Updated hex code for label color
 *                 example: "#FF0000"
 *     responses:
 *       200:
 *         description: Label updated successfully
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
 *                   example: "Label updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     color:
 *                       type: string
 *                     project_id:
 *                       type: string
 *       400:
 *         description: Bad request - project is read-only, label name conflict, or no changes detected
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have permission to update labels for this project
 *       404:
 *         description: Project or label not found
 */
router.put("/project/:projectId/label/:labelId/update", authenticateToken, authorizeProjectForOwnerAndAdmin, updateLabel);

/**
 * @swagger
 * /project/{projectId}/label/{labelId}/delete:
 *   delete:
 *     summary: Delete a label from a project
 *     tags: [Labels]
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
 *         name: labelId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the label to delete
 *     responses:
 *       200:
 *         description: Label deleted successfully
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
 *                   example: "Label deleted successfully"
 *                 data:
 *                   type: null
 *       400:
 *         description: Bad request - project is read-only
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have permission to delete labels for this project
 *       404:
 *         description: Project or label not found
 */
router.delete("/project/:projectId/label/:labelId/delete", authenticateToken, authorizeProjectForOwnerAndAdmin, deleteLabel);

/**
 * @swagger
 * /project/{projectId}/task/{taskId}/labels:
 *   get:
 *     summary: Get all labels assigned to a task
 *     tags: [Labels]
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
 *         description: Labels fetched successfully for the task
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
 *                   example: "Labels fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Label ID
 *                         example: "5f8d0d55b54764421b7156c3"
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       color:
 *                         type: string
 *                       project_id:
 *                         type: string
 *                       task_id:
 *                         type: string
 *                         description: ID of the task associated with this label
 *                         example: "5f8d0d55b54764421b7156c5"
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user doesn't have permission to view task labels
 *       404:
 *         description: Project or task not found
 */
router.get("/project/:projectId/task/:taskId/labels", authenticateToken, authorizeProject, getAllLabelForTask);

export default router;
