import express from "express";
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from "../controller/userController";
import validateUser from "../middlewares/inputValidator";

// Create router object to handle routes
const router = express.Router();

// validateUser middleware is used to validate user input, if the input is valid, the next middleware will be called
router.post("/user", validateUser, createUser);
router.get("/users", getAllUsers);
router.get("/user/:id", getUserById);
router.put("/user/:id", validateUser, updateUser);
router.delete("/user/:id", deleteUser);

export default router;
