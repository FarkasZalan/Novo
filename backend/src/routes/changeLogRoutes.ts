import express from "express";
import { authenticateToken } from "../middlewares/authenticate";
import { getCommentLogs, getDahboardLogForUser, getMilestoneLogs, getProjectLogs, getTaskLogs, getUserLog } from "../controller/changesLogController";

const router = express.Router();

router.get("/dashboard-logs", authenticateToken, getDahboardLogForUser);

router.get("/project/:projectId/logs", authenticateToken, getProjectLogs);

router.get("/project/:projectId/task/:taskId/logs", authenticateToken, getTaskLogs);

router.get("/project/:projectId/task/:taskId/comment/:commentId/logs", authenticateToken, getCommentLogs);

router.get("/project/:projectId/milestone/:milestoneId/logs", authenticateToken, getMilestoneLogs);

router.get("/user-logs", authenticateToken, getUserLog);

export default router;