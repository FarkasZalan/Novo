import express from "express";
import { deleteUser, getAllUsers, getUserProfile, updateUser } from "../controller/userController";
import { validateUser } from "../middlewares/inputValidator";
import { authenticateToken } from "../middlewares/authenticate";

// Create router object to handle routes
const router = express.Router();

// validateUser middleware is used to validate user input, if the input is valid, the next middleware will be called
router.get("/users", getAllUsers);
router.get("/user/profile", authenticateToken, getUserProfile);
router.put("/user/update", authenticateToken, validateUser, updateUser);
router.delete("/user/delete", authenticateToken, deleteUser);

export default router;
