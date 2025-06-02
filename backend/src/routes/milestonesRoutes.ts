import express from "express";
import { authenticateToken } from "../middlewares/authenticate";
import { authorizeProject, authorizeProjectForOwnerAndAdmin } from "../middlewares/authorization";
import { getAllMilestonesForProject, getMilestoneById, getAllTaskForMilestone, getAllUnassignedTaskForMilestone, createMilestone, addMilestoneToTask, deleteMilestoneFromTask, updateMilestone, deleteMilestone, getAllTaskForMilestoneWithSubtasks } from "../controller/milestonesController";

const router = express.Router();

router.get("/project/:projectId/milestones", authenticateToken, authorizeProject, getAllMilestonesForProject);

router.get("/project/:projectId/milestone/:milestoneId", authenticateToken, authorizeProject, getMilestoneById);

router.get("/project/:projectId/milestone/:milestoneId/tasks", authenticateToken, authorizeProject, getAllTaskForMilestone);

router.get("/project/:projectId/milestone/:milestoneId/tasks-with-subtasks", authenticateToken, authorizeProject, getAllTaskForMilestoneWithSubtasks);

router.get("/project/:projectId/milestone/tasks/unassigned", authenticateToken, authorizeProject, getAllUnassignedTaskForMilestone);

router.post("/project/:projectId/milestone/new", authenticateToken, authorizeProjectForOwnerAndAdmin, createMilestone);

router.put("/project/:projectId/milestone/:milestoneId/add", authenticateToken, authorizeProjectForOwnerAndAdmin, addMilestoneToTask);

router.put("/project/:projectId/milestone/:milestoneId/remove", authenticateToken, authorizeProjectForOwnerAndAdmin, deleteMilestoneFromTask);

router.put("/project/:projectId/milestone/:milestoneId/update", authenticateToken, authorizeProjectForOwnerAndAdmin, updateMilestone);

router.delete("/project/:projectId/milestone/:milestoneId/delete", authenticateToken, authorizeProjectForOwnerAndAdmin, deleteMilestone);

export default router;