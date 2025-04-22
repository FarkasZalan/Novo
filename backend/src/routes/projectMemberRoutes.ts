import { addUsersToProject, getAllProjectMembers, updateProjectMemberRole, removeUserFromProject, leaveProject, resendProjectInvite } from "../controller/projectMembersController";
import { authenticateToken } from "../middlewares/authenticate";
import { authorizeProject } from "../middlewares/authorization";
import express from "express";

const router = express.Router();

/**
 * @swagger
 * /project/{projectId}/add-members:
 *   post:
 *     summary: Add users to a project
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               users:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     role:
 *                       type: string
 *                       example: "member"
 *                     status:
 *                       type: string
 *                       example: "pending"
 *     responses:
 *       200:
 *         description: Users added to project
 *       400:
 *         description: Bad request
 */
router.post("/project/:projectId/add-members", authenticateToken, authorizeProject, addUsersToProject);

router.get("/project/:projectId/members", authenticateToken, authorizeProject, getAllProjectMembers);

router.put("/project/:projectId/members/", authenticateToken, authorizeProject, updateProjectMemberRole);

router.delete("/project/:projectId/members/", authenticateToken, authorizeProject, removeUserFromProject);

router.delete("/project/:projectId/members/leave", authenticateToken, authorizeProject, leaveProject);

router.post("/project/:projectId/members/re-invite", authenticateToken, authorizeProject, resendProjectInvite);

export default router;