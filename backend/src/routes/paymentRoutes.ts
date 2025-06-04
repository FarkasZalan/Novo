import express from "express";
import { authenticateToken } from "../middlewares/authenticate";
import { cancelPremiumPlan, createPayment, reactivatePremiumPlan } from "../controller/paymentController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Premium plan payment management
 */

/**
 * @swagger
 * /payment/create-checkout-session:
 *   post:
 *     summary: Create a Stripe Checkout session for subscribing to the premium plan
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - email
 *               - name
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user initiating the subscription
 *                 example: "5f8d0d55b54764421b7156c3"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the user (used for Stripe customer creation)
 *                 example: "user@example.com"
 *               name:
 *                 type: string
 *                 description: Full name of the user (included in metadata)
 *                 example: "John Doe"
 *     responses:
 *       200:
 *         description: Checkout session created successfully
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
 *                   example: "Payment created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessionId:
 *                       type: string
 *                       description: ID of the created Stripe Checkout session
 *                       example: "cs_test_a1b2c3d4"
 *       400:
 *         description: Bad request - missing or invalid input
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post("/payment/create-checkout-session", authenticateToken, createPayment);

/**
 * @swagger
 * /payment/cancel-premium-plan:
 *   post:
 *     summary: Cancel the user's premium subscription at period end
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: Stripe subscription ID (session ID) to cancel
 *                 example: "sub_1A2b3C4d5E6f7G8h9I"
 *     responses:
 *       200:
 *         description: Premium plan cancelled successfully
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
 *                   example: "Premium plan cancelled successfully"
 *                 data:
 *                   type: object
 *                   description: Details of the updated Stripe subscription
 *       400:
 *         description: Bad request - missing session ID
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       404:
 *         description: Subscription not found
 *       500:
 *         description: Internal server error
 */
router.post("/payment/cancel-premium-plan", authenticateToken, cancelPremiumPlan);

/**
 * @swagger
 * /payment/reactivate-premium-plan:
 *   post:
 *     summary: Reactivate a cancelled premium subscription
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subscriptionId
 *             properties:
 *               subscriptionId:
 *                 type: string
 *                 description: Stripe subscription ID to reactivate
 *                 example: "sub_1A2b3C4d5E6f7G8h9I"
 *     responses:
 *       200:
 *         description: Subscription reactivated successfully
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
 *                   example: "Subscription reactivated successfully"
 *                 data:
 *                   type: object
 *                   description: Details of the updated Stripe subscription
 *       400:
 *         description: Bad request - missing subscription ID
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       404:
 *         description: Subscription not found
 *       500:
 *         description: Internal server error
 */
router.post("/payment/reactivate-premium-plan", authenticateToken, reactivatePremiumPlan);

export default router;