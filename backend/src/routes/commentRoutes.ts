import express from "express";
import { authenticateToken } from "../middlewares/authenticate";
import { authorizeProject, authorizeProjectForOwnerAndAdmin } from "../middlewares/authorization";
import { createComment, deleteComment, getAllCommentsForTask, updateComment } from "../controller/commentsController";

const router = express.Router();

router.get("/project/:projectId/task/:taskId/comments", authenticateToken, authorizeProject, getAllCommentsForTask);

router.post("/project/:projectId/task/:taskId/comment/new", authenticateToken, authorizeProjectForOwnerAndAdmin, createComment);

router.put("/project/:projectId/task/:taskId/comment/update", authenticateToken, authorizeProjectForOwnerAndAdmin, updateComment);

router.delete("/project/:projectId/task/:taskId/comment/delete", authenticateToken, authorizeProjectForOwnerAndAdmin, deleteComment);

export default router;