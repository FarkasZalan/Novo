import express from "express";
import { createUser, loginUser, logoutUser } from "../controller/authController";
import { refreshAccessToken } from "../middlewares/authorization";
import { validateUser } from "../middlewares/inputValidator";

const router = express.Router();

router.post("/auth/register", validateUser, createUser);
router.post("/auth/login", loginUser);
router.post("/auth/refresh-token", refreshAccessToken)
router.post("/auth/logout", logoutUser);

export default router;