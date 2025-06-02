import express from "express";
import { authenticateToken } from "../middlewares/authenticate";
import { getAllFilteredLogForUser, getAllUserByNameOrEmail } from "../controller/FilterController";
import { authorizeProjectForOwnerAndAdmin } from "../middlewares/authorization";

const router = express.Router();

router.get("/all-filtered-logs", authenticateToken, getAllFilteredLogForUser);

router.get("/project/:projectId/all-user-filter", authenticateToken, authorizeProjectForOwnerAndAdmin, getAllUserByNameOrEmail);

export default router;