import express from "express";
import {
    addUsersToProject,
    getAllProjectMembers,
    updateProjectMemberRole,
    removeUserFromProject,
    leaveProject,
    resendProjectInvite,
} from "../controller/projectMembersController";
import { authenticateToken } from "../middlewares/authenticate";
import {
    authorizeProject,
    authorizeProjectForOwnerAndAdmin,
} from "../middlewares/authorization";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ProjectMembers
 *   description: Manage project membership (invite, update roles, remove, leave)
 */

/**
 * @swagger
 * /project/{projectId}/add-members:
 *   post:
 *     summary: Add or invite users to a project
 *     tags: [ProjectMembers]
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
 *               - users
 *               - currentUserId
 *             properties:
 *               users:
 *                 type: array
 *                 description: Array of users to add or invite
 *                 items:
 *                   type: object
 *                   required:
 *                     - email
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Existing user ID (omit for new-invite)
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: Email of the user (for invite or notification)
 *                     role:
 *                       type: string
 *                       description: Role to assign ("member", "admin", etc.)
 *                       example: "member"
 *               currentUserId:
 *                 type: string
 *                 description: ID of the user performing the invite or add operations
 *                 example: "5f8d0d55b54764421b7156c3"
 *     responses:
 *       200:
 *         description: Users added or invited successfully
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
 *                   example: "Project updated successfully"
 *                 data:
 *                   type: array
 *                   description: Array of result objects per user
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                         description: ID of the user (if existing) or null
 *                       status:
 *                         type: string
 *                         enum: [success, exists, error]
 *                         example: "success"
 *       400:
 *         description: Bad request – no users provided, project is read-only, or premium limit exceeded
 *       401:
 *         description: Unauthorized – invalid or missing token
 *       403:
 *         description: Forbidden – current user not authorized to add members
 *       404:
 *         description: Project not found
 */
router.post(
    "/project/:projectId/add-members",
    authenticateToken,
    authorizeProjectForOwnerAndAdmin,
    addUsersToProject
);

/**
 * @swagger
 * /project/{projectId}/members:
 *   get:
 *     summary: Get all members and pending invites for a project
 *     tags: [ProjectMembers]
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
 *         description: Project members and pending invites fetched successfully
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
 *                   example: "Project fetched successfully"
 *                 data:
 *                   type: array
 *                   description: [membersArray, pendingInvitesArray]
 *                   items:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: string
 *                           description: ID of the project member or pending invite
 *                         role:
 *                           type: string
 *                           description: Role of the member or invite
 *                         user:
 *                           type: object
 *                           nullable: true
 *                           description: User details for existing members; null for pending
 *                           properties:
 *                             id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             email:
 *                               type: string
 *         examples:
 *           application/json:
 *             {
 *               "status": 200,
 *               "message": "Project fetched successfully",
 *               "data": [
 *                 [
 *                   { "user_id": "5f8d0d55b54764421b7156c3", "role": "member", "user": { "id": "5f8d0d55b54764421b7156c3", "name": "Alice", "email": "alice@example.com" } }
 *                 ],
 *                 [
 *                   { "user_id": "invite123", "role": "member", "user": null }
 *                 ]
 *               ]
 *             }
 *       401:
 *         description: Unauthorized – invalid or missing token
 *       403:
 *         description: Forbidden – user doesn't have permission to view members
 *       404:
 *         description: Project not found
 */
router.get("/project/:projectId/members", authenticateToken, authorizeProject, getAllProjectMembers);

