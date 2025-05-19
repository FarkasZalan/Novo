import { Request, Response } from "express";
import { NextFunction } from "connect";
import Stripe from "stripe";
import dotenv from "dotenv";
import { premiumPlanCancelDateQuery, updateUserPremiumStatusQuery } from "../models/userModel";
import { sendPremiumActivationEmail, sendPremiumCancellationEmail, sendPremiumReactivatedEmail, sendPremiumRenewalFailedEmail } from "../services/emailService";
import { getAllProjectForUsersQuery, updateProjectReadOnlyQuery } from "../models/projectModel";
import { getPendingUserQuery, getProjectMemberQuery } from "../models/projectMemberModel";

dotenv.config();

// Standardized response function
// it's a function that returns a response to the client when a request is made (CRUD operations)
const handleResponse = (res: Response, status: number, message: string, data: any) => {
    return res.status(status).json({
        status,
        message,
        data
    });
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const priceId = process.env.PREMIUM_PLAN_PRICE_ID!;


export const createPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { userId, email, name } = req.body;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [
                {
                    price: priceId,
                    quantity: 1
                },
            ],
            success_url: `${process.env.FRONTEND_URL}/profile?payment_status=success`,
            cancel_url: `${process.env.FRONTEND_URL}/profile?payment_status=cancelled`,
            customer_email: email,
            subscription_data: {
                metadata: {
                    userId: userId,
                    userEmail: email,
                    userName: name,
                }
            },
            metadata: {
                userId: userId,
                userEmail: email,
                userName: name,
            }
        });

        handleResponse(res, 200, "Payment created successfully", { sessionId: session.id });
    } catch (error) {
        next(error);
    }
};

export const cancelPremiumPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { sessionId } = req.body;
        const userId = req.user.id;

        if (!sessionId) {
            handleResponse(res, 400, "Session ID is required", null);
            return;
        }

        const updatedSubscription = await stripe.subscriptions.update(sessionId, {
            cancel_at_period_end: true
        })

        await premiumPlanCancelDateQuery(userId)
        sendPremiumCancellationEmail(updatedSubscription.metadata!.userEmail!, updatedSubscription.metadata!.userName);
        handleResponse(res, 200, "Premium plan cancelled successfully", updatedSubscription);
    } catch (error) {
        next(error);
    }
};

export const reactivatePremiumPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { subscriptionId } = req.body;
        const userId = req.user.id;

        if (!subscriptionId) {
            handleResponse(res, 400, "Subscription ID is required", null);
            return;
        }

        const subscription = await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: false
        });

        // Update the user's status in DB
        await updateUserPremiumStatusQuery(userId, true, subscriptionId);
        sendPremiumReactivatedEmail(subscription.metadata!.userEmail!, subscription.metadata!.userName);

        handleResponse(res, 200, "Subscription reactivated successfully", subscription);
    } catch (error) {
        next(error);
    }
};

// after payment is done check if payment is successful and if so update user premium status
export const handleStripeWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;

    try {
        // Verify the webhook signature
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            endpointSecret
        );
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        // Only fulfill the order if the payment is successful
        if (session.payment_status === 'paid') {
            await fulfillOrder(session);
        }
    }

    // Handle other events
    switch (event.type) {
        case 'checkout.session.async_payment_succeeded':
            const succeededSession = event.data.object as Stripe.Checkout.Session;
            await fulfillOrder(succeededSession);
            break;

        case 'checkout.session.async_payment_failed':
            const failedSession = event.data.object as Stripe.Checkout.Session;
            await handleFailedPayment(failedSession);
            break;

        case 'customer.subscription.deleted':
            const subscription = event.data.object as Stripe.Subscription;
            const userId = subscription.metadata?.userId;
            if (userId) {
                await deleteSubscription(subscription, userId);

            }
            break;
    }

    handleResponse(res, 200, "Payment webhook handled successfully", {});
};

async function fulfillOrder(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.metadata!.userId;
    const subscriptionId = session.subscription as string;
    await updateUserPremiumStatusQuery(userId, true, subscriptionId);

    const allProjectForUser = await getAllProjectForUsersQuery(userId);

    for (let project of allProjectForUser) {
        await updateProjectReadOnlyQuery(project.id, false);
    }

    sendPremiumActivationEmail(session.customer_email!, session.metadata!.userName);
}

async function handleFailedPayment(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.metadata!.userId;
    const sessionId = session.subscription as string;
    await updateUserPremiumStatusQuery(userId, false, sessionId);
    sendPremiumRenewalFailedEmail(session.customer_email!, session.metadata!.userName);
}

async function deleteSubscription(subscription: Stripe.Subscription, userId: string): Promise<void> {
    await updateUserPremiumStatusQuery(userId, false, subscription.id);
    const allProjectForUser = await getAllProjectForUsersQuery(userId);

    for (let project of allProjectForUser) {
        const projectmembers = await getProjectMemberQuery(project.id, userId);
        const pendingUsers = await getPendingUserQuery(project.id, userId);

        if (projectmembers.length + pendingUsers.length > 5) {
            await updateProjectReadOnlyQuery(project.id, true);
        }
    }
    sendPremiumReactivatedEmail(subscription.metadata!.userEmail!, subscription.metadata!.userName);
}