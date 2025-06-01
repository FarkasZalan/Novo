import express from "express";
import { authenticateToken } from "../middlewares/authenticate";
import { getDahboardLogForUser } from "../controller/changesLogController";

const router = express.Router();

router.get("/dashboard-logs", authenticateToken, getDahboardLogForUser);

export default router;