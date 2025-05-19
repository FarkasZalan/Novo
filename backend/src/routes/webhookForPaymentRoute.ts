import express from "express";
import { handleStripeWebhook } from "../controller/paymentController";

const router = express.Router();

router.post('/payment/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;