/**
 * @swagger
 * /project/{projectId}/members:
 *   put:
 *     summary: Update a member or pending invite role in a project
 *     tags: [ProjectMembers]
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
 *               - data
 *             properties:
 *               data:
 *                 type: object
 *                 required:
 *                   - userId
 *                   - currentUserId
 *                   - role
 *                 properties:
 *                   userId:
 *                     type: string
 *                     description: ID of the member or pending invite to update
 *                     example: "5f8d0d55b54764421b7156c3"
 *                   currentUserId:
 *                     type: string
 *                     description: ID of the user performing the role update
 *                     example: "5f8d0d55b54764421b7156c4"
 *                   role:
 *                     type: string
 *                     description: New role to assign ("member", "admin", etc.)
 *                     example: "admin"
 *     responses:
 *       200:
 *         description: Member role updated successfully
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
 *                   example: "Project updated successfully"
 *       400:
 *         description: Bad request – project is read-only or current user lacks permission
 *       401:
 *         description: Unauthorized – invalid or missing token
 *       403:
 *         description: Forbidden – current user not authorized to update roles
 *       404:
 *         description: Project, current user, or target user not found
 */
router.put("/project/:projectId/members", authenticateToken, authorizeProjectForOwnerAndAdmin, updateProjectMemberRole);

/**
 * @swagger
 * /project/{projectId}/members:
 *   delete:
 *     summary: Remove a member or pending invite from a project
 *     tags: [ProjectMembers]
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
 *               - userId
 *               - currentUserId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the member or pending invite to remove
 *                 example: "5f8d0d55b54764421b7156c3"
 *               currentUserId:
 *                 type: string
 *                 description: ID of the user performing the removal
 *                 example: "5f8d0d55b54764421b7156c4"
 *     responses:
 *       200:
 *         description: User removed from project successfully
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
 *                   example: "User removed successfully"
 *       400:
 *         description: Bad request – project is read-only or cannot remove project owner
 *       401:
 *         description: Unauthorized – invalid or missing token
 *       403:
 *         description: Forbidden – current user lacks permission to remove members
 *       404:
 *         description: Project, current user, or target user not found
 */
router.delete("/project/:projectId/members", authenticateToken, authorizeProjectForOwnerAndAdmin, removeUserFromProject);

/**
 * @swagger
 * /project/{projectId}/members/leave:
 *   delete:
 *     summary: Current user leaves a project
 *     tags: [ProjectMembers]
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
 *               - userId
 *               - currentUserId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user leaving the project (same as currentUserId)
 *                 example: "5f8d0d55b54764421b7156c3"
 *               currentUserId:
 *                 type: string
 *                 description: ID of the user leaving the project
 *                 example: "5f8d0d55b54764421b7156c3"
 *     responses:
 *       200:
 *         description: User left the project successfully
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
 *                   example: "User removed successfully"
 *       400:
 *         description: Bad request – owner cannot leave their own project
 *       401:
 *         description: Unauthorized – invalid or missing token
 *       403:
 *         description: Forbidden – current user not a project member
 *       404:
 *         description: Project or current user not found
 */
router.delete("/project/:projectId/members/leave", authenticateToken, authorizeProject, leaveProject);

/**
 * @swagger
 * /project/{projectId}/members/re-invite:
 *   post:
 *     summary: Resend an invitation email to a pending invitee
 *     tags: [ProjectMembers]
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
 *               - data
 *             properties:
 *               data:
 *                 type: object
 *                 required:
 *                   - inviteUserId
 *                   - currentUserId
 *                 properties:
 *                   inviteUserId:
 *                     type: string
 *                     description: ID of the pending invite to resend
 *                     example: "invite123"
 *                   currentUserId:
 *                     type: string
 *                     description: ID of the user performing the resend
 *                     example: "5f8d0d55b54764421b7156c4"
 *     responses:
 *       200:
 *         description: Invitation resent successfully
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
 *                   example: "Invite resent successfully"
 *       400:
 *         description: Bad request – project is read-only
 *       401:
 *         description: Unauthorized – invalid or missing token
 *       403:
 *         description: Forbidden – current user not authorized to resend invites
 *       404:
 *         description: Project or invite not found
 */
router.post("/project/:projectId/members/re-invite", authenticateToken, authorizeProjectForOwnerAndAdmin, resendProjectInvite);

export default router;
