import express from "express";
import { authenticateToken } from "../middlewares/authenticate";
import { authorizeTask } from "../middlewares/authorization";
import { createComment, deleteComment, getAllCommentsForTask, updateComment } from "../controller/commentsController";

const router = express.Router();

router.get("/project/:projectId/task/:taskId/comments", authenticateToken, authorizeTask, getAllCommentsForTask);

router.post("/project/:projectId/task/:taskId/comment/new", authenticateToken, authorizeTask, createComment);

router.put("/project/:projectId/task/:taskId/comment/update", authenticateToken, authorizeTask, updateComment);

router.delete("/project/:projectId/task/:taskId/comment/delete", authenticateToken, authorizeTask, deleteComment);

export default router;