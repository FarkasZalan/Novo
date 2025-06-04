import express from "express";
import { handleStripeWebhook } from "../controller/paymentController";

const router = express.Router();

/**
 * @swagger
 * /payment/webhook:
 *   post:
 *     summary: Stripe webhook endpoint to handle subscription events
 *     tags: [Payments]
 *     description: |
 *       This endpoint is called by Stripe to notify about subscription lifecycle events.
 *       It must be configured in Stripe Dashboard with the raw body parser.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Raw Stripe event payload
 *     responses:
 *       200:
 *         description: Webhook handled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Payment webhook handled successfully"
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request - signature verification failed or invalid payload
 */
router.post('/payment/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;