import express from "express";
import { authenticateToken } from "../middlewares/authenticate";
import { authorizeProject, authorizeProjectForOwnerAndAdmin } from "../middlewares/authorization";
import { addLabelToTask, createLabel, deleteLabel, deleteLabelFromTask, getAllLabelForProject, getAllLabelForTask, updateLabel } from "../controller/labelController";

const router = express.Router();

// project labels
router.get("/project/:projectId/labels", authenticateToken, authorizeProject, getAllLabelForProject);

router.post("/project/:projectId/label/new", authenticateToken, authorizeProjectForOwnerAndAdmin, createLabel);

router.delete("/project/:projectId/label/:labelId/delete", authenticateToken, authorizeProjectForOwnerAndAdmin, deleteLabel);

router.put("/project/:projectId/label/:labelId/update", authenticateToken, authorizeProjectForOwnerAndAdmin, updateLabel);


// task labels

router.get("/project/:projectId/task/:taskId/labels", authenticateToken, authorizeProject, getAllLabelForTask);

router.post("/project/:projectId/task/taskId/label/:labelId/add", authenticateToken, authorizeProjectForOwnerAndAdmin, addLabelToTask);

router.delete("/project/:projectId/task/taskId/label/:labelId/remove", authenticateToken, authorizeProjectForOwnerAndAdmin, deleteLabelFromTask);



export default router;