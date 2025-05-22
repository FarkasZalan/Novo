import express from "express";
import { authenticateToken } from "../middlewares/authenticate";
import { getAllProjectLogForUser } from "../controller/changesLogController";

const router = express.Router();

router.get("/project-logs", authenticateToken, getAllProjectLogForUser);

export default router;