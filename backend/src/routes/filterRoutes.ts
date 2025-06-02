import express from "express";
import { authenticateToken } from "../middlewares/authenticate";
import { getAllFilteredLogForUser, getAllTaskByNameBasedOnMilestone, getAllUnassignedTaskForMilestone, getAllUserByNameOrEmail } from "../controller/FilterController";
import { authorizeProject, authorizeProjectForOwnerAndAdmin } from "../middlewares/authorization";

const router = express.Router();

router.get("/all-filtered-logs", authenticateToken, getAllFilteredLogForUser);

router.get("/project/:projectId/all-user-filter", authenticateToken, authorizeProjectForOwnerAndAdmin, getAllUserByNameOrEmail);

router.get("/project/:projectId/milestone/:milestoneId/all-task-filter", authenticateToken, authorizeProject, getAllTaskByNameBasedOnMilestone);

router.get("/project/:projectId/unassigned-tasks-filter", authenticateToken, authorizeProjectForOwnerAndAdmin, getAllUnassignedTaskForMilestone);

export default router;