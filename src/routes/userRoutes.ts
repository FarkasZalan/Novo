import express from "express";
import { deleteUser, getAllUsers, getUserById, updateUser } from "../controller/userController";
import validateUser from "../middlewares/inputValidator";
import { authenticateToken } from "../middlewares/authorization";

// Create router object to handle routes
const router = express.Router();

// validateUser middleware is used to validate user input, if the input is valid, the next middleware will be called
router.get("/users", getAllUsers);
router.get("/user/:id", authenticateToken, getUserById);
router.put("/user/:id", authenticateToken, validateUser, updateUser);
router.delete("/user/:id", authenticateToken, deleteUser);

export default router;
