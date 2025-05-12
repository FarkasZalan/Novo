import express from "express";
import { authenticateToken } from "../middlewares/authenticate";
import { createPayment, handleStripeWebhook } from "../controller/paymentController";

const router = express.Router();

router.post("/payment/create-checkout-session", authenticateToken, createPayment);

router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;