import express from "express";
import { authenticateToken } from "../middlewares/authenticate";
import { createPayment, handleStripeWebhook } from "../controller/paymentController";

const router = express.Router();

router.post("/payment/create-checkout-session", authenticateToken, createPayment);

export default router;