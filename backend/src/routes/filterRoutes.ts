import express from "express";
import { authenticateToken } from "../middlewares/authenticate";
import { getAllFilteredLogForUser } from "../controller/FilterController";

const router = express.Router();

router.get("/all-filtered-logs", authenticateToken, getAllFilteredLogForUser);

export default router;