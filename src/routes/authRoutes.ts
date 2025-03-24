import express from "express";
import { createUser, loginUser, logoutUser } from "../controller/authController";
import validateUser from "../middlewares/inputValidator";
import { refreshAccessToken } from "../middlewares/authorization";

const router = express.Router();

router.post("/auth/register", validateUser, createUser);
router.post("/auth/login", loginUser);
router.post("/auth/refresh-token", refreshAccessToken)
router.post("/auth/logout", logoutUser);

export default router;