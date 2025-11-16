import "dotenv/config";
import express, { NextFunction, type Request, Response } from "express";
import { registerRoutes } from "./routes";
import { log, serveStatic, setupVite } from "./vite";
import Stripe from "stripe";
import { db } from "./db";
import { storage } from "./storage";
import { serviceOrders } from "@shared/schema";
import { eq } from "drizzle-orm";

const app = express();

// Stripe webhook handler MUST come before express.json() to access raw body
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
});

app.post(
    "/api/webhooks/stripe",
    express.raw({ type: "application/json" }),
    async (req: any, res) => {
        const sig = req.headers["stripe-signature"];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        // Require webhook secret for security
        if (!webhookSecret) {
            console.error("STRIPE_WEBHOOK_SECRET not configured - webhook rejected");
            return res.status(400).send("Webhook secret required");
        }

        let event: Stripe.Event;

        try {
            // Verify webhook signature
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                webhookSecret
            );

            console.log(`Stripe webhook received: ${event.type}`);

            // Handle payment_intent.succeeded event
            if (event.type === "payment_intent.succeeded") {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                const orderId = paymentIntent.metadata.orderId;
                const bookingId = paymentIntent.metadata.bookingId;

                // Process service order payment
                if (orderId) {
                    const order = await storage.getServiceOrder(orderId);
                    if (order && order.paymentStatus !== "paid") {
                        await storage.updateServiceOrderPaymentStatus(orderId, "paid");
                        await storage.updateServiceOrderStatus(orderId, "confirmed");

                        await db
                            .update(serviceOrders)
                            .set({ paymentIntentId: paymentIntent.id })
                            .where(eq(serviceOrders.id, orderId));

                        const provider = await storage.getServiceProvider(order.serviceProviderId);

                        await storage.createNotification({
                            userId: order.clientId,
                            type: 'payment',
                            title: 'Payment Successful',
                            message: `Your payment of $${order.totalAmount} for ${provider?.businessName || 'service'} has been confirmed. Order code: ${order.orderCode}`,
                            isRead: false
                        });

                        if (provider) {
                            await storage.createNotification({
                                userId: provider.userId,
                                type: 'payment',
                                title: 'Payment Received',
                                message: `Payment of $${order.totalAmount} received. Order code: ${order.orderCode}`,
                                isRead: false
                            });
                        }

                        console.log(`Service order ${orderId} payment confirmed via webhook`);
                    }
                }

                // Process booking payment
                if (bookingId) {
                    const booking = await storage.getBooking(bookingId);
                    if (booking && booking.paymentStatus !== "paid") {
                        await storage.updateBookingPaymentStatus(bookingId, "paid");
                        await storage.updateBookingStatus(bookingId, "confirmed");
                        console.log(`Booking ${bookingId} payment confirmed via webhook`);
                    }
                }
            }

            // Handle payment_intent.payment_failed event
            if (event.type === "payment_intent.payment_failed") {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                const orderId = paymentIntent.metadata.orderId;

                console.log(`Payment failed for order ${orderId}`);

                if (orderId) {
                    const order = await storage.getServiceOrder(orderId);
                    if (order) {
                        await storage.createNotification({
                            userId: order.clientId,
                            type: 'payment',
                            title: 'Payment Failed',
                            message: `Your payment for order ${order.orderCode} failed. Please try again or contact support.`,
                            isRead: false
                        });
                    }
                }
            }

            // Handle charge.refunded event
            if (event.type === "charge.refunded") {
                const charge = event.data.object as Stripe.Charge;
                const paymentIntentId = charge.payment_intent as string;

                const orders = await db
                    .select()
                    .from(serviceOrders)
                    .where(eq(serviceOrders.paymentIntentId, paymentIntentId));

                for (const order of orders) {
                    await storage.updateServiceOrderPaymentStatus(order.id, "refunded");

                    await storage.createNotification({
                        userId: order.clientId,
                        type: 'payment',
                        title: 'Refund Processed',
                        message: `Your refund of $${order.totalAmount} for order ${order.orderCode} has been processed.`,
                        isRead: false
                    });

                    console.log(`Refund processed for order ${order.id}`);
                }
            }

            res.json({ received: true });
        } catch (err: any) {
            console.error(`Webhook Error: ${err.message}`);
            res.status(400).send(`Webhook Error: ${err.message}`);
        }
    }
);

// Now apply standard JSON parsing for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
            let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
            if (capturedJsonResponse) {
                logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
            }

            if (logLine.length > 80) {
                logLine = logLine.slice(0, 79) + "…";
            }

            log(logLine);
        }
    });

    next();
});

(async () => {
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";

        console.error("Error:", err);
        res.status(status).json({ message });
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
        await setupVite(app, server);
    } else {
        serveStatic(app);
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || "5000", 10);
    server.listen(
        {
            port,
            host: "0.0.0.0",
            reusePort: true,
        },
        () => {
            log(`serving on port ${port}`);

            // Initialize database in background after server starts
            if (process.env.NODE_ENV === "production") {
                import("./init-db-async").catch((err) => {
                    console.error("Database initialization error:", err);
                });
            }
        }
    );
})();
