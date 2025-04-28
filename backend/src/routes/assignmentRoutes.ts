import express from "express";
import { createAssignmentForUsers, createAssignmentMyself, deleteAssignmentsFromTask, getAllAssignmentsForTask } from "../controller/assignmentsController";
import { authenticateToken } from "../middlewares/authenticate";
import { authorizeAssignmentsForMember, authorizeAssignmentsForOwnerAndAdmin } from "../middlewares/authorization";

const router = express.Router();

router.get("/project/:projectId/task/:taskId/assignments", authenticateToken, authorizeAssignmentsForMember, getAllAssignmentsForTask);

router.post("/project/:projectId/task/:taskId/assign-myself", authenticateToken, authorizeAssignmentsForMember, createAssignmentMyself);

router.post("/project/:projectId/task/:taskId/assign-users", authenticateToken, authorizeAssignmentsForOwnerAndAdmin, createAssignmentForUsers);

router.delete("/project/:projectId/task/:taskId/assign-myself", authenticateToken, authorizeAssignmentsForMember, deleteAssignmentsFromTask);

router.delete("/project/:projectId/task/:taskId/assign-users", authenticateToken, authorizeAssignmentsForOwnerAndAdmin, deleteAssignmentsFromTask);

export default router;