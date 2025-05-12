import { Request, Response } from "express";
import { NextFunction } from "connect";
import Stripe from "stripe";
import dotenv from "dotenv";
import { updateUserPremiumStatusQuery } from "../models/userModel";

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

    // Handle other event types you're interested in
    switch (event.type) {
        case 'checkout.session.async_payment_succeeded':
            const succeededSession = event.data.object as Stripe.Checkout.Session;
            await fulfillOrder(succeededSession);
            break;

        case 'checkout.session.async_payment_failed':
            const failedSession = event.data.object as Stripe.Checkout.Session;
            await handleFailedPayment(failedSession);
            break;

        // Add more event types as needed
    }

    handleResponse(res, 200, "Payment webhook handled successfully", {});
};

async function fulfillOrder(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.metadata!.userId;
    await updateUserPremiumStatusQuery(userId, true);
}

async function handleFailedPayment(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.metadata!.userId;
    // Log or handle failed payment however needed
}