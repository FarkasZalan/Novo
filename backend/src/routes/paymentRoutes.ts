import express from "express";
import { authenticateToken } from "../middlewares/authenticate";
import { cancelPremiumPlan, createPayment, reactivatePremiumPlan } from "../controller/paymentController";

const router = express.Router();

router.post("/payment/create-checkout-session", authenticateToken, createPayment);

router.post('/payment/cancel-premium-plan', authenticateToken, cancelPremiumPlan);

router.post('/payment/reactivate-premium-plan', authenticateToken, reactivatePremiumPlan);

export default router;