import {
    insertBlogPostSchema,
    insertContactSubmissionSchema,
    insertJobApplicationSchema,
    insertJobPostingSchema,
    insertServiceProviderSchema,
    serviceProviders,
    serviceCategories,
    users,
    platformSettings,
    serviceOrders,
} from "@shared/schema";
import { and, desc, eq } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { format } from "date-fns";
import express, { type Express } from "express";
import session from "express-session";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { WebSocket, WebSocketServer } from "ws";
import { z } from "zod";
import { hashPassword, requireAuth, requireApprovedUser, verifyPassword } from "./auth";
import { generateBookingCode } from "./base44";
import { db, pool } from "./db";
import { storage } from "./storage";
import { whatsappService } from "./whatsapp";
import { sendAccountCredentialsEmail } from "./utils/email";
import multer from "multer";
import { promises as fs } from "fs";
import path from "path";
import { fileTypeFromBuffer } from "file-type";
import signature from "cookie-signature";
import { Resend } from "resend";
import { canMessageRole, getAllowedMessagingRoles, type UserRole } from "@shared/messagingPermissions";

const PgSession = connectPg(session);

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
});

// Initialize Resend for email sending (optional - gracefully handles missing key)
const resend = process.env.RESEND_API_KEY 
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

// Helper function to delete image files from local filesystem
async function deleteImageFile(imageUrl: string): Promise<boolean> {
    try {
        const filename = path.basename(imageUrl);
        // Only delete files with our expected prefixes for security
        if (filename.startsWith('provider-portfolio-') || 
            filename.startsWith('provider-profile-') ||
            filename.startsWith('blog-')) {
            const publicDir = path.join(process.cwd(), 'public', 'images');
            const filepath = path.join(publicDir, filename);
            await fs.unlink(filepath);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`Failed to delete image file: ${imageUrl}`, error);
        return false;
    }
}

// Helper function to delete multiple image files
async function deleteImageFiles(imageUrls: string[]): Promise<void> {
    const deletePromises = imageUrls.map(url => deleteImageFile(url));
    await Promise.allSettled(deletePromises);
}

export async function registerRoutes(app: Express): Promise<Server> {
    // Trust proxy - required for Coolify/Docker deployments behind reverse proxy
    app.set("trust proxy", 1);

    // Serve uploaded images from public/images directory
    const imagesDir = path.join(process.cwd(), 'public', 'images');
    app.use('/images', express.static(imagesDir));

    // Configure session middleware
    app.use(
        session({
            store: new PgSession({
                pool,
                tableName: "sessions", // Match the table name in schema.ts
                createTableIfMissing: true, // Auto-create table if it doesn't exist
            }),
            secret:
                process.env.SESSION_SECRET ||
                "travelhub-secret-key-change-in-production",
            resave: false,
            saveUninitialized: false,
            cookie: {
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                httpOnly: true,
                secure: false, // Set to false for now to test, enable HTTPS in Coolify later
                sameSite: "lax",
            },
        })
    );
    // Register endpoint
    app.post("/api/auth/register", async (req, res) => {
        try {
            const { email, password, firstName, lastName } = req.body;

            // Validate input
            if (!email || !password) {
                return res
                    .status(400)
                    .json({ message: "Email and password are required" });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    message: "Password must be at least 6 characters",
                });
            }

            // Hash password
            const hashedPassword = await hashPassword(password);

            // Create user with approved status for clients
            const user = await storage.upsertUser({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: "client",
                status: "approved", // Clients are auto-approved
            });

            // Set session
            (req.session as any).userId = user.id;

            // Return user without password
            const { password: _, ...userWithoutPassword } = user;
            res.status(201).json(userWithoutPassword);
        } catch (error: any) {
            console.error("Registration error:", error);
            if (error.code === "23505") {
                // Unique violation
                return res
                    .status(409)
                    .json({ message: "Email already exists" });
            }
            res.status(500).json({ message: "Failed to register" });
        }
    });

    // Legacy registration endpoints DISABLED - Use /work-with-us instead
    // These endpoints allowed bypassing the approval workflow
    app.post("/api/auth/register-host", async (req, res) => {
        return res.status(410).json({ 
            message: "This registration method is no longer available. Please use /work-with-us to apply as a host." 
        });
    });

    app.post("/api/auth/register-provider", async (req, res) => {
        return res.status(410).json({ 
            message: "This registration method is no longer available. Please use /work-with-us to apply as a service provider." 
        });
    });

    // Work With Us registration endpoint
    app.post("/api/auth/register-work-with-us", async (req, res) => {
        try {
            const { 
                email, 
                password, 
                role,
                firstName, 
                lastName,
                businessName,
                phone,
                businessAddress,
                taxLicense,
                bio,
                certifications,
                portfolio,
            } = req.body;

            // Validate input
            if (!email || !password || !role) {
                return res
                    .status(400)
                    .json({ message: "Email, password and role are required" });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    message: "Password must be at least 6 characters",
                });
            }

            // Validate role is one of the allowed work-with-us roles
            const allowedRoles = ["city_manager", "property_owner", "service_provider"];
            if (!allowedRoles.includes(role)) {
                return res.status(400).json({
                    message: "Invalid role for work-with-us registration"
                });
            }

            // Hash password
            const hashedPassword = await hashPassword(password);

            // Create user with pending status
            const user = await storage.upsertUser({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role,
                businessName,
                phone,
                businessAddress,
                taxLicense,
                bio,
                certifications,
                portfolio,
                status: "pending", // Set status to pending for approval
            });

            // DO NOT auto-login - user must wait for approval
            // Return success message instead
            res.status(201).json({
                message: "Application submitted successfully. You will receive an email once your account has been approved.",
                email: user.email,
                role: user.role,
            });
        } catch (error: any) {
            console.error("Work-with-us registration error:", error);
            if (error.code === "23505") {
                return res
                    .status(409)
                    .json({ message: "Email already exists" });
            }
            res.status(500).json({ message: "Failed to register" });
        }
    });

    // Login endpoint
    app.post("/api/auth/login", async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res
                    .status(400)
                    .json({ message: "Email and password are required" });
            }

            // Find user by email
            const users = await storage.getUserByEmail(email);
            if (!users) {
                return res
                    .status(401)
                    .json({ message: "Invalid email or password" });
            }

            // Verify password
            const isValid = await verifyPassword(password, users.password);
            if (!isValid) {
                return res
                    .status(401)
                    .json({ message: "Invalid email or password" });
            }

            // Check if user is rejected
            if (users.status === "rejected") {
                return res.status(403).json({ 
                    message: "Your account application has been rejected. Please contact support for more information." 
                });
            }

            // Set session (pending users can log in but will have limited access)
            (req.session as any).userId = users.id;

            // Return user without password
            const { password: _, ...userWithoutPassword } = users;
            res.json(userWithoutPassword);
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ message: "Failed to login" });
        }
    });

    // Logout endpoint
    app.post("/api/auth/logout", (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: "Failed to logout" });
            }
            res.json({ message: "Logged out successfully" });
        });
    });

    // Get current user
    app.get("/api/auth/user", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            const { password: _, ...userWithoutPassword } = user;
            res.json(userWithoutPassword);
        } catch (error) {
            console.error("Error fetching user:", error);
            res.status(500).json({ message: "Failed to fetch user" });
        }
    });

    // Get user details by ID (for messaging)
    app.get("/api/users/:userId", requireAuth, async (req, res) => {
        try {
            const { userId } = req.params;
            const user = await storage.getUser(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            const { password: _, ...userWithoutPassword } = user;
            res.json(userWithoutPassword);
        } catch (error) {
            console.error("Error fetching user:", error);
            res.status(500).json({ message: "Failed to fetch user" });
        }
    });

    // Get users by role (for role-based messaging)
    app.get("/api/users/by-role/:role", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const currentUser = await storage.getUser(userId);
            
            if (!currentUser) {
                return res.status(401).json({ message: "User not found" });
            }

            const { role } = req.params;
            const validRoles = [
                "admin",
                "billing",
                "operation",
                "marketing",
                "property_owner",
                "service_provider",
                "client",
                "country_manager",
                "city_manager",
                "operation_support",
            ];
            
            if (!validRoles.includes(role)) {
                return res.status(400).json({ message: "Invalid role" });
            }

            // Check if current user is allowed to message users of this role
            if (!canMessageRole(currentUser.role as UserRole, role as UserRole)) {
                return res.status(403).json({ 
                    message: "You are not authorized to view users with this role" 
                });
            }

            const users = await storage.getUsersByRole(role);
            const usersWithoutPasswords = users.map(({ password, ...user }) => user);
            res.json(usersWithoutPasswords);
        } catch (error) {
            console.error("Error fetching users by role:", error);
            res.status(500).json({ message: "Failed to fetch users" });
        }
    });

    // User role management routes
    app.put("/api/auth/change-role", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const { role } = req.body;

            // Validate role
            const validRoles = ["client", "property_owner", "service_provider"];
            if (!validRoles.includes(role)) {
                return res.status(400).json({
                    message:
                        "Invalid role. Valid roles: client, property_owner, service_provider",
                });
            }

            const updatedUser = await storage.updateUserRole(userId, role);
            const { password: _, ...userWithoutPassword } = updatedUser;
            res.json(userWithoutPassword);
        } catch (error) {
            console.error("Error updating user role:", error);
            res.status(500).json({ message: "Failed to update role" });
        }
    });

    app.put("/api/admin/assign-role", requireAuth, async (req, res) => {
        try {
            const adminUserId = (req.session as any).userId;
            const adminUser = await storage.getUser(adminUserId);

            // Check if user is admin
            if (adminUser?.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Admin privileges required" });
            }

            const { userId, role } = req.body;

            // Validate role
            const validRoles = [
                "client",
                "property_owner",
                "service_provider",
                "admin",
                "billing",
                "operation",
                "marketing",
                "country_manager",
                "city_manager",
                "operation_support",
            ];
            if (!validRoles.includes(role)) {
                return res.status(400).json({ message: "Invalid role" });
            }

            // Check if trying to assign operation_support role
            if (role === "operation_support") {
                // Get all users to check if operation_support already exists
                const allUsers = await storage.getAllUsers();
                const existingOperationSupport = allUsers.find(
                    (user) => user.role === "operation_support" && user.id !== userId
                );

                if (existingOperationSupport) {
                    return res.status(400).json({
                        message: "Only one user can have the operation support role. Another user already has this role.",
                    });
                }
            }

            const updatedUser = await storage.updateUserRole(userId, role);
            const { password: _, ...userWithoutPassword } = updatedUser;
            res.json(userWithoutPassword);
        } catch (error) {
            console.error("Error assigning user role:", error);
            res.status(500).json({ message: "Failed to assign role" });
        }
    });

    // Admin routes
    app.get("/api/admin/stats", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            // Check if user is admin
            if (user?.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Admin privileges required" });
            }

            const stats = await storage.getAdminStats();
            res.json(stats);
        } catch (error) {
            console.error("Error fetching admin stats:", error);
            res.status(500).json({ message: "Failed to fetch statistics" });
        }
    });

    app.get("/api/admin/users", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            // Check if user is admin
            if (user?.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Admin privileges required" });
            }

            const users = await storage.getAllUsers();
            // Remove passwords from all users
            const usersWithoutPasswords = users.map(
                ({ password, ...user }) => user
            );
            res.json(usersWithoutPasswords);
        } catch (error) {
            console.error("Error fetching users:", error);
            res.status(500).json({ message: "Failed to fetch users" });
        }
    });

    // Admin property management routes
    app.get("/api/admin/properties", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (user?.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Admin privileges required" });
            }

            const properties = await storage.getAllProperties();
            res.json(properties);
        } catch (error) {
            console.error("Error fetching properties:", error);
            res.status(500).json({ message: "Failed to fetch properties" });
        }
    });

    app.post("/api/admin/properties", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (user?.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Admin privileges required" });
            }

            const property = await storage.createProperty(req.body);
            res.json(property);
        } catch (error) {
            console.error("Error creating property:", error);
            res.status(500).json({ message: "Failed to create property" });
        }
    });

    app.put("/api/admin/properties/:id", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (user?.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Admin privileges required" });
            }

            const property = await storage.updateProperty(
                req.params.id,
                req.body
            );
            res.json(property);
        } catch (error) {
            console.error("Error updating property:", error);
            res.status(500).json({ message: "Failed to update property" });
        }
    });

    app.delete("/api/admin/properties/:id", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (user?.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Admin privileges required" });
            }

            await storage.deleteProperty(req.params.id);
            res.json({ message: "Property deleted successfully" });
        } catch (error) {
            console.error("Error deleting property:", error);
            res.status(500).json({ message: "Failed to delete property" });
        }
    });

    // Self-service provider application with form data (pending approval)
    app.post("/api/user/become-provider", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (user.role === "service_provider") {
                return res
                    .status(400)
                    .json({ message: "You are already a service provider" });
            }

            // Check if user already has a pending application
            const existingProvider = await storage.getServiceProviderByUserId(
                userId
            );
            if (existingProvider) {
                if (existingProvider.approvalStatus === "pending") {
                    return res.status(400).json({
                        message: "You already have a pending application",
                    });
                } else if (existingProvider.approvalStatus === "rejected") {
                    return res.status(400).json({
                        message:
                            "Your previous application was rejected. Please contact support.",
                    });
                }
            }

            // Validate the provider application data
            const providerData = insertServiceProviderSchema.parse({
                userId,
                approvalStatus: "pending",
                ...req.body,
            });

            // Create service provider profile (pending approval)
            const provider = await storage.createServiceProvider(providerData);

            res.json({
                message:
                    "Application submitted successfully! An admin will review it soon.",
                provider,
            });
        } catch (error) {
            console.error("Error submitting provider application:", error);
            res.status(500).json({ message: "Failed to submit application" });
        }
    });

    // Admin: Approve provider application
    app.post(
        "/api/admin/providers/:providerId/approve",
        requireAuth,
        async (req, res) => {
            try {
                const userId = (req.session as any).userId;
                const user = await storage.getUser(userId);

                if (!user || user.role !== "admin") {
                    return res
                        .status(403)
                        .json({ message: "Admin access required" });
                }

                const { providerId } = req.params;
                const provider = await storage.getServiceProvider(providerId);

                if (!provider) {
                    return res
                        .status(404)
                        .json({ message: "Provider application not found" });
                }

                // Update provider approval status
                const updatedProvider =
                    await storage.updateServiceProviderApproval(
                        providerId,
                        "approved",
                        null
                    );

                // Update user role to service_provider
                await storage.updateUserRole(
                    provider.userId,
                    "service_provider"
                );

                // Send approval notification to provider
                await storage.createNotification({
                    userId: provider.userId,
                    type: 'approval',
                    title: 'Application Approved!',
                    message: `Congratulations! Your service provider application for ${provider.businessName} has been approved.`,
                    isRead: false
                });

                res.json({
                    message: "Provider application approved successfully",
                    provider: updatedProvider,
                });
            } catch (error) {
                console.error("Error approving provider:", error);
                res.status(500).json({
                    message: "Failed to approve application",
                });
            }
        }
    );

    // Admin: Reject provider application
    app.post(
        "/api/admin/providers/:providerId/reject",
        requireAuth,
        async (req, res) => {
            try {
                const userId = (req.session as any).userId;
                const user = await storage.getUser(userId);

                if (!user || user.role !== "admin") {
                    return res
                        .status(403)
                        .json({ message: "Admin access required" });
                }

                const { providerId } = req.params;
                const { reason } = req.body;
                const provider = await storage.getServiceProvider(providerId);

                if (!provider) {
                    return res
                        .status(404)
                        .json({ message: "Provider application not found" });
                }

                // Update provider approval status
                const updatedProvider =
                    await storage.updateServiceProviderApproval(
                        providerId,
                        "rejected",
                        reason
                    );

                // Send rejection notification to provider
                await storage.createNotification({
                    userId: provider.userId,
                    type: 'rejection',
                    title: 'Application Update',
                    message: `Your service provider application was not approved. Reason: ${reason || 'Not specified'}`,
                    isRead: false
                });

                res.json({
                    message: "Provider application rejected",
                    provider: updatedProvider,
                });
            } catch (error) {
                console.error("Error rejecting provider:", error);
                res.status(500).json({
                    message: "Failed to reject application",
                });
            }
        }
    );

    // Admin bookings route
    app.get("/api/admin/bookings", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (user?.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Admin privileges required" });
            }

            const bookings = await storage.getAllBookings();
            res.json(bookings);
        } catch (error) {
            console.error("Error fetching admin bookings:", error);
            res.status(500).json({ message: "Failed to fetch bookings" });
        }
    });

    // Admin service orders route
    app.get("/api/admin/service-orders", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (user?.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Admin privileges required" });
            }

            // Parse filter parameters
            const filters = {
                status: req.query.status ? (Array.isArray(req.query.status) ? req.query.status : [req.query.status]) as string[] : undefined,
                providerName: req.query.providerName as string | undefined,
                dateFrom: req.query.dateFrom as string | undefined,
                dateTo: req.query.dateTo as string | undefined,
                paymentStatus: req.query.paymentStatus as string | undefined,
            };

            // Check if summary is requested
            const includeSummary = req.query.include === 'summary';

            const orders = await storage.getFilteredServiceOrders(filters);

            if (includeSummary) {
                // Calculate analytics
                const summary = {
                    totalOrders: orders.length,
                    grossVolume: orders.reduce((sum, o) => sum + parseFloat(o.totalAmount || '0'), 0),
                    platformCommission: orders.reduce((sum, o) => sum + parseFloat(o.platformFeeAmount || '0'), 0),
                    providerPayouts: orders.reduce((sum, o) => sum + parseFloat(o.providerAmount || '0'), 0),
                    refundsCount: orders.filter(o => o.paymentStatus === 'refunded').length,
                    pendingCount: orders.filter(o => o.status === 'pending' || o.status === 'pending_payment').length,
                    completedCount: orders.filter(o => o.status === 'completed').length,
                    cancelledCount: orders.filter(o => o.status === 'cancelled').length,
                };
                res.json({ orders, summary });
            } else {
                res.json(orders);
            }
        } catch (error) {
            console.error("Error fetching admin service orders:", error);
            res.status(500).json({ message: "Failed to fetch service orders" });
        }
    });

    app.patch(
        "/api/admin/service-orders/:id/status",
        requireAuth,
        async (req, res) => {
            try {
                const userId = (req.session as any).userId;
                const user = await storage.getUser(userId);

                if (user?.role !== "admin") {
                    return res
                        .status(403)
                        .json({ message: "Admin privileges required" });
                }

                const { status } = req.body;
                const order = await storage.updateServiceOrderStatus(
                    req.params.id,
                    status
                );
                res.json(order);
            } catch (error) {
                console.error("Error updating service order status:", error);
                res.status(500).json({
                    message: "Failed to update service order status",
                });
            }
        }
    );

    app.get("/api/admin/bookings/:id", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (user?.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Admin privileges required" });
            }

            const bookingDetails = await storage.getBookingDetails(
                req.params.id
            );
            if (!bookingDetails) {
                return res.status(404).json({ message: "Booking not found" });
            }
            res.json(bookingDetails);
        } catch (error) {
            console.error("Error fetching booking details:", error);
            res.status(500).json({
                message: "Failed to fetch booking details",
            });
        }
    });

    app.patch(
        "/api/admin/bookings/:id/status",
        requireAuth,
        async (req, res) => {
            try {
                const userId = (req.session as any).userId;
                const user = await storage.getUser(userId);

                if (user?.role !== "admin") {
                    return res
                        .status(403)
                        .json({ message: "Admin privileges required" });
                }

                const { status } = req.body;
                const booking = await storage.updateBookingStatus(
                    req.params.id,
                    status
                );
                res.json(booking);
            } catch (error) {
                console.error("Error updating booking status:", error);
                res.status(500).json({
                    message: "Failed to update booking status",
                });
            }
        }
    );

    // Admin service providers routes
    app.get("/api/admin/service-providers", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (user?.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Admin privileges required" });
            }

            // Get all providers including pending ones for admin
            const allProviders = await db
                .select({
                    id: serviceProviders.id,
                    userId: serviceProviders.userId,
                    categoryId: serviceProviders.categoryId,
                    businessName: serviceProviders.businessName,
                    description: serviceProviders.description,
                    hourlyRate: serviceProviders.hourlyRate,
                    fixedRate: serviceProviders.fixedRate,
                    availability: serviceProviders.availability,
                    location: serviceProviders.location,
                    radius: serviceProviders.radius,
                    whatsappNumber: serviceProviders.whatsappNumber,
                    certifications: serviceProviders.certifications,
                    portfolio: serviceProviders.portfolio,
                    approvalStatus: serviceProviders.approvalStatus,
                    rejectionReason: serviceProviders.rejectionReason,
                    isVerified: serviceProviders.isVerified,
                    isActive: serviceProviders.isActive,
                    rating: serviceProviders.rating,
                    reviewCount: serviceProviders.reviewCount,
                    yearsExperience: serviceProviders.yearsExperience,
                    languages: serviceProviders.languages,
                    photoUrls: serviceProviders.photoUrls,
                    profilePhotoUrl: serviceProviders.profilePhotoUrl,
                    videoUrl: serviceProviders.videoUrl,
                    awards: serviceProviders.awards,
                    createdAt: serviceProviders.createdAt,
                    updatedAt: serviceProviders.updatedAt,
                    category: {
                        id: serviceCategories.id,
                        name: serviceCategories.name,
                        description: serviceCategories.description,
                        icon: serviceCategories.icon,
                    },
                    user: {
                        id: users.id,
                        email: users.email,
                        firstName: users.firstName,
                        lastName: users.lastName,
                        role: users.role,
                    },
                })
                .from(serviceProviders)
                .leftJoin(serviceCategories, eq(serviceProviders.categoryId, serviceCategories.id))
                .leftJoin(users, eq(serviceProviders.userId, users.id))
                .orderBy(desc(serviceProviders.createdAt));

            res.json(allProviders);
        } catch (error) {
            console.error("Error fetching service providers:", error);
            res.status(500).json({
                message: "Failed to fetch service providers",
            });
        }
    });

    app.post("/api/admin/service-providers", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (user?.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Admin privileges required" });
            }

            // Automatically approve providers created by admin
            const providerData = {
                ...req.body,
                approvalStatus: "approved",
            };

            const provider = await storage.createServiceProvider(providerData);
            
            // Update user role to service_provider if not already
            const providerUser = await storage.getUser(provider.userId);
            if (providerUser && providerUser.role !== "service_provider") {
                await storage.updateUserRole(provider.userId, "service_provider");
            }

            res.status(201).json(provider);
        } catch (error) {
            console.error("Error creating service provider:", error);
            res.status(500).json({
                message: "Failed to create service provider",
            });
        }
    });

    app.patch(
        "/api/admin/service-providers/:id",
        requireAuth,
        async (req, res) => {
            try {
                const userId = (req.session as any).userId;
                const user = await storage.getUser(userId);

                if (user?.role !== "admin") {
                    return res
                        .status(403)
                        .json({ message: "Admin privileges required" });
                }

                const provider = await storage.updateServiceProvider(
                    req.params.id,
                    req.body
                );
                res.json(provider);
            } catch (error) {
                console.error("Error updating service provider:", error);
                res.status(500).json({
                    message: "Failed to update service provider",
                });
            }
        }
    );

    app.delete(
        "/api/admin/service-providers/:id",
        requireAuth,
        async (req, res) => {
            try {
                const userId = (req.session as any).userId;
                const user = await storage.getUser(userId);

                if (user?.role !== "admin") {
                    return res
                        .status(403)
                        .json({ message: "Admin privileges required" });
                }

                await storage.deleteServiceProvider(req.params.id);
                res.json({ message: "Service provider deleted successfully" });
            } catch (error) {
                console.error("Error deleting service provider:", error);
                res.status(500).json({
                    message: "Failed to delete service provider",
                });
            }
        }
    );

    // Admin service category routes
    app.post("/api/admin/service-categories", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (user?.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Admin privileges required" });
            }

            const category = await storage.createServiceCategory(req.body);
            res.status(201).json(category);
        } catch (error) {
            console.error("Error creating service category:", error);
            res.status(500).json({
                message: "Failed to create service category",
            });
        }
    });

    app.patch(
        "/api/admin/service-categories/:id",
        requireAuth,
        async (req, res) => {
            try {
                const userId = (req.session as any).userId;
                const user = await storage.getUser(userId);

                if (user?.role !== "admin") {
                    return res
                        .status(403)
                        .json({ message: "Admin privileges required" });
                }

                const category = await storage.updateServiceCategory(
                    req.params.id,
                    req.body
                );
                res.json(category);
            } catch (error) {
                console.error("Error updating service category:", error);
                res.status(500).json({
                    message: "Failed to update service category",
                });
            }
        }
    );

    app.delete(
        "/api/admin/service-categories/:id",
        requireAuth,
        async (req, res) => {
            try {
                const userId = (req.session as any).userId;
                const user = await storage.getUser(userId);

                if (user?.role !== "admin") {
                    return res
                        .status(403)
                        .json({ message: "Admin privileges required" });
                }

                await storage.deleteServiceCategory(req.params.id);
                res.json({ message: "Service category deleted successfully" });
            } catch (error) {
                console.error("Error deleting service category:", error);
                res.status(500).json({
                    message: "Failed to delete service category",
                });
            }
        }
    );

    // Admin staff account creation
    app.post("/api/admin/create-staff", requireAuth, requireApprovedUser, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (user?.role !== "admin" || user?.status !== "approved") {
                return res.status(403).json({ message: "Admin privileges required" });
            }

            const { email, firstName, lastName, role } = req.body;

            // Validate internal role
            const internalRoles = ["billing", "operation", "marketing", "accounts", "country_manager"];
            if (!internalRoles.includes(role)) {
                return res.status(400).json({ message: "Invalid staff role" });
            }

            // Check if user already exists
            const existingUser = await storage.getUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: "User with this email already exists" });
            }

            // Generate temporary password (8 random characters)
            const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
            const hashedPassword = await hashPassword(tempPassword);

            // Create user with approved status
            const newUser = await storage.createUser({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role,
                status: "approved",
                approvedBy: userId,
                approvedAt: new Date().toISOString(),
            });

            // Send credentials email
            try {
                await sendAccountCredentialsEmail(email, firstName, role, tempPassword);
            } catch (emailError) {
                console.error("Failed to send credentials email:", emailError);
                // Don't fail the request if email fails
            }

            res.status(201).json({
                message: "Staff account created successfully",
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    role: newUser.role,
                },
            });
        } catch (error) {
            console.error("Error creating staff account:", error);
            res.status(500).json({ message: "Failed to create staff account" });
        }
    });

    // Approval routes for Country Manager and City Manager
    app.get("/api/approvals/pending", requireAuth, requireApprovedUser, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (!user || user.status !== "approved") {
                return res.status(403).json({ message: "Approved user required" });
            }

            let pendingUsers;

            // Country Manager can approve City Managers
            if (user.role === "country_manager") {
                const allUsers = await storage.getAllUsers();
                pendingUsers = allUsers.filter(u => 
                    u.status === "pending" && u.role === "city_manager"
                );
            }
            // City Manager can approve Hosts and Service Providers
            else if (user.role === "city_manager") {
                const allUsers = await storage.getAllUsers();
                pendingUsers = allUsers.filter(u => 
                    u.status === "pending" && 
                    (u.role === "property_owner" || u.role === "service_provider")
                );
            }
            else {
                return res.status(403).json({ message: "Not authorized to view approvals" });
            }

            res.json(pendingUsers);
        } catch (error) {
            console.error("Error fetching pending users:", error);
            res.status(500).json({ message: "Failed to fetch pending users" });
        }
    });

    app.post("/api/approvals/approve/:userId", requireAuth, requireApprovedUser, async (req, res) => {
        try {
            const approverId = (req.session as any).userId;
            const approver = await storage.getUser(approverId);
            const targetUserId = req.params.userId;

            if (!approver || approver.status !== "approved") {
                return res.status(403).json({ message: "Approved user required" });
            }

            const targetUser = await storage.getUser(targetUserId);
            if (!targetUser) {
                return res.status(404).json({ message: "User not found" });
            }

            // Validate approval permissions
            const canApprove = 
                (approver.role === "country_manager" && targetUser.role === "city_manager") ||
                (approver.role === "city_manager" && 
                 (targetUser.role === "property_owner" || targetUser.role === "service_provider"));

            if (!canApprove) {
                return res.status(403).json({ message: "Not authorized to approve this user" });
            }

            // Approve the user
            await storage.updateUser(targetUserId, {
                status: "approved",
                approvedBy: approverId,
                approvedAt: new Date().toISOString(),
            });

            res.json({ message: "User approved successfully" });
        } catch (error) {
            console.error("Error approving user:", error);
            res.status(500).json({ message: "Failed to approve user" });
        }
    });

    app.post("/api/approvals/reject/:userId", requireAuth, requireApprovedUser, async (req, res) => {
        try {
            const approverId = (req.session as any).userId;
            const approver = await storage.getUser(approverId);
            const targetUserId = req.params.userId;

            if (!approver || approver.status !== "approved") {
                return res.status(403).json({ message: "Approved user required" });
            }

            const targetUser = await storage.getUser(targetUserId);
            if (!targetUser) {
                return res.status(404).json({ message: "User not found" });
            }

            // Validate rejection permissions
            const canReject = 
                (approver.role === "country_manager" && targetUser.role === "city_manager") ||
                (approver.role === "city_manager" && 
                 (targetUser.role === "property_owner" || targetUser.role === "service_provider"));

            if (!canReject) {
                return res.status(403).json({ message: "Not authorized to reject this user" });
            }

            // Reject the user
            await storage.updateUser(targetUserId, {
                status: "rejected",
                approvedBy: approverId,
                approvedAt: new Date().toISOString(),
            });

            res.json({ message: "User rejected successfully" });
        } catch (error) {
            console.error("Error rejecting user:", error);
            res.status(500).json({ message: "Failed to reject user" });
        }
    });

    // Billing Dashboard routes
    app.get("/api/billing/stats", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (user?.role !== "billing") {
                return res
                    .status(403)
                    .json({ message: "Billing role required" });
            }

            const allBookings = await storage.getAllBookings();
            const allOrders = await storage.getAllServiceOrders();

            const totalRevenue = [...allBookings, ...allOrders].reduce(
                (sum, item) =>
                    sum +
                    (item.paymentStatus === "paid" && 
                     item.status !== "cancelled"
                        ? parseFloat(item.totalAmount.toString())
                        : 0),
                0
            );

            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const monthlyRevenue = [...allBookings, ...allOrders]
                .filter((item) => {
                    if (!item.createdAt) return false;
                    const itemDate = new Date(item.createdAt);
                    return (
                        itemDate.getMonth() === currentMonth &&
                        itemDate.getFullYear() === currentYear &&
                        item.paymentStatus === "paid" &&
                        item.status !== "cancelled"
                    );
                })
                .reduce(
                    (sum, item) => sum + parseFloat(item.totalAmount.toString()),
                    0
                );

            const totalTransactions = allBookings.length + allOrders.length;
            const pendingPayments = [...allBookings, ...allOrders].filter(
                (item) => item.paymentStatus === "pending"
            ).length;

            const platformCommission = allOrders
                .filter((order) => order.paymentStatus === "paid" && order.status === "completed")
                .reduce((sum, order) => {
                    const feeAmount = order.platformFeeAmount
                        ? parseFloat(order.platformFeeAmount.toString())
                        : 0;
                    return sum + feeAmount;
                }, 0);

            const providerPayouts = allOrders
                .filter((order) => order.paymentStatus === "paid" && order.status === "completed")
                .reduce((sum, order) => {
                    const total = parseFloat(order.totalAmount.toString());
                    const fee = order.platformFeeAmount
                        ? parseFloat(order.platformFeeAmount.toString())
                        : 0;
                    return sum + (total - fee);
                }, 0);

            const refundedItems = [...allBookings, ...allOrders].filter(
                (item) => item.paymentStatus === "refunded"
            );
            
            const refundsIssued = refundedItems.reduce(
                (sum, item) => sum + parseFloat(item.totalAmount.toString()),
                0
            );
            
            const refundCount = refundedItems.length;

            const currentCommissionRate = 10; // Default commission rate

            res.json({
                totalRevenue,
                monthlyRevenue,
                totalTransactions,
                pendingPayments,
                platformCommission,
                providerPayouts,
                refundsIssued,
                refundCount,
                currentCommissionRate,
            });
        } catch (error) {
            console.error("Error fetching billing stats:", error);
            res.status(500).json({ message: "Failed to fetch billing stats" });
        }
    });

    app.get("/api/billing/transactions", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (user?.role !== "billing") {
                return res
                    .status(403)
                    .json({ message: "Billing role required" });
            }

            const allBookings = await storage.getAllBookings();
            const allOrders = await storage.getAllServiceOrders();

            const transactions = [];

            for (const booking of allBookings) {
                const client = await storage.getUser(booking.clientId);
                transactions.push({
                    id: booking.id,
                    type: "booking",
                    amount: parseFloat(booking.totalAmount.toString()),
                    status: booking.status,
                    paymentStatus: booking.paymentStatus,
                    createdAt: booking.createdAt,
                    clientName: client
                        ? `${client.firstName} ${client.lastName}`
                        : "Unknown",
                });
            }

            for (const order of allOrders) {
                const client = await storage.getUser(order.clientId);
                transactions.push({
                    id: order.id,
                    type: "service_order",
                    amount: parseFloat(order.totalAmount.toString()),
                    status: order.status,
                    paymentStatus: order.paymentStatus,
                    createdAt: order.createdAt,
                    clientName: client
                        ? `${client.firstName} ${client.lastName}`
                        : "Unknown",
                });
            }

            transactions.sort(
                (a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return dateB - dateA;
                }
            );

            res.json(transactions);
        } catch (error) {
            console.error("Error fetching billing transactions:", error);
            res.status(500).json({
                message: "Failed to fetch billing transactions",
            });
        }
    });

    app.get("/api/billing/top-services", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (user?.role !== "billing") {
                return res
                    .status(403)
                    .json({ message: "Billing role required" });
            }

            const allOrders = await storage.getAllServiceOrders();
            const serviceMap = new Map<
                string,
                {
                    serviceName: string;
                    orderCount: number;
                    totalRevenue: number;
                    commission: number;
                }
            >();

            for (const order of allOrders) {
                if (order.paymentStatus !== "paid" || order.status !== "completed") continue;

                const service = await storage.getServiceProvider(
                    order.serviceProviderId
                );
                const serviceName = service?.businessName || "Unknown Service";
                const revenue = parseFloat(order.totalAmount.toString());
                const commission = order.platformFeeAmount
                    ? parseFloat(order.platformFeeAmount.toString())
                    : 0;

                if (serviceMap.has(serviceName)) {
                    const existing = serviceMap.get(serviceName)!;
                    serviceMap.set(serviceName, {
                        serviceName,
                        orderCount: existing.orderCount + 1,
                        totalRevenue: existing.totalRevenue + revenue,
                        commission: existing.commission + commission,
                    });
                } else {
                    serviceMap.set(serviceName, {
                        serviceName,
                        orderCount: 1,
                        totalRevenue: revenue,
                        commission,
                    });
                }
            }

            const topServices = Array.from(serviceMap.values())
                .sort((a, b) => b.totalRevenue - a.totalRevenue)
                .slice(0, 10);

            res.json(topServices);
        } catch (error) {
            console.error("Error fetching top services:", error);
            res.status(500).json({ message: "Failed to fetch top services" });
        }
    });

    // Operation Dashboard routes
    app.get("/api/operation/stats", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (user?.role !== "operation") {
                return res.status(403).json({ message: "Operation role required" });
            }

            const allUsers = await storage.getAllUsers();
            const allBookings = await storage.getAllBookings();
            const allProperties = await storage.getAllProperties();

            res.json({
                totalUsers: allUsers.length,
                activeUsers: allUsers.filter((u) => u.createdAt).length,
                totalBookings: allBookings.length,
                activeProperties: allProperties.filter((p) => p.isActive).length,
            });
        } catch (error) {
            console.error("Error fetching operation stats:", error);
            res.status(500).json({ message: "Failed to fetch operation stats" });
        }
    });

    app.get("/api/operation/users", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (user?.role !== "operation") {
                return res.status(403).json({ message: "Operation role required" });
            }

            const allUsers = await storage.getAllUsers();
            const usersWithoutPasswords = allUsers.map(({ password, ...user }) => user);
            res.json(usersWithoutPasswords);
        } catch (error) {
            console.error("Error fetching users:", error);
            res.status(500).json({ message: "Failed to fetch users" });
        }
    });

    // Marketing Dashboard routes
    app.get("/api/marketing/stats", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (user?.role !== "marketing") {
                return res.status(403).json({ message: "Marketing role required" });
            }

            const allProperties = await storage.getAllProperties();
            const allProviders = await storage.getServiceProviders();
            const allPromoCodes = await storage.getAllPromoCodes();

            res.json({
                totalProperties: allProperties.length,
                totalProviders: allProviders.length,
                activePromoCodes: allPromoCodes.filter((p: any) => p.isActive).length,
                totalViews: 0,
            });
        } catch (error) {
            console.error("Error fetching marketing stats:", error);
            res.status(500).json({ message: "Failed to fetch marketing stats" });
        }
    });

    app.get("/api/marketing/promo-codes", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (user?.role !== "marketing") {
                return res.status(403).json({ message: "Marketing role required" });
            }

            const promoCodes = await storage.getAllPromoCodes();
            res.json(promoCodes);
        } catch (error) {
            console.error("Error fetching promo codes:", error);
            res.status(500).json({ message: "Failed to fetch promo codes" });
        }
    });

    // City Manager Dashboard routes
    app.get("/api/city-manager/stats", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (user?.role !== "city_manager") {
                return res.status(403).json({ message: "City Manager role required" });
            }

            const allProperties = await storage.getAllProperties();
            const allProviders = await storage.getServiceProviders();
            const allUsers = await storage.getAllUsers();

            res.json({
                totalProperties: allProperties.length,
                totalProviders: allProviders.filter((p: any) => p.approvalStatus === "approved").length,
                pendingApplications: allProviders.filter((p: any) => p.approvalStatus === "pending").length,
                totalHosts: allUsers.filter((u) => u.role === "property_owner").length,
            });
        } catch (error) {
            console.error("Error fetching city manager stats:", error);
            res.status(500).json({ message: "Failed to fetch city manager stats" });
        }
    });

    app.get("/api/city-manager/providers", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (user?.role !== "city_manager") {
                return res.status(403).json({ message: "City Manager role required" });
            }

            const providers = await storage.getServiceProviders();
            const providersWithUsers = await Promise.all(
                providers.map(async (provider: any) => {
                    const providerUser = await storage.getUser(provider.userId);
                    return {
                        ...provider,
                        user: providerUser
                            ? {
                                  firstName: providerUser.firstName,
                                  lastName: providerUser.lastName,
                                  email: providerUser.email,
                              }
                            : {
                                  firstName: "Unknown",
                                  lastName: "",
                                  email: "",
                              },
                    };
                })
            );
            res.json(providersWithUsers);
        } catch (error) {
            console.error("Error fetching providers:", error);
            res.status(500).json({ message: "Failed to fetch providers" });
        }
    });

    // Country Manager Dashboard routes
    app.get("/api/country-manager/stats", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (user?.role !== "country_manager") {
                return res.status(403).json({ message: "Country Manager role required" });
            }

            const allProviders = await storage.getServiceProviders();
            const allOrders = await storage.getAllServiceOrders();
            
            // Get real assignment counts
            const pendingAssignments = await storage.getPendingJobAssignmentsCount();
            const completedAssignments = await storage.getCompletedJobAssignmentsCount(userId);

            res.json({
                totalProviders: allProviders.filter((p: any) => p.approvalStatus === "approved").length,
                totalBookings: allOrders.length,
                pendingAssignments,
                completedAssignments,
            });
        } catch (error) {
            console.error("Error fetching country manager stats:", error);
            res.status(500).json({ message: "Failed to fetch country manager stats" });
        }
    });

    app.get("/api/country-manager/providers", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (user?.role !== "country_manager") {
                return res.status(403).json({ message: "Country Manager role required" });
            }

            const providers = await storage.getServiceProviders();
            const providersWithUsers = await Promise.all(
                providers.map(async (provider: any) => {
                    const providerUser = await storage.getUser(provider.userId);
                    return {
                        ...provider,
                        user: providerUser
                            ? {
                                  firstName: providerUser.firstName,
                                  lastName: providerUser.lastName,
                                  email: providerUser.email,
                              }
                            : {
                                  firstName: "Unknown",
                                  lastName: "",
                                  email: "",
                              },
                    };
                })
            );
            res.json(providersWithUsers);
        } catch (error) {
            console.error("Error fetching country manager providers:", error);
            res.status(500).json({ message: "Failed to fetch providers" });
        }
    });

    app.get("/api/country-manager/bookings", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (user?.role !== "country_manager") {
                return res.status(403).json({ message: "Country Manager role required" });
            }

            const allOrders = await storage.getAllServiceOrders();
            const bookingsWithClients = await Promise.all(
                allOrders.map(async (order: any) => {
                    const client = await storage.getUser(order.clientId);
                    return {
                        id: order.id,
                        status: order.status,
                        createdAt: order.createdAt,
                        scheduledDate: order.scheduledDate,
                        totalAmount: order.totalAmount.toString(),
                        client: client
                            ? {
                                  firstName: client.firstName,
                                  lastName: client.lastName,
                              }
                            : {
                                  firstName: "Unknown",
                                  lastName: "",
                              },
                    };
                })
            );
            res.json(bookingsWithClients);
        } catch (error) {
            console.error("Error fetching country manager bookings:", error);
            res.status(500).json({ message: "Failed to fetch bookings" });
        }
    });

    // City Manager: Approve provider application
    // MVP LIMITATION: No jurisdiction validation - any city_manager can approve any provider
    // TODO: Add jurisdiction checks in production (verify provider belongs to manager's city)
    app.post(
        "/api/city-manager/providers/:providerId/approve",
        requireAuth,
        async (req, res) => {
            try {
                const userId = (req.session as any).userId;
                const user = await storage.getUser(userId);

                if (!user || user.role !== "city_manager") {
                    return res
                        .status(403)
                        .json({ message: "City Manager access required" });
                }

                const { providerId } = req.params;
                const provider = await storage.getServiceProvider(providerId);

                if (!provider) {
                    return res
                        .status(404)
                        .json({ message: "Provider application not found" });
                }

                // Verify provider is still pending (prevents duplicate approvals)
                if (provider.approvalStatus !== "pending") {
                    return res
                        .status(400)
                        .json({ message: `Provider application is already ${provider.approvalStatus}` });
                }

                // Update provider approval status
                const updatedProvider =
                    await storage.updateServiceProviderApproval(
                        providerId,
                        "approved",
                        null
                    );

                // Update user role to service_provider
                await storage.updateUserRole(
                    provider.userId,
                    "service_provider"
                );

                // Send approval notification to provider
                await storage.createNotification({
                    userId: provider.userId,
                    type: 'approval',
                    title: 'Application Approved!',
                    message: `Congratulations! Your service provider application for ${provider.businessName} has been approved by the city manager.`,
                    isRead: false
                });

                res.json({
                    message: "Provider application approved successfully",
                    provider: updatedProvider,
                });
            } catch (error) {
                console.error("Error approving provider:", error);
                res.status(500).json({
                    message: "Failed to approve application",
                });
            }
        }
    );

    // City Manager: Reject provider application
    // MVP LIMITATION: No jurisdiction validation - any city_manager can reject any provider
    // TODO: Add jurisdiction checks in production (verify provider belongs to manager's city)
    app.post(
        "/api/city-manager/providers/:providerId/reject",
        requireAuth,
        async (req, res) => {
            try {
                const userId = (req.session as any).userId;
                const user = await storage.getUser(userId);

                if (!user || user.role !== "city_manager") {
                    return res
                        .status(403)
                        .json({ message: "City Manager access required" });
                }

                const { providerId } = req.params;
                const { reason } = req.body;
                const provider = await storage.getServiceProvider(providerId);

                if (!provider) {
                    return res
                        .status(404)
                        .json({ message: "Provider application not found" });
                }

                // Verify provider is still pending (prevents duplicate rejections)
                if (provider.approvalStatus !== "pending") {
                    return res
                        .status(400)
                        .json({ message: `Provider application is already ${provider.approvalStatus}` });
                }

                // Update provider approval status
                const updatedProvider =
                    await storage.updateServiceProviderApproval(
                        providerId,
                        "rejected",
                        reason
                    );

                // Send rejection notification to provider
                await storage.createNotification({
                    userId: provider.userId,
                    type: 'rejection',
                    title: 'Application Update',
                    message: `Your service provider application was not approved by the city manager. Reason: ${reason || 'Not specified'}`,
                    isRead: false
                });

                res.json({
                    message: "Provider application rejected",
                    provider: updatedProvider,
                });
            } catch (error) {
                console.error("Error rejecting provider:", error);
                res.status(500).json({
                    message: "Failed to reject application",
                });
            }
        }
    );

    // City Manager: Get service bookings with analytics
    // MVP LIMITATION: No jurisdiction validation - shows all bookings
    // TODO: Add jurisdiction checks in production (filter by city)
    app.get("/api/city-manager/service-orders", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (!user || user.role !== "city_manager") {
                return res.status(403).json({ message: "City Manager access required" });
            }

            const includeSummary = req.query.include === 'summary';
            
            // TODO: In production, filter by city jurisdiction
            // For MVP, show all service orders
            const filters: any = {};
            
            // Apply optional filters from query params
            if (req.query.status) {
                const statusArray = Array.isArray(req.query.status) 
                    ? req.query.status 
                    : [req.query.status];
                filters.status = statusArray;
            }
            
            if (req.query.providerName) {
                filters.providerName = req.query.providerName as string;
            }
            
            if (req.query.dateFrom) {
                filters.dateFrom = req.query.dateFrom as string;
            }
            
            if (req.query.dateTo) {
                filters.dateTo = req.query.dateTo as string;
            }
            
            if (req.query.paymentStatus) {
                filters.paymentStatus = req.query.paymentStatus as string;
            }

            const orders = await storage.getFilteredServiceOrders(filters);

            if (includeSummary) {
                const summary = {
                    totalOrders: orders.length,
                    grossVolume: orders.reduce((sum, o) => sum + parseFloat(o.totalAmount || '0'), 0),
                    platformCommission: orders.reduce((sum, o) => sum + parseFloat(o.platformFeeAmount || '0'), 0),
                    providerPayouts: orders.reduce((sum, o) => sum + parseFloat(o.providerAmount || '0'), 0),
                    refundsCount: orders.filter(o => o.paymentStatus === 'refunded').length,
                    pendingCount: orders.filter(o => o.status === 'pending' || o.status === 'pending_payment').length,
                    completedCount: orders.filter(o => o.status === 'completed').length,
                    cancelledCount: orders.filter(o => o.status === 'cancelled').length,
                };
                res.json({ orders, summary });
            } else {
                res.json(orders);
            }
        } catch (error) {
            console.error("Error fetching city manager service orders:", error);
            res.status(500).json({ message: "Failed to fetch service orders" });
        }
    });

    // Country Manager: Approve provider application
    // MVP LIMITATION: No jurisdiction validation - any country_manager can approve any provider
    // TODO: Add jurisdiction checks in production (verify provider belongs to manager's country)
    app.post(
        "/api/country-manager/providers/:providerId/approve",
        requireAuth,
        async (req, res) => {
            try {
                const userId = (req.session as any).userId;
                const user = await storage.getUser(userId);

                if (!user || user.role !== "country_manager") {
                    return res
                        .status(403)
                        .json({ message: "Country Manager access required" });
                }

                const { providerId } = req.params;
                const provider = await storage.getServiceProvider(providerId);

                if (!provider) {
                    return res
                        .status(404)
                        .json({ message: "Provider application not found" });
                }

                // Verify provider is still pending (prevents duplicate approvals)
                if (provider.approvalStatus !== "pending") {
                    return res
                        .status(400)
                        .json({ message: `Provider application is already ${provider.approvalStatus}` });
                }

                // Update provider approval status
                const updatedProvider =
                    await storage.updateServiceProviderApproval(
                        providerId,
                        "approved",
                        null
                    );

                // Update user role to service_provider
                await storage.updateUserRole(
                    provider.userId,
                    "service_provider"
                );

                // Send approval notification to provider
                await storage.createNotification({
                    userId: provider.userId,
                    type: 'approval',
                    title: 'Application Approved!',
                    message: `Congratulations! Your service provider application for ${provider.businessName} has been approved by the country manager.`,
                    isRead: false
                });

                res.json({
                    message: "Provider application approved successfully",
                    provider: updatedProvider,
                });
            } catch (error) {
                console.error("Error approving provider:", error);
                res.status(500).json({
                    message: "Failed to approve application",
                });
            }
        }
    );

    // Country Manager: Reject provider application
    // MVP LIMITATION: No jurisdiction validation - any country_manager can reject any provider
    // TODO: Add jurisdiction checks in production (verify provider belongs to manager's country)
    app.post(
        "/api/country-manager/providers/:providerId/reject",
        requireAuth,
        async (req, res) => {
            try {
                const userId = (req.session as any).userId;
                const user = await storage.getUser(userId);

                if (!user || user.role !== "country_manager") {
                    return res
                        .status(403)
                        .json({ message: "Country Manager access required" });
                }

                const { providerId } = req.params;
                const { reason } = req.body;
                const provider = await storage.getServiceProvider(providerId);

                if (!provider) {
                    return res
                        .status(404)
                        .json({ message: "Provider application not found" });
                }

                // Verify provider is still pending (prevents duplicate rejections)
                if (provider.approvalStatus !== "pending") {
                    return res
                        .status(400)
                        .json({ message: `Provider application is already ${provider.approvalStatus}` });
                }

                // Update provider approval status
                const updatedProvider =
                    await storage.updateServiceProviderApproval(
                        providerId,
                        "rejected",
                        reason
                    );

                // Send rejection notification to provider
                await storage.createNotification({
                    userId: provider.userId,
                    type: 'rejection',
                    title: 'Application Update',
                    message: `Your service provider application was not approved by the country manager. Reason: ${reason || 'Not specified'}`,
                    isRead: false
                });

                res.json({
                    message: "Provider application rejected",
                    provider: updatedProvider,
                });
            } catch (error) {
                console.error("Error rejecting provider:", error);
                res.status(500).json({
                    message: "Failed to reject application",
                });
            }
        }
    );

    // Country Manager: Get service bookings with analytics
    // MVP LIMITATION: No jurisdiction validation - shows all bookings
    // TODO: Add jurisdiction checks in production (filter by country)
    app.get("/api/country-manager/service-orders", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (!user || user.role !== "country_manager") {
                return res.status(403).json({ message: "Country Manager access required" });
            }

            const includeSummary = req.query.include === 'summary';
            
            // TODO: In production, filter by country jurisdiction
            // For MVP, show all service orders
            const filters: any = {};
            
            // Apply optional filters from query params
            if (req.query.status) {
                const statusArray = Array.isArray(req.query.status) 
                    ? req.query.status 
                    : [req.query.status];
                filters.status = statusArray;
            }
            
            if (req.query.providerName) {
                filters.providerName = req.query.providerName as string;
            }
            
            if (req.query.dateFrom) {
                filters.dateFrom = req.query.dateFrom as string;
            }
            
            if (req.query.dateTo) {
                filters.dateTo = req.query.dateTo as string;
            }
            
            if (req.query.paymentStatus) {
                filters.paymentStatus = req.query.paymentStatus as string;
            }

            const orders = await storage.getFilteredServiceOrders(filters);

            if (includeSummary) {
                const summary = {
                    totalOrders: orders.length,
                    grossVolume: orders.reduce((sum, o) => sum + parseFloat(o.totalAmount || '0'), 0),
                    platformCommission: orders.reduce((sum, o) => sum + parseFloat(o.platformFeeAmount || '0'), 0),
                    providerPayouts: orders.reduce((sum, o) => sum + parseFloat(o.providerAmount || '0'), 0),
                    refundsCount: orders.filter(o => o.paymentStatus === 'refunded').length,
                    pendingCount: orders.filter(o => o.status === 'pending' || o.status === 'pending_payment').length,
                    completedCount: orders.filter(o => o.status === 'completed').length,
                    cancelledCount: orders.filter(o => o.status === 'cancelled').length,
                };
                res.json({ orders, summary });
            } else {
                res.json(orders);
            }
        } catch (error) {
            console.error("Error fetching country manager service orders:", error);
            res.status(500).json({ message: "Failed to fetch service orders" });
        }
    });

    // Country Manager: Assign job to provider
    app.post("/api/country-manager/assign-job", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (!user || user.role !== "country_manager") {
                return res.status(403).json({ message: "Country Manager access required" });
            }

            const { serviceBookingId, serviceProviderId } = req.body;

            if (!serviceBookingId || !serviceProviderId) {
                return res.status(400).json({ 
                    message: "Service booking ID and service provider ID are required" 
                });
            }

            // Check if assignment already exists for this booking
            const existingAssignment = await storage.getJobAssignmentByBooking(serviceBookingId);
            if (existingAssignment) {
                return res.status(400).json({ 
                    message: "This booking is already assigned to a provider" 
                });
            }

            // Get provider details for notification
            const provider = await storage.getServiceProvider(serviceProviderId);
            if (!provider) {
                return res.status(404).json({ message: "Service provider not found" });
            }

            // Create job assignment
            const assignment = await storage.createJobAssignment({
                serviceBookingId,
                serviceProviderId,
                assignedBy: userId,
                status: 'pending',
            });

            // Notify the provider
            await storage.createNotification({
                userId: provider.userId,
                type: 'job_assigned',
                title: 'New Job Assignment',
                message: `You have been assigned a new job by the Country Manager. Please review and accept or reject.`,
                relatedId: assignment.id,
                isRead: false,
            });

            res.json({
                message: "Job assigned successfully",
                assignment,
            });
        } catch (error) {
            console.error("Error assigning job:", error);
            res.status(500).json({ message: "Failed to assign job" });
        }
    });

    // Provider: Get job assignments
    app.get("/api/provider/job-assignments", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (!user || user.role !== "service_provider") {
                return res.status(403).json({ message: "Service Provider access required" });
            }

            // Get provider profile
            const provider = await storage.getServiceProviderByUserId(userId);
            if (!provider) {
                return res.status(404).json({ message: "Service provider profile not found" });
            }

            // Get all assignments for this provider
            const assignments = await storage.getJobAssignmentsByProvider(provider.id);

            res.json(assignments);
        } catch (error) {
            console.error("Error fetching job assignments:", error);
            res.status(500).json({ message: "Failed to fetch job assignments" });
        }
    });

    // Provider: Accept job assignment
    app.post("/api/provider/job-assignments/:id/accept", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (!user || user.role !== "service_provider") {
                return res.status(403).json({ message: "Service Provider access required" });
            }

            const { id } = req.params;

            // Get provider profile
            const provider = await storage.getServiceProviderByUserId(userId);
            if (!provider) {
                return res.status(404).json({ message: "Service provider profile not found" });
            }

            // Get assignment to find who assigned it
            const assignment = await storage.getJobAssignment(id);
            if (!assignment) {
                return res.status(404).json({ message: "Job assignment not found" });
            }

            // Accept the assignment
            const updatedAssignment = await storage.acceptJobAssignment(id, provider.id);

            // Notify the country manager who assigned it
            await storage.createNotification({
                userId: assignment.assignedBy,
                type: 'job_accepted',
                title: 'Job Assignment Accepted',
                message: `A service provider has accepted the job assignment.`,
                relatedId: assignment.id,
                isRead: false,
            });

            res.json({
                message: "Job assignment accepted successfully",
                assignment: updatedAssignment,
            });
        } catch (error) {
            console.error("Error accepting job assignment:", error);
            res.status(500).json({ 
                message: error instanceof Error ? error.message : "Failed to accept job assignment" 
            });
        }
    });

    // Provider: Reject job assignment
    app.post("/api/provider/job-assignments/:id/reject", requireAuth, async (req, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (!user || user.role !== "service_provider") {
                return res.status(403).json({ message: "Service Provider access required" });
            }

            const { id } = req.params;
            const { reason } = req.body;

            if (!reason) {
                return res.status(400).json({ message: "Rejection reason is required" });
            }

            // Get provider profile
            const provider = await storage.getServiceProviderByUserId(userId);
            if (!provider) {
                return res.status(404).json({ message: "Service provider profile not found" });
            }

            // Get assignment to find who assigned it
            const assignment = await storage.getJobAssignment(id);
            if (!assignment) {
                return res.status(404).json({ message: "Job assignment not found" });
            }

            // Reject the assignment
            const updatedAssignment = await storage.rejectJobAssignment(id, provider.id, reason);

            // Notify the country manager who assigned it
            await storage.createNotification({
                userId: assignment.assignedBy,
                type: 'job_rejected',
                title: 'Job Assignment Rejected',
                message: `A service provider has rejected the job assignment. Reason: ${reason}`,
                relatedId: assignment.id,
                isRead: false,
            });

            res.json({
                message: "Job assignment rejected",
                assignment: updatedAssignment,
            });
        } catch (error) {
            console.error("Error rejecting job assignment:", error);
            res.status(500).json({ 
                message: error instanceof Error ? error.message : "Failed to reject job assignment" 
            });
        }
    });

    // Property routes
    app.get("/api/properties", async (req, res) => {
        try {
            const { location, maxPrice, minPrice, guests, checkIn, checkOut } =
                req.query;

            const filters: any = {};
            if (location) filters.location = location as string;
            if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
            if (minPrice) filters.minPrice = parseFloat(minPrice as string);
            if (guests) filters.guests = parseInt(guests as string);
            if (checkIn) filters.checkIn = new Date(checkIn as string);
            if (checkOut) filters.checkOut = new Date(checkOut as string);

            const properties = await storage.getProperties(filters);

            // Add real service counts from database for each property
            const propertiesWithServiceCounts = await Promise.all(
                properties.map(async (property) => {
                    const services = await storage.getPropertyServices(
                        property.id
                    );
                    return {
                        ...property,
                        serviceCount: services.length,
                    };
                })
            );

            res.json(propertiesWithServiceCounts);
        } catch (error) {
            console.error("Error fetching properties:", error);
            res.status(500).json({ message: "Failed to fetch properties" });
        }
    });

    app.get("/api/properties/:id", async (req, res) => {
        try {
            const property = await storage.getProperty(req.params.id);
            if (!property) {
                return res.status(404).json({ message: "Property not found" });
            }
            res.json(property);
        } catch (error) {
            console.error("Error fetching property:", error);
            res.status(500).json({ message: "Failed to fetch property" });
        }
    });

    app.post("/api/properties", requireApprovedUser, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (user?.role !== "property_owner" && user?.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Insufficient permissions" });
            }

            const propertyData = {
                ...req.body,
                ownerId: userId,
            };

            const property = await storage.createProperty(propertyData);
            res.status(201).json(property);
        } catch (error) {
            console.error("Error creating property:", error);
            res.status(500).json({ message: "Failed to create property" });
        }
    });

    app.put("/api/properties/:id", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);
            const property = await storage.getProperty(req.params.id);

            if (!property) {
                return res.status(404).json({ message: "Property not found" });
            }

            if (property.ownerId !== userId && user?.role !== "admin") {
                return res.status(403).json({ message: "Insufficient permissions" });
            }

            const updatedProperty = await storage.updateProperty(req.params.id, req.body);
            res.json(updatedProperty);
        } catch (error) {
            console.error("Error updating property:", error);
            res.status(500).json({ message: "Failed to update property" });
        }
    });

    app.delete("/api/properties/:id", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);
            const property = await storage.getProperty(req.params.id);

            if (!property) {
                return res.status(404).json({ message: "Property not found" });
            }

            if (property.ownerId !== userId && user?.role !== "admin") {
                return res.status(403).json({ message: "Insufficient permissions" });
            }

            await storage.deleteProperty(req.params.id);
            res.json({ message: "Property deleted successfully" });
        } catch (error) {
            console.error("Error deleting property:", error);
            res.status(500).json({ message: "Failed to delete property" });
        }
    });

    app.patch("/api/properties/:id/toggle-active", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);
            const property = await storage.getProperty(req.params.id);

            if (!property) {
                return res.status(404).json({ message: "Property not found" });
            }

            if (property.ownerId !== userId && user?.role !== "admin") {
                return res.status(403).json({ message: "Insufficient permissions" });
            }

            const updatedProperty = await storage.updateProperty(req.params.id, {
                isActive: !property.isActive,
            });
            res.json(updatedProperty);
        } catch (error) {
            console.error("Error toggling property status:", error);
            res.status(500).json({ message: "Failed to toggle property status" });
        }
    });

    app.get("/api/properties/owner", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const properties = await storage.getPropertiesByOwner(userId);
            res.json(properties);
        } catch (error) {
            console.error("Error fetching owner properties:", error);
            res.status(500).json({ message: "Failed to fetch owner properties" });
        }
    });

    // Service routes
    app.get("/api/service-categories", async (req, res) => {
        try {
            const categories = await storage.getServiceCategories();
            res.json(categories);
        } catch (error) {
            console.error("Error fetching service categories:", error);
            res.status(500).json({
                message: "Failed to fetch service categories",
            });
        }
    });

    app.get("/api/service-providers", async (req, res) => {
        try {
            const { categoryId, location } = req.query;
            const providers = await storage.getServiceProviders(
                categoryId as string,
                location as string
            );
            res.json(providers);
        } catch (error) {
            console.error("Error fetching service providers:", error);
            res.status(500).json({
                message: "Failed to fetch service providers",
            });
        }
    });

    app.get("/api/service-providers/:id", async (req, res) => {
        try {
            const provider = await storage.getServiceProvider(req.params.id);
            if (!provider) {
                return res
                    .status(404)
                    .json({ message: "Service provider not found" });
            }
            res.json(provider);
        } catch (error) {
            console.error("Error fetching service provider:", error);
            res.status(500).json({
                message: "Failed to fetch service provider",
            });
        }
    });

    app.post("/api/service-providers", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (user?.role !== "service_provider" && user?.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Insufficient permissions" });
            }

            const providerData = {
                ...req.body,
                userId,
                approvalStatus: "pending",
            };

            const provider = await storage.createServiceProvider(providerData);
            
            res.status(201).json({
                message: "Service application submitted! A city or country manager will review it soon.",
                provider,
                requiresApproval: true
            });
        } catch (error) {
            console.error("Error creating service provider:", error);
            res.status(500).json({
                message: "Failed to create service provider",
            });
        }
    });

    // Provider Configuration Routes
    app.get("/api/provider/profile", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const provider = await storage.getServiceProviderByUserId(userId);
            if (!provider) {
                return res
                    .status(404)
                    .json({ message: "Provider profile not found" });
            }
            res.json(provider);
        } catch (error) {
            console.error("Error fetching provider profile:", error);
            res.status(500).json({
                message: "Failed to fetch provider profile",
            });
        }
    });

    app.patch("/api/provider/profile", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const provider = await storage.getServiceProviderByUserId(userId);
            if (!provider) {
                return res
                    .status(404)
                    .json({ message: "Provider profile not found" });
            }

            // Handle video deletion if videoUrl is being set to null
            if (req.body.videoUrl === null && provider.videoUrl) {
                try {
                    const publicPaths = process.env.PUBLIC_OBJECT_SEARCH_PATHS;
                    const publicDir = publicPaths ? publicPaths.split(',')[0] : '/tmp/public-videos';
                    const oldFilename = path.basename(provider.videoUrl);
                    if (oldFilename.startsWith('provider-video-')) {
                        const oldFilepath = path.join(publicDir, oldFilename);
                        await fs.unlink(oldFilepath).catch(() => {});
                    }
                } catch (error) {
                    console.error("Error deleting video file:", error);
                }
            }

            // Only allow updating specific fields, not userId, categoryId, approvalStatus
            const allowedUpdates: Record<string, any> = {
                businessName: req.body.businessName,
                description: req.body.description,
                location: req.body.location,
                whatsappNumber: req.body.whatsappNumber,
                hourlyRate: req.body.hourlyRate,
                fixedRate: req.body.fixedRate,
                videoUrl: req.body.videoUrl,
                yearsExperience: req.body.yearsExperience,
                languages: req.body.languages,
                certifications: req.body.certifications,
                awards: req.body.awards,
            };

            // Remove undefined fields
            Object.keys(allowedUpdates).forEach(
                (key) =>
                    allowedUpdates[key] === undefined &&
                    delete allowedUpdates[key]
            );

            const updated = await storage.updateServiceProvider(
                provider.id,
                allowedUpdates
            );
            res.json(updated);
        } catch (error) {
            console.error("Error updating provider profile:", error);
            res.status(500).json({
                message: "Failed to update provider profile",
            });
        }
    });

    // Video upload endpoint
    const allowedVideoExtensions = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v'];
    const upload = multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
        fileFilter: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            if (!allowedVideoExtensions.includes(ext)) {
                return cb(new Error('Only video files are allowed (mp4, mov, webm, avi, mkv, m4v)'));
            }
            if (!file.mimetype.startsWith('video/')) {
                return cb(new Error('Invalid file type'));
            }
            cb(null, true);
        },
    });

    app.post("/api/provider/upload-video", requireAuth, upload.single('video'), async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const provider = await storage.getServiceProviderByUserId(userId);
            
            if (!provider) {
                return res.status(404).json({ message: "Provider profile not found" });
            }

            if (!req.file) {
                return res.status(400).json({ message: "No video file uploaded" });
            }

            // Security: Validate actual file content using magic bytes
            const fileType = await fileTypeFromBuffer(req.file.buffer);
            const allowedMimeTypes = [
                'video/mp4',
                'video/quicktime',
                'video/webm',
                'video/x-msvideo',
                'video/x-matroska',
                'video/x-m4v'
            ];
            
            if (!fileType || !allowedMimeTypes.includes(fileType.mime)) {
                return res.status(400).json({ 
                    message: "Invalid file type. Only video files are allowed." 
                });
            }

            // Use public object storage for introduction videos (they're meant to be viewed by potential clients)
            const publicPaths = process.env.PUBLIC_OBJECT_SEARCH_PATHS;
            const publicDir = publicPaths ? publicPaths.split(',')[0] : '/tmp/public-videos';
            await fs.mkdir(publicDir, { recursive: true });
            
            // Delete old video if it exists
            if (provider.videoUrl) {
                try {
                    const oldFilename = path.basename(provider.videoUrl);
                    if (oldFilename.startsWith('provider-video-')) {
                        const oldFilepath = path.join(publicDir, oldFilename);
                        await fs.unlink(oldFilepath).catch(() => {});
                    }
                } catch (error) {
                    console.error("Error deleting old video:", error);
                }
            }
            
            const filename = `provider-video-${provider.id}-${Date.now()}${path.extname(req.file.originalname)}`;
            const filepath = path.join(publicDir, filename);
            
            await fs.writeFile(filepath, req.file.buffer);
            
            // Return a URL that can be accessed via the static serving route
            const videoUrl = `/videos/${filename}`;
            
            res.json({ videoUrl });
        } catch (error) {
            console.error("Error uploading video:", error);
            res.status(500).json({ message: "Failed to upload video" });
        }
    });

    // Serve uploaded videos
    app.get("/videos/:filename", async (req, res) => {
        try {
            const publicPaths = process.env.PUBLIC_OBJECT_SEARCH_PATHS;
            const publicDir = publicPaths ? publicPaths.split(',')[0] : '/tmp/public-videos';
            
            // Security: Use basename to prevent path traversal attacks
            const safeFilename = path.basename(req.params.filename);
            
            // Only allow files with expected prefix
            if (!safeFilename.startsWith('provider-video-')) {
                return res.status(404).json({ message: "Video not found" });
            }
            
            // Security: Validate file extension to prevent XSS
            const ext = path.extname(safeFilename).toLowerCase();
            const allowedExts = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v'];
            if (!allowedExts.includes(ext)) {
                return res.status(403).json({ message: "Access denied" });
            }
            
            const filepath = path.join(publicDir, safeFilename);
            
            // Verify the resolved path is still within the public directory
            const resolvedPath = path.resolve(filepath);
            const resolvedPublicDir = path.resolve(publicDir);
            if (!resolvedPath.startsWith(resolvedPublicDir)) {
                return res.status(403).json({ message: "Access denied" });
            }
            
            // Check if file exists
            try {
                await fs.access(filepath);
            } catch {
                return res.status(404).json({ message: "Video not found" });
            }
            
            // Set proper Content-Type header to prevent browsers from executing files
            const mimeTypes: Record<string, string> = {
                '.mp4': 'video/mp4',
                '.mov': 'video/quicktime',
                '.webm': 'video/webm',
                '.avi': 'video/x-msvideo',
                '.mkv': 'video/x-matroska',
                '.m4v': 'video/x-m4v'
            };
            
            res.setHeader('Content-Type', mimeTypes[ext] || 'video/mp4');
            res.setHeader('X-Content-Type-Options', 'nosniff');
            
            // Serve the video file
            res.sendFile(filepath);
        } catch (error) {
            console.error("Error serving video:", error);
            res.status(500).json({ message: "Failed to serve video" });
        }
    });

    // Image upload endpoint
    const allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const imageUpload = multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per image
        fileFilter: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            if (!allowedImageExtensions.includes(ext)) {
                return cb(new Error('Only image files are allowed (jpg, jpeg, png, webp, gif)'));
            }
            if (!file.mimetype.startsWith('image/')) {
                return cb(new Error('Invalid file type'));
            }
            cb(null, true);
        },
    });

    // Upload portfolio images (multiple)
    app.post("/api/provider/upload-portfolio", requireAuth, imageUpload.array('images', 10), async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const provider = await storage.getServiceProviderByUserId(userId);
            
            if (!provider) {
                return res.status(404).json({ message: "Provider profile not found" });
            }

            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ message: "No image files uploaded" });
            }

            // Security: Validate actual file content using magic bytes
            const allowedMimeTypes = [
                'image/jpeg',
                'image/png',
                'image/webp',
                'image/gif'
            ];

            // Use local filesystem for image storage
            const publicDir = path.join(process.cwd(), 'public', 'images');
            await fs.mkdir(publicDir, { recursive: true });

            const uploadedUrls: string[] = [];
            const rejectedFiles: string[] = [];

            for (const file of req.files) {
                // Validate file type
                const fileType = await fileTypeFromBuffer(file.buffer);
                if (!fileType || !allowedMimeTypes.includes(fileType.mime)) {
                    rejectedFiles.push(file.originalname);
                    continue; // Skip invalid files
                }

                const filename = `provider-portfolio-${provider.id}-${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
                const filepath = path.join(publicDir, filename);
                
                await fs.writeFile(filepath, file.buffer);
                uploadedUrls.push(`/images/${filename}`);
            }

            // If no files were uploaded successfully, return error
            if (uploadedUrls.length === 0) {
                return res.status(400).json({ 
                    message: "No valid image files were uploaded. All files failed validation.",
                    rejectedFiles
                });
            }

            // Update provider's photoUrls array
            const currentPhotoUrls = Array.isArray(provider.photoUrls) ? provider.photoUrls : [];
            const updatedPhotoUrls = [...currentPhotoUrls, ...uploadedUrls];

            await storage.updateServiceProvider(provider.id, {
                photoUrls: updatedPhotoUrls
            });

            res.json({ 
                imageUrls: uploadedUrls, 
                allImageUrls: updatedPhotoUrls,
                rejectedFiles: rejectedFiles.length > 0 ? rejectedFiles : undefined
            });
        } catch (error) {
            console.error("Error uploading portfolio images:", error);
            res.status(500).json({ message: "Failed to upload portfolio images" });
        }
    });

    // Upload profile photo (single)
    app.post("/api/provider/upload-profile-photo", requireAuth, imageUpload.single('image'), async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const provider = await storage.getServiceProviderByUserId(userId);
            
            if (!provider) {
                return res.status(404).json({ message: "Provider profile not found" });
            }

            if (!req.file) {
                return res.status(400).json({ message: "No image file uploaded" });
            }

            // Security: Validate actual file content using magic bytes
            const fileType = await fileTypeFromBuffer(req.file.buffer);
            const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            
            if (!fileType || !allowedMimeTypes.includes(fileType.mime)) {
                return res.status(400).json({ 
                    message: "Invalid file type. Only image files are allowed." 
                });
            }

            // Use local filesystem for image storage
            const publicDir = path.join(process.cwd(), 'public', 'images');
            await fs.mkdir(publicDir, { recursive: true });
            
            // Delete old profile photo if it exists
            if (provider.profilePhotoUrl) {
                await deleteImageFile(provider.profilePhotoUrl);
            }
            
            const filename = `provider-profile-${provider.id}-${Date.now()}${path.extname(req.file.originalname)}`;
            const filepath = path.join(publicDir, filename);
            
            await fs.writeFile(filepath, req.file.buffer);
            
            const photoUrl = `/images/${filename}`;
            
            // Update provider's profilePhotoUrl
            await storage.updateServiceProvider(provider.id, {
                profilePhotoUrl: photoUrl
            });
            
            res.json({ photoUrl });
        } catch (error) {
            console.error("Error uploading profile photo:", error);
            res.status(500).json({ message: "Failed to upload profile photo" });
        }
    });

    // Delete portfolio image
    app.delete("/api/provider/portfolio-image", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const provider = await storage.getServiceProviderByUserId(userId);
            
            if (!provider) {
                return res.status(404).json({ message: "Provider profile not found" });
            }

            const { imageUrl } = req.body;
            if (!imageUrl) {
                return res.status(400).json({ message: "Image URL is required" });
            }

            const currentPhotoUrls = Array.isArray(provider.photoUrls) ? provider.photoUrls : [];
            
            // Remove the image URL from the array
            const updatedPhotoUrls = currentPhotoUrls.filter((url: string) => url !== imageUrl);

            // Delete the physical file from filesystem
            await deleteImageFile(imageUrl);

            // Update database
            await storage.updateServiceProvider(provider.id, {
                photoUrls: updatedPhotoUrls
            });

            res.json({ message: "Image deleted successfully", photoUrls: updatedPhotoUrls });
        } catch (error) {
            console.error("Error deleting portfolio image:", error);
            res.status(500).json({ message: "Failed to delete portfolio image" });
        }
    });

    // Delete service provider and all associated data
    app.delete("/api/provider/profile", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const provider = await storage.getServiceProviderByUserId(userId);
            
            if (!provider) {
                return res.status(404).json({ message: "Provider profile not found" });
            }

            // Delete all associated images
            const imagesToDelete: string[] = [];
            
            // Add profile photo
            if (provider.profilePhotoUrl) {
                imagesToDelete.push(provider.profilePhotoUrl);
            }
            
            // Add portfolio images
            if (Array.isArray(provider.photoUrls)) {
                imagesToDelete.push(...provider.photoUrls);
            }
            
            // Delete all images from filesystem
            await deleteImageFiles(imagesToDelete);
            
            // Delete video if exists
            if (provider.videoUrl) {
                try {
                    const filename = path.basename(provider.videoUrl);
                    if (filename.startsWith('provider-video-')) {
                        const publicDir = path.join(process.cwd(), 'public', 'videos');
                        const filepath = path.join(publicDir, filename);
                        await fs.unlink(filepath).catch(() => {});
                    }
                } catch (error) {
                    console.error("Error deleting video file:", error);
                }
            }
            
            // Delete the service provider from database
            await storage.deleteServiceProvider(provider.id);
            
            res.json({ message: "Service provider profile and all associated data deleted successfully" });
        } catch (error) {
            console.error("Error deleting service provider:", error);
            res.status(500).json({ message: "Failed to delete service provider profile" });
        }
    });

    // Provider Menus
    app.get(
        "/api/provider/menus/:providerId",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const provider = await storage.getServiceProviderByUserId(
                    userId
                );
                if (!provider) {
                    return res.status(403).json({
                        message: "Not authorized as a service provider",
                    });
                }

                // Verify ownership
                if (provider.id !== req.params.providerId) {
                    return res.status(403).json({
                        message:
                            "Not authorized to access this provider's menus",
                    });
                }

                const menus = await storage.getProviderMenus(
                    req.params.providerId
                );
                const menusWithItems = await Promise.all(
                    menus.map(async (menu) => {
                        const items = await storage.getMenuItems(menu.id);
                        return { ...menu, items };
                    })
                );
                res.json(menusWithItems);
            } catch (error) {
                console.error("Error fetching provider menus:", error);
                res.status(500).json({ message: "Failed to fetch menus" });
            }
        }
    );

    app.post("/api/provider/menus", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const provider = await storage.getServiceProviderByUserId(userId);
            if (!provider) {
                return res
                    .status(403)
                    .json({ message: "Not authorized as a service provider" });
            }

            // Ensure menu is created for the authenticated provider
            const menuData = {
                serviceProviderId: provider.id,
                categoryName: req.body.categoryName,
                description: req.body.description,
            };

            const menu = await storage.createProviderMenu(menuData);
            res.status(201).json(menu);
        } catch (error) {
            console.error("Error creating menu:", error);
            res.status(500).json({ message: "Failed to create menu" });
        }
    });

    app.patch("/api/provider/menus/:id", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const provider = await storage.getServiceProviderByUserId(userId);
            if (!provider) {
                return res
                    .status(403)
                    .json({ message: "Not authorized as a service provider" });
            }

            // Verify ownership by fetching the menu
            const menus = await storage.getProviderMenus(provider.id);
            const menu = menus.find((m) => m.id === req.params.id);
            if (!menu) {
                return res
                    .status(404)
                    .json({ message: "Menu not found or not authorized" });
            }

            const allowedUpdates: Record<string, any> = {
                categoryName: req.body.categoryName,
                description: req.body.description,
            };

            Object.keys(allowedUpdates).forEach(
                (key) =>
                    allowedUpdates[key] === undefined &&
                    delete allowedUpdates[key]
            );

            const updated = await storage.updateProviderMenu(
                req.params.id,
                allowedUpdates
            );
            res.json(updated);
        } catch (error) {
            console.error("Error updating menu:", error);
            res.status(500).json({ message: "Failed to update menu" });
        }
    });

    app.delete(
        "/api/provider/menus/:id",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const provider = await storage.getServiceProviderByUserId(
                    userId
                );
                if (!provider) {
                    return res.status(403).json({
                        message: "Not authorized as a service provider",
                    });
                }

                // Verify ownership
                const menus = await storage.getProviderMenus(provider.id);
                const menu = menus.find((m) => m.id === req.params.id);
                if (!menu) {
                    return res
                        .status(404)
                        .json({ message: "Menu not found or not authorized" });
                }

                await storage.deleteProviderMenu(req.params.id);
                res.status(204).send();
            } catch (error) {
                console.error("Error deleting menu:", error);
                res.status(500).json({ message: "Failed to delete menu" });
            }
        }
    );

    // Menu Items
    app.post("/api/provider/menu-items", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const provider = await storage.getServiceProviderByUserId(userId);
            if (!provider) {
                return res
                    .status(403)
                    .json({ message: "Not authorized as a service provider" });
            }

            // Verify the menu belongs to this provider
            const menus = await storage.getProviderMenus(provider.id);
            const menu = menus.find((m) => m.id === req.body.menuId);
            if (!menu) {
                return res.status(403).json({
                    message: "Not authorized to add items to this menu",
                });
            }

            const itemData = {
                menuId: req.body.menuId,
                dishName: req.body.dishName,
                description: req.body.description,
                price: req.body.price,
                ingredients: req.body.ingredients,
                dietaryTags: req.body.dietaryTags,
                photoUrl: req.body.photoUrl,
            };

            const item = await storage.createMenuItem(itemData);
            res.status(201).json(item);
        } catch (error) {
            console.error("Error creating menu item:", error);
            res.status(500).json({ message: "Failed to create menu item" });
        }
    });

    app.patch(
        "/api/provider/menu-items/:id",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const provider = await storage.getServiceProviderByUserId(
                    userId
                );
                if (!provider) {
                    return res.status(403).json({
                        message: "Not authorized as a service provider",
                    });
                }

                // Verify ownership through menu
                const menus = await storage.getProviderMenus(provider.id);
                let authorized = false;
                for (const menu of menus) {
                    const items = await storage.getMenuItems(menu.id);
                    if (items.find((item) => item.id === req.params.id)) {
                        authorized = true;
                        break;
                    }
                }

                if (!authorized) {
                    return res.status(404).json({
                        message: "Menu item not found or not authorized",
                    });
                }

                const allowedUpdates: Record<string, any> = {
                    dishName: req.body.dishName,
                    description: req.body.description,
                    price: req.body.price,
                    ingredients: req.body.ingredients,
                    dietaryTags: req.body.dietaryTags,
                    photoUrl: req.body.photoUrl,
                };

                Object.keys(allowedUpdates).forEach(
                    (key) =>
                        allowedUpdates[key] === undefined &&
                        delete allowedUpdates[key]
                );

                const updated = await storage.updateMenuItem(
                    req.params.id,
                    allowedUpdates
                );
                res.json(updated);
            } catch (error) {
                console.error("Error updating menu item:", error);
                res.status(500).json({ message: "Failed to update menu item" });
            }
        }
    );

    app.delete(
        "/api/provider/menu-items/:id",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const provider = await storage.getServiceProviderByUserId(
                    userId
                );
                if (!provider) {
                    return res.status(403).json({
                        message: "Not authorized as a service provider",
                    });
                }

                // Verify ownership
                const menus = await storage.getProviderMenus(provider.id);
                let authorized = false;
                for (const menu of menus) {
                    const items = await storage.getMenuItems(menu.id);
                    if (items.find((item) => item.id === req.params.id)) {
                        authorized = true;
                        break;
                    }
                }

                if (!authorized) {
                    return res.status(404).json({
                        message: "Menu item not found or not authorized",
                    });
                }

                await storage.deleteMenuItem(req.params.id);
                res.status(204).send();
            } catch (error) {
                console.error("Error deleting menu item:", error);
                res.status(500).json({ message: "Failed to delete menu item" });
            }
        }
    );

    // Provider Task Configs
    app.get(
        "/api/provider/tasks/:providerId",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const provider = await storage.getServiceProviderByUserId(
                    userId
                );
                if (!provider) {
                    return res.status(403).json({
                        message: "Not authorized as a service provider",
                    });
                }

                // Verify ownership
                if (provider.id !== req.params.providerId) {
                    return res.status(403).json({
                        message:
                            "Not authorized to access this provider's task configs",
                    });
                }

                const configs = await storage.getProviderTaskConfigs(
                    req.params.providerId
                );
                res.json(configs);
            } catch (error) {
                console.error("Error fetching task configs:", error);
                res.status(500).json({
                    message: "Failed to fetch task configs",
                });
            }
        }
    );

    app.post("/api/provider/tasks", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const provider = await storage.getServiceProviderByUserId(userId);
            if (!provider) {
                return res
                    .status(403)
                    .json({ message: "Not authorized as a service provider" });
            }

            // Ensure task config is created for the authenticated provider
            const configData = {
                serviceProviderId: provider.id,
                taskId: req.body.taskId,
                isEnabled: req.body.isEnabled,
                customPrice: req.body.customPrice,
            };

            const config = await storage.upsertProviderTaskConfig(configData);
            res.json(config);
        } catch (error) {
            console.error("Error upserting task config:", error);
            res.status(500).json({ message: "Failed to update task config" });
        }
    });

    // Service Tasks
    app.get("/api/service-tasks/:categoryId", async (req, res) => {
        try {
            const tasks = await storage.getServiceTasks(req.params.categoryId);
            res.json(tasks);
        } catch (error) {
            console.error("Error fetching service tasks:", error);
            res.status(500).json({ message: "Failed to fetch service tasks" });
        }
    });

    // Provider Materials
    app.get(
        "/api/provider/materials/:providerId",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const provider = await storage.getServiceProviderByUserId(
                    userId
                );
                if (!provider) {
                    return res.status(403).json({
                        message: "Not authorized as a service provider",
                    });
                }

                // Verify ownership
                if (provider.id !== req.params.providerId) {
                    return res.status(403).json({
                        message:
                            "Not authorized to access this provider's materials",
                    });
                }

                const materials = await storage.getProviderMaterials(
                    req.params.providerId
                );
                res.json(materials);
            } catch (error) {
                console.error("Error fetching materials:", error);
                res.status(500).json({ message: "Failed to fetch materials" });
            }
        }
    );

    app.post("/api/provider/materials", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const provider = await storage.getServiceProviderByUserId(userId);
            if (!provider) {
                return res
                    .status(403)
                    .json({ message: "Not authorized as a service provider" });
            }

            // Ensure material is created for the authenticated provider
            const materialData = {
                serviceProviderId: provider.id,
                materialName: req.body.materialName,
                materialType: req.body.materialType || "other",
                description: req.body.description,
                unitPrice: req.body.unitPrice,
                isProvidedByProvider: req.body.isProvidedByProvider,
            };

            const material = await storage.createProviderMaterial(materialData);
            res.status(201).json(material);
        } catch (error) {
            console.error("Error creating material:", error);
            res.status(500).json({ message: "Failed to create material" });
        }
    });

    app.patch(
        "/api/provider/materials/:id",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const provider = await storage.getServiceProviderByUserId(
                    userId
                );
                if (!provider) {
                    return res.status(403).json({
                        message: "Not authorized as a service provider",
                    });
                }

                // Verify ownership
                const materials = await storage.getProviderMaterials(
                    provider.id
                );
                const material = materials.find((m) => m.id === req.params.id);
                if (!material) {
                    return res.status(404).json({
                        message: "Material not found or not authorized",
                    });
                }

                const allowedUpdates: Record<string, any> = {
                    materialName: req.body.materialName,
                    description: req.body.description,
                    unitPrice: req.body.unitPrice,
                    isProvidedByProvider: req.body.isProvidedByProvider,
                };

                Object.keys(allowedUpdates).forEach(
                    (key) =>
                        allowedUpdates[key] === undefined &&
                        delete allowedUpdates[key]
                );

                const updated = await storage.updateProviderMaterial(
                    req.params.id,
                    allowedUpdates
                );
                res.json(updated);
            } catch (error) {
                console.error("Error updating material:", error);
                res.status(500).json({ message: "Failed to update material" });
            }
        }
    );

    app.delete(
        "/api/provider/materials/:id",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const provider = await storage.getServiceProviderByUserId(
                    userId
                );
                if (!provider) {
                    return res.status(403).json({
                        message: "Not authorized as a service provider",
                    });
                }

                // Verify ownership
                const materials = await storage.getProviderMaterials(
                    provider.id
                );
                const material = materials.find((m) => m.id === req.params.id);
                if (!material) {
                    return res.status(404).json({
                        message: "Material not found or not authorized",
                    });
                }

                await storage.deleteProviderMaterial(req.params.id);
                res.status(204).send();
            } catch (error) {
                console.error("Error deleting material:", error);
                res.status(500).json({ message: "Failed to delete material" });
            }
        }
    );

    // Public Provider Info routes (for clients to browse)
    app.get("/api/public/provider/:providerId/menus", async (req, res) => {
        try {
            const menus = await storage.getProviderMenus(req.params.providerId);
            const menusWithItems = await Promise.all(
                menus.map(async (menu) => {
                    const items = await storage.getMenuItems(menu.id);
                    return { ...menu, items };
                })
            );
            res.json(menusWithItems);
        } catch (error) {
            console.error("Error fetching provider menus:", error);
            res.status(500).json({ message: "Failed to fetch menus" });
        }
    });

    app.get("/api/public/provider/:providerId/tasks", async (req, res) => {
        try {
            const configs = await storage.getProviderTaskConfigs(
                req.params.providerId
            );

            // Get full task details for enabled tasks
            if (configs.length > 0) {
                const provider = await storage.getServiceProvider(
                    req.params.providerId
                );
                if (!provider) {
                    return res
                        .status(404)
                        .json({ message: "Provider not found" });
                }

                const allTasks = await storage.getServiceTasks(
                    provider.categoryId
                );
                const enabledTasks = allTasks
                    .filter((task) => {
                        const config = configs.find(
                            (c) => c.taskId === task.id
                        );
                        return config?.isEnabled;
                    })
                    .map((task) => {
                        const config = configs.find(
                            (c) => c.taskId === task.id
                        );
                        return {
                            ...task,
                            customPrice: config?.customPrice,
                            effectivePrice: config?.customPrice || "0",
                        };
                    });

                res.json(enabledTasks);
            } else {
                res.json([]);
            }
        } catch (error) {
            console.error("Error fetching provider tasks:", error);
            res.status(500).json({ message: "Failed to fetch tasks" });
        }
    });

    // Get provider service packages (for concierge, transport, etc.)
    app.get("/api/public/provider/:providerId/packages", async (req, res) => {
        try {
            const packages = await storage.getProviderPackages(req.params.providerId);
            res.json(packages);
        } catch (error) {
            console.error("Error fetching provider packages:", error);
            res.status(500).json({ message: "Failed to fetch packages" });
        }
    });

    app.get("/api/public/provider/:providerId/materials", async (req, res) => {
        try {
            const materials = await storage.getProviderMaterials(
                req.params.providerId
            );

            // Transform to match frontend expectations
            const formattedMaterials = materials.map((material) => ({
                id: material.id,
                name: material.materialName,
                category: material.materialType,
                unitCost: material.additionalCost || "0",
                unit: "item", // Default unit since not in schema
                isClientProvided:
                    material.providedBy === "client" ||
                    material.providedBy === "either",
            }));

            res.json(formattedMaterials);
        } catch (error) {
            console.error("Error fetching provider materials:", error);
            res.status(500).json({ message: "Failed to fetch materials" });
        }
    });

    app.get("/api/service-providers/:providerId/reviews", async (req, res) => {
        try {
            const reviews = await storage.getServiceProviderReviews(
                req.params.providerId
            );

            // Format reviews with client names
            const formattedReviews = await Promise.all(
                reviews.map(async (review) => {
                    const reviewer = await storage.getUser(review.reviewerId);
                    const clientName = reviewer
                        ? `${reviewer.firstName || ""} ${
                              reviewer.lastName || ""
                          }`.trim() || "Anonymous"
                        : "Anonymous";
                    return {
                        id: review.id,
                        clientName,
                        rating: review.rating,
                        comment: review.comment || "",
                        createdAt: review.createdAt,
                    };
                })
            );

            res.json(formattedReviews);
        } catch (error) {
            console.error("Error fetching provider reviews:", error);
            res.status(500).json({ message: "Failed to fetch reviews" });
        }
    });

    // Service Order routes
    app.post("/api/service-orders", requireApprovedUser, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const {
                serviceProviderId,
                serviceDate,
                startTime,
                endTime,
                duration,
                items,
                specialInstructions,
                bookingId,
            } = req.body;

            if (
                !serviceProviderId ||
                !serviceDate ||
                !startTime ||
                !items ||
                items.length === 0
            ) {
                return res
                    .status(400)
                    .json({ message: "Missing required fields" });
            }

            // Verify provider exists
            const provider = await storage.getServiceProvider(
                serviceProviderId
            );
            if (!provider) {
                return res
                    .status(404)
                    .json({ message: "Service provider not found" });
            }

            // Validate and recalculate prices from authoritative sources
            const validatedItems = [];
            let subtotal = 0;

            for (const item of items) {
                if (item.itemType === "menu_item" && item.menuItemId) {
                    // Fetch menu item from database
                    const menus = await storage.getProviderMenus(
                        serviceProviderId
                    );
                    let menuItem = null;

                    for (const menu of menus) {
                        const items = await storage.getMenuItems(menu.id);
                        menuItem = items.find((i) => i.id === item.menuItemId);
                        if (menuItem) break;
                    }

                    if (!menuItem) {
                        return res.status(400).json({
                            message: `Menu item ${item.menuItemId} not found for this provider`,
                        });
                    }

                    const price = parseFloat(menuItem.price || "0");
                    validatedItems.push({
                        itemType: "menu_item",
                        menuItemId: menuItem.id,
                        taskId: null,
                        itemName: menuItem.dishName,
                        quantity: item.quantity || 1,
                        unitPrice: price.toString(),
                        totalPrice: (price * (item.quantity || 1)).toString(),
                    });
                    subtotal += price * (item.quantity || 1);
                } else if (item.itemType === "task" && item.taskId) {
                    // Fetch task config
                    const configs = await storage.getProviderTaskConfigs(
                        serviceProviderId
                    );
                    const config = configs.find(
                        (c) => c.taskId === item.taskId && c.isEnabled
                    );

                    if (!config) {
                        return res.status(400).json({
                            message: `Task ${item.taskId} not available for this provider`,
                        });
                    }

                    // Get task details
                    const allTasks = await storage.getServiceTasks(
                        provider.categoryId
                    );
                    const task = allTasks.find((t) => t.id === item.taskId);

                    if (!task) {
                        return res
                            .status(400)
                            .json({ message: `Task ${item.taskId} not found` });
                    }

                    const price = parseFloat(config.customPrice || "0");
                    validatedItems.push({
                        itemType: "task",
                        menuItemId: null,
                        taskId: task.id,
                        itemName: task.taskName,
                        quantity: 1,
                        unitPrice: price.toString(),
                        totalPrice: price.toString(),
                    });
                    subtotal += price;
                } else {
                    return res
                        .status(400)
                        .json({ message: "Invalid item type or missing IDs" });
                }
            }

            const taxAmount = subtotal * 0.1; // 10% tax
            const totalAmount = subtotal + taxAmount;

            // Fetch platform commission rate from settings
            const commissionSetting = await db
                .select()
                .from(platformSettings)
                .where(eq(platformSettings.settingKey, 'service_commission_rate'))
                .limit(1);
            
            const commissionRate = commissionSetting.length > 0 
                ? parseFloat(commissionSetting[0].settingValue || "15.00")
                : 15.00; // Default to 15% if not found

            // Calculate commission amounts
            const platformFeeAmount = (totalAmount * commissionRate) / 100;
            const providerAmount = totalAmount - platformFeeAmount;

            const orderData = {
                clientId: userId,
                serviceProviderId,
                bookingId: bookingId || null,
                orderCode: generateBookingCode(),
                serviceDate,
                startTime,
                endTime: endTime || null,
                duration: duration || null,
                status: "pending_payment" as const, // Status will be updated to 'confirmed' after payment
                subtotal: subtotal.toString(),
                taxAmount: taxAmount.toString(),
                totalAmount: totalAmount.toString(),
                platformFeePercentage: commissionRate.toString(),
                platformFeeAmount: platformFeeAmount.toFixed(2),
                providerAmount: providerAmount.toFixed(2),
                paymentStatus: "pending" as const,
                specialInstructions: specialInstructions || null,
            };

            const order = await storage.createServiceOrder(
                orderData,
                validatedItems as any
            );

            // Send notification to client
            await storage.createNotification({
                userId: userId,
                type: 'order',
                title: 'Service Order Created',
                message: `Your ${provider.businessName} order has been created. Please complete payment to confirm.`,
                isRead: false
            });

            // Send notification to service provider
            await storage.createNotification({
                userId: provider.userId,
                type: 'order',
                title: 'New Service Order',
                message: `New order for ${new Date(serviceDate).toLocaleDateString()} at ${startTime}. Order code: ${orderData.orderCode}`,
                isRead: false
            });

            res.status(201).json(order);
        } catch (error) {
            console.error("Error creating service order:", error);
            res.status(500).json({ message: "Failed to create service order" });
        }
    });

    app.get(
        "/api/service-orders/client",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const orders = await storage.getClientServiceOrders(userId);
                res.json(orders);
            } catch (error) {
                console.error("Error fetching client service orders:", error);
                res.status(500).json({
                    message: "Failed to fetch service orders",
                });
            }
        }
    );

    app.get(
        "/api/service-orders/provider",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const provider = await storage.getServiceProviderByUserId(
                    userId
                );
                if (!provider) {
                    return res.status(403).json({
                        message: "Not authorized as a service provider",
                    });
                }

                const orders = await storage.getProviderServiceOrders(
                    provider.id
                );
                res.json(orders);
            } catch (error) {
                console.error("Error fetching provider service orders:", error);
                res.status(500).json({
                    message: "Failed to fetch service orders",
                });
            }
        }
    );

    app.get("/api/service-orders/:id", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const order = await storage.getServiceOrder(req.params.id);

            if (!order) {
                return res
                    .status(404)
                    .json({ message: "Service order not found" });
            }

            // Check authorization
            const provider = await storage.getServiceProviderByUserId(userId);
            if (
                order.clientId !== userId &&
                (!provider || order.serviceProviderId !== provider.id)
            ) {
                return res
                    .status(403)
                    .json({ message: "Not authorized to view this order" });
            }

            const items = await storage.getServiceOrderItems(order.id);
            res.json({ ...order, items });
        } catch (error) {
            console.error("Error fetching service order:", error);
            res.status(500).json({ message: "Failed to fetch service order" });
        }
    });

    app.patch(
        "/api/service-orders/:id/status",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const { status } = req.body;
                const order = await storage.getServiceOrder(req.params.id);

                if (!order) {
                    return res
                        .status(404)
                        .json({ message: "Service order not found" });
                }

                // Check authorization
                const provider = await storage.getServiceProviderByUserId(
                    userId
                );
                if (!provider || order.serviceProviderId !== provider.id) {
                    return res.status(403).json({
                        message: "Not authorized to update this order",
                    });
                }

                const updatedOrder = await storage.updateServiceOrderStatus(
                    req.params.id,
                    status
                );
                res.json(updatedOrder);
            } catch (error) {
                console.error("Error updating service order status:", error);
                res.status(500).json({
                    message: "Failed to update service order status",
                });
            }
        }
    );

    app.patch(
        "/api/service-order-items/:id",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const { isCompleted, notes } = req.body;

                // Verify provider owns this order item
                const item = await storage.updateServiceOrderItem(
                    req.params.id,
                    {
                        isCompleted:
                            isCompleted !== undefined ? isCompleted : undefined,
                        completedAt: isCompleted ? new Date() : undefined,
                        notes: notes !== undefined ? notes : undefined,
                    }
                );

                res.json(item);
            } catch (error) {
                console.error("Error updating service order item:", error);
                res.status(500).json({
                    message: "Failed to update service order item",
                });
            }
        }
    );

    // Service Order Payment routes
    app.post(
        "/api/service-orders/:id/payment-intent",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const order = await storage.getServiceOrder(req.params.id);

                if (!order) {
                    return res
                        .status(404)
                        .json({ message: "Service order not found" });
                }

                // Verify the user is the client who created the order
                if (order.clientId !== userId) {
                    return res.status(403).json({
                        message: "Not authorized to pay for this order",
                    });
                }

                // Only allow payment if order is pending payment
                if (order.status !== "pending_payment") {
                    return res.status(400).json({
                        message: "Order must be in pending_payment status",
                    });
                }

                if (order.paymentStatus === "paid") {
                    return res
                        .status(400)
                        .json({ message: "Order has already been paid" });
                }

                // Create Stripe payment intent
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: Math.round(parseFloat(order.totalAmount) * 100), // Convert to cents
                    currency: "usd",
                    metadata: {
                        orderId: order.id,
                        orderCode: order.orderCode,
                    },
                });

                res.json({ clientSecret: paymentIntent.client_secret });
            } catch (error) {
                console.error("Error creating payment intent:", error);
                res.status(500).json({
                    message: "Failed to create payment intent",
                });
            }
        }
    );

    app.post(
        "/api/service-orders/:id/confirm-payment",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const { paymentIntentId } = req.body;
                const order = await storage.getServiceOrder(req.params.id);

                if (!order) {
                    return res
                        .status(404)
                        .json({ message: "Service order not found" });
                }

                // Verify the user is the client who created the order
                if (order.clientId !== userId) {
                    return res.status(403).json({ message: "Not authorized" });
                }

                // Verify payment with Stripe
                const paymentIntent = await stripe.paymentIntents.retrieve(
                    paymentIntentId
                );

                if (
                    paymentIntent.status === "succeeded" &&
                    paymentIntent.metadata.orderId === order.id
                ) {
                    // Update both payment status and order status in database
                    await storage.updateServiceOrderPaymentStatus(
                        order.id,
                        "paid"
                    );
                    await storage.updateServiceOrderStatus(
                        order.id,
                        "confirmed"
                    );

                    // Get service provider details for notifications
                    const provider = await storage.getServiceProvider(order.serviceProviderId);

                    // Send payment success notification to client
                    await storage.createNotification({
                        userId: userId,
                        type: 'payment',
                        title: 'Payment Successful',
                        message: `Your payment of $${order.totalAmount} for ${provider?.businessName || 'service'} has been confirmed. Order code: ${order.orderCode}`,
                        isRead: false
                    });

                    // Send payment received notification to service provider
                    if (provider) {
                        await storage.createNotification({
                            userId: provider.userId,
                            type: 'payment',
                            title: 'Payment Received',
                            message: `Payment of $${order.totalAmount} received. Order code: ${order.orderCode}`,
                            isRead: false
                        });
                    }

                    res.json({ success: true, message: "Payment confirmed" });
                } else {
                    res.status(400).json({
                        message: "Payment verification failed",
                    });
                }
            } catch (error) {
                console.error("Error confirming payment:", error);
                res.status(500).json({ message: "Failed to confirm payment" });
            }
        }
    );

    // Provider accept service order
    app.put(
        "/api/service-orders/:id/accept",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const order = await storage.getServiceOrder(req.params.id);

                if (!order) {
                    return res
                        .status(404)
                        .json({ message: "Service order not found" });
                }

                // Verify provider owns this order
                const provider = await storage.getServiceProviderByUserId(userId);
                if (!provider || order.serviceProviderId !== provider.id) {
                    return res.status(403).json({
                        message: "Not authorized to accept this order",
                    });
                }

                // Only allow acceptance if order is confirmed (paid)
                if (order.status !== "confirmed") {
                    return res.status(400).json({
                        message: "Order must be confirmed (paid) before acceptance",
                    });
                }

                // Update order status to accepted and record timestamp
                await storage.updateServiceOrderStatus(req.params.id, "accepted");
                await db
                    .update(serviceOrders)
                    .set({ acceptedAt: new Date() })
                    .where(eq(serviceOrders.id, req.params.id));

                // Send notification to client
                const client = await storage.getUser(order.clientId);
                await storage.createNotification({
                    userId: order.clientId,
                    type: 'booking',
                    title: 'Service Booking Accepted',
                    message: `${provider.businessName} has accepted your service booking for ${format(new Date(order.serviceDate), 'MMM dd, yyyy')}. Order code: ${order.orderCode}`,
                    isRead: false
                });

                res.json({ 
                    success: true, 
                    message: "Service order accepted successfully" 
                });
            } catch (error) {
                console.error("Error accepting service order:", error);
                res.status(500).json({ message: "Failed to accept service order" });
            }
        }
    );

    // Provider reject service order
    app.put(
        "/api/service-orders/:id/reject",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const { rejectionReason } = req.body;
                const order = await storage.getServiceOrder(req.params.id);

                if (!order) {
                    return res
                        .status(404)
                        .json({ message: "Service order not found" });
                }

                // Verify provider owns this order
                const provider = await storage.getServiceProviderByUserId(userId);
                if (!provider || order.serviceProviderId !== provider.id) {
                    return res.status(403).json({
                        message: "Not authorized to reject this order",
                    });
                }

                // Only allow rejection if order is confirmed (paid) or pending acceptance
                if (order.status !== "confirmed" && order.status !== "pending_acceptance") {
                    return res.status(400).json({
                        message: "Order can only be rejected when confirmed or pending acceptance",
                    });
                }

                // Update order status to rejected and store reason
                await storage.updateServiceOrderStatus(req.params.id, "rejected");
                await db
                    .update(serviceOrders)
                    .set({ rejectionReason: rejectionReason || 'No reason provided' })
                    .where(eq(serviceOrders.id, req.params.id));

                // Process refund if payment was made
                if (order.paymentStatus === "paid" && order.paymentIntentId) {
                    try {
                        const refund = await stripe.refunds.create({
                            payment_intent: order.paymentIntentId,
                        });

                        // Update payment status and store refund ID
                        await storage.updateServiceOrderPaymentStatus(
                            req.params.id,
                            "refunded"
                        );
                        await db
                            .update(serviceOrders)
                            .set({ stripeRefundId: refund.id })
                            .where(eq(serviceOrders.id, req.params.id));
                    } catch (refundError) {
                        console.error("Error processing refund:", refundError);
                    }
                }

                // Send notification to client
                await storage.createNotification({
                    userId: order.clientId,
                    type: 'rejection',
                    title: 'Service Booking Rejected',
                    message: `${provider.businessName} has declined your service booking. Reason: ${rejectionReason || 'Not specified'}. ${order.paymentStatus === 'paid' ? 'A full refund has been processed.' : ''}`,
                    isRead: false
                });

                res.json({ 
                    success: true, 
                    message: "Service order rejected successfully",
                    refundProcessed: order.paymentStatus === "paid"
                });
            } catch (error) {
                console.error("Error rejecting service order:", error);
                res.status(500).json({ message: "Failed to reject service order" });
            }
        }
    );

    // Provider mark service order as complete
    app.put(
        "/api/service-orders/:id/complete",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const { providerNotes } = req.body;
                const order = await storage.getServiceOrder(req.params.id);

                if (!order) {
                    return res
                        .status(404)
                        .json({ message: "Service order not found" });
                }

                // Verify provider owns this order
                const provider = await storage.getServiceProviderByUserId(userId);
                if (!provider || order.serviceProviderId !== provider.id) {
                    return res.status(403).json({
                        message: "Not authorized to complete this order",
                    });
                }

                // Only allow completion if order is accepted or in progress
                if (order.status !== "accepted" && order.status !== "in_progress") {
                    return res.status(400).json({
                        message: "Order must be accepted or in progress to mark as complete",
                    });
                }

                // Update order status to completed
                await storage.updateServiceOrderStatus(req.params.id, "completed");
                
                // Record completion timestamp and notes
                await db
                    .update(serviceOrders)
                    .set({ 
                        completedAt: new Date(),
                        providerNotes: providerNotes || null
                    })
                    .where(eq(serviceOrders.id, req.params.id));

                // Send notification to client
                await storage.createNotification({
                    userId: order.clientId,
                    type: 'booking',
                    title: 'Service Completed',
                    message: `${provider.businessName} has marked your service as completed. Order code: ${order.orderCode}. Please leave a review!`,
                    isRead: false
                });

                res.json({ 
                    success: true, 
                    message: "Service order marked as complete" 
                });
            } catch (error) {
                console.error("Error completing service order:", error);
                res.status(500).json({ message: "Failed to complete service order" });
            }
        }
    );

    // Client cancel service order with refund
    app.post(
        "/api/service-orders/:id/cancel",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const { cancellationReason } = req.body;
                const order = await storage.getServiceOrder(req.params.id);

                if (!order) {
                    return res
                        .status(404)
                        .json({ message: "Service order not found" });
                }

                // Verify client owns this order
                if (order.clientId !== userId) {
                    return res.status(403).json({
                        message: "Not authorized to cancel this order",
                    });
                }

                // Only allow cancellation if order is confirmed but not yet accepted
                if (order.status !== "confirmed" && order.status !== "pending_acceptance") {
                    return res.status(400).json({
                        message: "Order can only be cancelled before provider acceptance",
                    });
                }

                // If already accepted, don't allow cancellation
                if (order.acceptedAt) {
                    return res.status(400).json({
                        message: "Cannot cancel order after provider has accepted it",
                    });
                }

                // Update order status to cancelled
                await storage.updateServiceOrderStatus(req.params.id, "cancelled");
                
                // Record cancellation details
                await db
                    .update(serviceOrders)
                    .set({ 
                        cancelledAt: new Date(),
                        cancellationReason: cancellationReason || 'Client cancellation'
                    })
                    .where(eq(serviceOrders.id, req.params.id));

                // Process refund if payment was made
                let refundProcessed = false;
                if (order.paymentStatus === "paid" && order.paymentIntentId) {
                    try {
                        const refund = await stripe.refunds.create({
                            payment_intent: order.paymentIntentId,
                        });

                        // Update payment status and store refund ID
                        await storage.updateServiceOrderPaymentStatus(
                            req.params.id,
                            "refunded"
                        );
                        await db
                            .update(serviceOrders)
                            .set({ stripeRefundId: refund.id })
                            .where(eq(serviceOrders.id, req.params.id));
                        refundProcessed = true;
                    } catch (refundError) {
                        console.error("Error processing refund:", refundError);
                    }
                }

                // Send notification to provider
                const provider = await storage.getServiceProvider(order.serviceProviderId);
                if (provider) {
                    await storage.createNotification({
                        userId: provider.userId,
                        type: 'cancellation',
                        title: 'Service Booking Cancelled',
                        message: `A client has cancelled their service booking. Order code: ${order.orderCode}`,
                        isRead: false
                    });
                }

                res.json({ 
                    success: true, 
                    message: "Service order cancelled successfully",
                    refundProcessed
                });
            } catch (error) {
                console.error("Error cancelling service order:", error);
                res.status(500).json({ message: "Failed to cancel service order" });
            }
        }
    );

    // Provider Availability routes
    app.get("/api/provider/availability/:providerId", async (req, res) => {
        try {
            const { startDate, endDate } = req.query;

            // If dates not provided, get availability for next 90 days
            const start =
                (startDate as string) || format(new Date(), "yyyy-MM-dd");
            const end =
                (endDate as string) ||
                format(
                    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                    "yyyy-MM-dd"
                );

            const availability = await storage.getProviderAvailability(
                req.params.providerId,
                start,
                end
            );
            res.json(availability);
        } catch (error) {
            console.error("Error fetching provider availability:", error);
            res.status(500).json({
                message: "Failed to fetch provider availability",
            });
        }
    });

    app.post(
        "/api/provider/availability",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const provider = await storage.getServiceProviderByUserId(
                    userId
                );
                if (!provider) {
                    return res.status(403).json({
                        message: "Not authorized as a service provider",
                    });
                }

                const availabilityData = {
                    ...req.body,
                    serviceProviderId: provider.id,
                };

                const availability = await storage.createProviderAvailability(
                    availabilityData
                );
                res.status(201).json(availability);
            } catch (error) {
                console.error("Error creating provider availability:", error);
                res.status(500).json({
                    message: "Failed to create provider availability",
                });
            }
        }
    );

    app.patch(
        "/api/provider/availability/:id",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const provider = await storage.getServiceProviderByUserId(
                    userId
                );
                if (!provider) {
                    return res.status(403).json({
                        message: "Not authorized as a service provider",
                    });
                }

                const availability = await storage.updateProviderAvailability(
                    req.params.id,
                    req.body
                );
                res.json(availability);
            } catch (error) {
                console.error("Error updating provider availability:", error);
                res.status(500).json({
                    message: "Failed to update provider availability",
                });
            }
        }
    );

    app.delete(
        "/api/provider/availability/:id",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const provider = await storage.getServiceProviderByUserId(
                    userId
                );
                if (!provider) {
                    return res.status(403).json({
                        message: "Not authorized as a service provider",
                    });
                }

                await storage.deleteProviderAvailability(req.params.id);
                res.status(204).send();
            } catch (error) {
                console.error("Error deleting provider availability:", error);
                res.status(500).json({
                    message: "Failed to delete provider availability",
                });
            }
        }
    );

    // Provider pricing routes
    app.get("/api/provider/pricing/:providerId", async (req, res) => {
        try {
            const pricing = await storage.getProviderPricing(
                req.params.providerId
            );
            res.json(pricing || {});
        } catch (error) {
            console.error("Error fetching provider pricing:", error);
            res.status(500).json({
                message: "Failed to fetch provider pricing",
            });
        }
    });

    app.put("/api/provider/pricing", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const provider = await storage.getServiceProviderByUserId(userId);
            if (!provider) {
                return res
                    .status(403)
                    .json({ message: "Not authorized as a service provider" });
            }

            const pricingData = {
                serviceProviderId: provider.id,
                ...req.body,
            };

            const pricing = await storage.upsertProviderPricing(pricingData);
            res.json(pricing);
        } catch (error) {
            console.error("Error updating provider pricing:", error);
            res.status(500).json({
                message: "Failed to update provider pricing",
            });
        }
    });

    // Property services routes
    app.get("/api/properties/:id/services", async (req, res) => {
        try {
            const services = await storage.getPropertyServices(req.params.id);
            res.json(services);
        } catch (error) {
            console.error("Error fetching property services:", error);
            res.status(500).json({
                message: "Failed to fetch property services",
            });
        }
    });

    app.post(
        "/api/admin/properties/:id/services",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const user = await storage.getUser(userId);

                if (user?.role !== "admin") {
                    return res
                        .status(403)
                        .json({ message: "Admin privileges required" });
                }

                const { serviceProviderId } = req.body;

                // Validate inputs
                if (!serviceProviderId) {
                    return res
                        .status(400)
                        .json({ message: "Service provider ID is required" });
                }

                // Check if property exists
                const property = await storage.getProperty(req.params.id);
                if (!property) {
                    return res
                        .status(404)
                        .json({ message: "Property not found" });
                }

                // Check if service provider exists
                const provider = await storage.getServiceProvider(
                    serviceProviderId
                );
                if (!provider) {
                    return res
                        .status(404)
                        .json({ message: "Service provider not found" });
                }

                // Check if link already exists
                const existingServices = await storage.getPropertyServices(
                    req.params.id
                );
                if (existingServices.some((s) => s.id === serviceProviderId)) {
                    return res.status(409).json({
                        message:
                            "Service provider already linked to this property",
                    });
                }

                const propertyService = await storage.addPropertyService(
                    req.params.id,
                    serviceProviderId
                );
                res.status(201).json(propertyService);
            } catch (error) {
                console.error("Error adding property service:", error);
                res.status(500).json({
                    message: "Failed to add property service",
                });
            }
        }
    );

    app.delete(
        "/api/admin/properties/:propertyId/services/:serviceProviderId",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const user = await storage.getUser(userId);

                if (user?.role !== "admin") {
                    return res
                        .status(403)
                        .json({ message: "Admin privileges required" });
                }

                // Check if property exists
                const property = await storage.getProperty(
                    req.params.propertyId
                );
                if (!property) {
                    return res
                        .status(404)
                        .json({ message: "Property not found" });
                }

                // Check if service provider exists
                const provider = await storage.getServiceProvider(
                    req.params.serviceProviderId
                );
                if (!provider) {
                    return res
                        .status(404)
                        .json({ message: "Service provider not found" });
                }

                // Check if link exists
                const existingServices = await storage.getPropertyServices(
                    req.params.propertyId
                );
                if (
                    !existingServices.some(
                        (s) => s.id === req.params.serviceProviderId
                    )
                ) {
                    return res.status(404).json({
                        message: "Service provider not linked to this property",
                    });
                }

                await storage.removePropertyService(
                    req.params.propertyId,
                    req.params.serviceProviderId
                );
                res.status(204).send();
            } catch (error) {
                console.error("Error removing property service:", error);
                res.status(500).json({
                    message: "Failed to remove property service",
                });
            }
        }
    );

    // Booking routes
    app.post("/api/bookings", requireApprovedUser, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const {
                propertyId,
                checkIn,
                checkOut,
                guests,
                services = [],
            } = req.body;

            // Calculate totals
            const property = await storage.getProperty(propertyId);
            if (!property) {
                return res.status(404).json({ message: "Property not found" });
            }

            const nights = Math.ceil(
                (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
                    (1000 * 60 * 60 * 24)
            );

            const propertyTotal = parseFloat(property.pricePerNight) * nights;
            let servicesTotal = 0;

            // Calculate service costs
            for (const service of services) {
                const provider = await storage.getServiceProvider(
                    service.serviceProviderId
                );
                if (provider) {
                    const rate = service.duration
                        ? parseFloat(provider.hourlyRate || "0") *
                          service.duration
                        : parseFloat(provider.fixedRate || "0");
                    servicesTotal += rate;
                }
            }

            // Calculate bundle discount (10% for 3+ services, 5% for 1-2 services)
            const discountRate =
                services.length >= 3 ? 0.1 : services.length > 0 ? 0.05 : 0;
            const discountAmount =
                (propertyTotal + servicesTotal) * discountRate;
            const totalAmount = propertyTotal + servicesTotal - discountAmount;

            const bookingData = {
                clientId: userId,
                propertyId,
                bookingCode: generateBookingCode(),
                checkIn: new Date(checkIn),
                checkOut: new Date(checkOut),
                guests,
                propertyTotal: propertyTotal.toString(),
                servicesTotal: servicesTotal.toString(),
                discountAmount: discountAmount.toString(),
                totalAmount: totalAmount.toString(),
                status: "pending_payment" as const, // Status will be updated to 'confirmed' after payment
                paymentStatus: "pending" as const,
            };

            const booking = await storage.createBooking(bookingData, services);

            // Send notification to client
            await storage.createNotification({
                userId: userId,
                type: 'booking',
                title: 'Booking Created',
                message: `Your booking at ${property.title} has been created. Please complete payment to confirm.`,
                isRead: false
            });

            // Send notification to property owner
            await storage.createNotification({
                userId: property.ownerId,
                type: 'booking',
                title: 'New Booking Received',
                message: `New booking request for ${property.title} from ${new Date(checkIn).toLocaleDateString()} to ${new Date(checkOut).toLocaleDateString()}`,
                isRead: false
            });

            res.status(201).json(booking);
        } catch (error) {
            console.error("Error creating booking:", error);
            res.status(500).json({ message: "Failed to create booking" });
        }
    });

    app.get("/api/bookings", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const bookings = await storage.getUserBookings(userId);
            res.json(bookings);
        } catch (error) {
            console.error("Error fetching bookings:", error);
            res.status(500).json({ message: "Failed to fetch bookings" });
        }
    });

    app.get("/api/bookings/:id", requireAuth, async (req: any, res) => {
        try {
            const booking = await storage.getBooking(req.params.id);
            if (!booking) {
                return res.status(404).json({ message: "Booking not found" });
            }

            const userId = (req.session as any).userId;
            if (booking.clientId !== userId) {
                return res.status(403).json({ message: "Access denied" });
            }

            res.json(booking);
        } catch (error) {
            console.error("Error fetching booking:", error);
            res.status(500).json({ message: "Failed to fetch booking" });
        }
    });

    app.get("/api/bookings/code/:code", requireAuth, async (req, res) => {
        try {
            const booking = await storage.getBookingByCode(req.params.code);
            if (!booking) {
                return res.status(404).json({ message: "Booking not found" });
            }
            res.json(booking);
        } catch (error) {
            console.error("Error fetching booking by code:", error);
            res.status(500).json({ message: "Failed to fetch booking" });
        }
    });

    app.post(
        "/api/bookings/:id/payment-intent",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const booking = await storage.getBooking(req.params.id);

                if (!booking) {
                    return res
                        .status(404)
                        .json({ message: "Booking not found" });
                }

                // Verify the user is the client who created the booking
                if (booking.clientId !== userId) {
                    return res.status(403).json({
                        message: "Not authorized to pay for this booking",
                    });
                }

                // Only allow payment if booking is pending payment
                if (booking.status !== "pending_payment") {
                    return res.status(400).json({
                        message: "Booking must be in pending_payment status",
                    });
                }

                if (booking.paymentStatus === "paid") {
                    return res
                        .status(400)
                        .json({ message: "Booking has already been paid" });
                }

                // Create Stripe payment intent
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: Math.round(parseFloat(booking.totalAmount) * 100), // Convert to cents
                    currency: "usd",
                    metadata: {
                        bookingId: booking.id,
                        bookingCode: booking.bookingCode,
                    },
                });

                res.json({ clientSecret: paymentIntent.client_secret });
            } catch (error) {
                console.error("Error creating payment intent:", error);
                res.status(500).json({
                    message: "Failed to create payment intent",
                });
            }
        }
    );

    app.post(
        "/api/bookings/:id/confirm-payment",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const { paymentIntentId } = req.body;
                const booking = await storage.getBooking(req.params.id);

                if (!booking) {
                    return res
                        .status(404)
                        .json({ message: "Booking not found" });
                }

                // Verify the user is the client who created the booking
                if (booking.clientId !== userId) {
                    return res.status(403).json({ message: "Not authorized" });
                }

                // Verify payment with Stripe
                const paymentIntent = await stripe.paymentIntents.retrieve(
                    paymentIntentId
                );

                if (
                    paymentIntent.status === "succeeded" &&
                    paymentIntent.metadata.bookingId === booking.id
                ) {
                    // Update both payment status and booking status in database
                    await storage.updateBookingPaymentStatus(
                        booking.id,
                        "paid"
                    );
                    await storage.updateBookingStatus(booking.id, "confirmed");

                    // Get property details for notifications
                    const property = await storage.getProperty(booking.propertyId);

                    // Send payment success notification to client
                    await storage.createNotification({
                        userId: userId,
                        type: 'payment',
                        title: 'Payment Successful',
                        message: `Your payment of $${booking.totalAmount} for ${property?.title || 'booking'} has been confirmed. Booking code: ${booking.bookingCode}`,
                        isRead: false
                    });

                    // Send payment received notification to property owner
                    if (property) {
                        await storage.createNotification({
                            userId: property.ownerId,
                            type: 'payment',
                            title: 'Payment Received',
                            message: `Payment of $${booking.totalAmount} received for ${property.title}. Booking code: ${booking.bookingCode}`,
                            isRead: false
                        });
                    }

                    res.json({ success: true, message: "Payment confirmed" });
                } else {
                    res.status(400).json({
                        message: "Payment verification failed",
                    });
                }
            } catch (error) {
                console.error("Error confirming payment:", error);
                res.status(500).json({ message: "Failed to confirm payment" });
            }
        }
    );

    // Review routes
    app.post("/api/reviews", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const reviewData = {
                ...req.body,
                reviewerId: userId,
            };

            const review = await storage.createReview(reviewData);

            // Get reviewer details
            const reviewer = await storage.getUser(userId);

            // Send notification based on review type
            if (reviewData.propertyId) {
                const property = await storage.getProperty(reviewData.propertyId);
                if (property) {
                    await storage.createNotification({
                        userId: property.ownerId,
                        type: 'review',
                        title: 'New Review Received',
                        message: `${reviewer?.firstName || 'Someone'} left a ${reviewData.rating}-star review for ${property.title}`,
                        isRead: false
                    });
                }
            } else if (reviewData.serviceProviderId) {
                const provider = await storage.getServiceProvider(reviewData.serviceProviderId);
                if (provider) {
                    await storage.createNotification({
                        userId: provider.userId,
                        type: 'review',
                        title: 'New Review Received',
                        message: `${reviewer?.firstName || 'Someone'} left a ${reviewData.rating}-star review for your service`,
                        isRead: false
                    });
                }
            }

            res.status(201).json(review);
        } catch (error) {
            console.error("Error creating review:", error);
            res.status(500).json({ message: "Failed to create review" });
        }
    });

    app.get("/api/properties/:id/reviews", async (req, res) => {
        try {
            const reviews = await storage.getPropertyReviews(req.params.id);
            res.json(reviews);
        } catch (error) {
            console.error("Error fetching property reviews:", error);
            res.status(500).json({ message: "Failed to fetch reviews" });
        }
    });

    app.get("/api/service-providers/:id/reviews", async (req, res) => {
        try {
            const reviews = await storage.getServiceProviderReviews(
                req.params.id
            );
            res.json(reviews);
        } catch (error) {
            console.error("Error fetching service provider reviews:", error);
            res.status(500).json({ message: "Failed to fetch reviews" });
        }
    });

    app.get("/api/service-providers/:id/stats", async (req, res) => {
        try {
            const reviews = await storage.getServiceProviderReviews(
                req.params.id
            );
            
            if (reviews.length === 0) {
                return res.json({
                    averageRating: 0,
                    totalReviews: 0
                });
            }

            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRating / reviews.length;

            res.json({
                averageRating: parseFloat(averageRating.toFixed(2)),
                totalReviews: reviews.length
            });
        } catch (error) {
            console.error("Error fetching service provider stats:", error);
            res.status(500).json({ message: "Failed to fetch stats" });
        }
    });

    // Admin Settings API
    app.get("/api/admin/settings", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (!user || user.role !== "admin") {
                return res.status(403).json({ message: "Admin access required" });
            }

            const settings = await db
                .select()
                .from(platformSettings);

            res.json(settings);
        } catch (error) {
            console.error("Error fetching settings:", error);
            res.status(500).json({ message: "Failed to fetch settings" });
        }
    });

    app.put("/api/admin/settings/commission", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (!user || user.role !== "admin") {
                return res.status(403).json({ message: "Admin access required" });
            }

            const { commissionRate } = req.body;
            
            if (!commissionRate || commissionRate < 0 || commissionRate > 100) {
                return res.status(400).json({ 
                    message: "Invalid commission rate. Must be between 0 and 100." 
                });
            }

            // Update or insert commission rate setting
            const existingSetting = await db
                .select()
                .from(platformSettings)
                .where(eq(platformSettings.settingKey, 'service_commission_rate'))
                .limit(1);

            if (existingSetting.length > 0) {
                await db
                    .update(platformSettings)
                    .set({ 
                        settingValue: commissionRate.toString(),
                        updatedBy: userId,
                        updatedAt: new Date()
                    })
                    .where(eq(platformSettings.settingKey, 'service_commission_rate'));
            } else {
                await db
                    .insert(platformSettings)
                    .values({
                        settingKey: 'service_commission_rate',
                        settingValue: commissionRate.toString(),
                        settingType: 'number',
                        category: 'service',
                        description: 'Platform commission rate for service bookings',
                        isPublic: false,
                        updatedAt: new Date()
                    });
            }

            res.json({ 
                message: "Commission rate updated successfully",
                commissionRate 
            });
        } catch (error) {
            console.error("Error updating commission rate:", error);
            res.status(500).json({ message: "Failed to update commission rate" });
        }
    });

    // Message routes
    app.post("/api/messages", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const sender = await storage.getUser(userId);
            const receiver = await storage.getUser(req.body.receiverId);
            
            if (!sender || !receiver) {
                return res.status(404).json({ message: "User not found" });
            }

            // Validate messaging permissions
            if (!canMessageRole(sender.role as UserRole, receiver.role as UserRole)) {
                return res.status(403).json({ 
                    message: "You are not authorized to send messages to users with this role" 
                });
            }

            const messageData = {
                ...req.body,
                senderId: userId,
            };

            const message = await storage.sendMessage(messageData);

            // Send notification to receiver
            await storage.createNotification({
                userId: messageData.receiverId,
                type: 'message',
                title: 'New Message',
                message: `${sender?.firstName || 'Someone'} ${sender?.lastName || ''} sent you a message`,
                isRead: false
            });

            // Broadcast message via WebSocket if connected
            if (connectedClients.has(messageData.receiverId)) {
                const ws = connectedClients.get(messageData.receiverId);
                if (ws?.readyState === WebSocket.OPEN) {
                    ws.send(
                        JSON.stringify({
                            type: "new_message",
                            data: message,
                        })
                    );
                }
            }

            res.status(201).json(message);
        } catch (error) {
            console.error("Error sending message:", error);
            res.status(500).json({ message: "Failed to send message" });
        }
    });

    // Get all conversations for current user
    app.get("/api/conversations", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const conversations = await storage.getUserConversations(userId);
            res.json(conversations);
        } catch (error) {
            console.error("Error fetching conversations:", error);
            res.status(500).json({ message: "Failed to fetch conversations" });
        }
    });

    // Get messages with specific user
    app.get("/api/messages/:userId", requireAuth, async (req: any, res) => {
        try {
            const currentUserId = (req.session as any).userId;
            const otherUserId = req.params.userId;

            const messages = await storage.getConversation(
                currentUserId,
                otherUserId
            );
            res.json(messages);
        } catch (error) {
            console.error("Error fetching conversation:", error);
            res.status(500).json({ message: "Failed to fetch conversation" });
        }
    });

    // Contact support endpoint (sends message to operation_support user)
    app.post("/api/contact/support", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const { message: supportMessage } = req.body;

            if (!supportMessage || supportMessage.trim().length < 10) {
                return res.status(400).json({
                    message: "Please provide a detailed message (at least 10 characters)",
                });
            }

            // Find the operation_support user
            const allUsers = await storage.getAllUsers();
            const operationSupport = allUsers.find((u) => u.role === "operation_support");

            if (!operationSupport) {
                return res.status(400).json({
                    message: "Support is currently unavailable. Please try again later.",
                });
            }

            // Get sender details
            const sender = await storage.getUser(userId);

            // Send message to operation_support user
            const messageData = {
                senderId: userId,
                receiverId: operationSupport.id,
                content: supportMessage,
                bookingId: null,
                messageType: "text" as const,
            };

            const sentMessage = await storage.sendMessage(messageData);

            // Send notification to operation_support user
            try {
                await storage.createNotification({
                    userId: operationSupport.id,
                    type: "message",
                    title: "New Support Message",
                    message: `${sender?.firstName || "User"} ${sender?.lastName || ""} sent a support message: ${supportMessage.substring(0, 100)}${supportMessage.length > 100 ? "..." : ""}`,
                    isRead: false,
                });

                // Broadcast via WebSocket if connected
                if (connectedClients.has(operationSupport.id)) {
                    const ws = connectedClients.get(operationSupport.id);
                    try {
                        if (ws?.readyState === WebSocket.OPEN) {
                            ws.send(
                                JSON.stringify({
                                    type: "new_notification",
                                    data: {
                                        type: "message",
                                        title: "New Support Message",
                                        message: `${sender?.firstName || "User"} sent a support message`,
                                    },
                                })
                            );
                        }
                    } catch (wsError) {
                        console.error(`WebSocket error for operation support:`, wsError);
                    }
                }
            } catch (notifError) {
                console.error(`Error notifying operation support:`, notifError);
            }

            res.status(201).json({
                success: true,
                message: "Your message has been sent to our support team",
            });
        } catch (error) {
            console.error("Error sending support message:", error);
            res.status(500).json({
                message: "Failed to send support message. Please try again.",
            });
        }
    });

    // Mark messages as read
    app.put("/api/messages/read", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const { senderId } = req.body;

            if (!senderId) {
                return res
                    .status(400)
                    .json({ message: "Sender ID is required" });
            }

            await storage.markMessagesAsRead(userId, senderId);
            res.json({ success: true });
        } catch (error) {
            console.error("Error marking messages as read:", error);
            res.status(500).json({
                message: "Failed to mark messages as read",
            });
        }
    });

    // Notification routes
    app.get("/api/notifications", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const notifications = await storage.getUserNotifications(userId);
            res.json(notifications);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            res.status(500).json({ message: "Failed to fetch notifications" });
        }
    });

    app.get("/api/notifications/unread-count", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const count = await storage.getUnreadNotificationCount(userId);
            res.json({ count });
        } catch (error) {
            console.error("Error fetching unread notification count:", error);
            res.status(500).json({ message: "Failed to fetch unread count" });
        }
    });

    app.patch("/api/notifications/:id/read", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const updatedCount = await storage.markNotificationAsRead(req.params.id, userId);
            
            if (updatedCount === 0) {
                return res.status(404).json({ message: "Notification not found" });
            }
            
            res.json({ success: true });
        } catch (error) {
            console.error("Error marking notification as read:", error);
            res.status(500).json({
                message: "Failed to mark notification as read",
            });
        }
    });

    // Update user role (admin only)
    app.patch("/api/users/:id/role", requireAuth, async (req: any, res) => {
        try {
            const currentUserId = (req.session as any).userId;
            const currentUser = await storage.getUser(currentUserId);

            if (currentUser?.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Admin access required" });
            }

            const { role } = req.body;
            const targetUser = await storage.getUser(req.params.id);

            if (!targetUser) {
                return res.status(404).json({ message: "User not found" });
            }

            const updatedUser = await storage.upsertUser({
                ...targetUser,
                role,
            });

            res.json(updatedUser);
        } catch (error) {
            console.error("Error updating user role:", error);
            res.status(500).json({ message: "Failed to update user role" });
        }
    });

    // ============ FAVORITES ENDPOINTS ============
    // Add to favorites
    app.post("/api/favorites", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const { favoriteType, propertyId, serviceProviderId } = req.body;

            const favorite = await storage.addFavorite({
                userId,
                favoriteType,
                propertyId,
                serviceProviderId,
            });

            res.status(201).json(favorite);
        } catch (error) {
            console.error("Error adding favorite:", error);
            res.status(500).json({ message: "Failed to add favorite" });
        }
    });

    // Remove from favorites
    app.delete("/api/favorites/:id", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            await storage.removeFavorite(req.params.id, userId);
            res.json({ message: "Favorite removed successfully" });
        } catch (error) {
            console.error("Error removing favorite:", error);
            res.status(500).json({ message: "Failed to remove favorite" });
        }
    });

    // Get user's favorites
    app.get("/api/favorites", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const favorites = await storage.getUserFavorites(userId);
            res.json(favorites);
        } catch (error) {
            console.error("Error getting favorites:", error);
            res.status(500).json({ message: "Failed to get favorites" });
        }
    });

    // ============ PROMOTIONAL CODES ENDPOINTS ============
    // Validate promo code
    app.post(
        "/api/promo-codes/validate",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const { code, bookingId, serviceOrderId } = req.body;

                const result = await storage.validatePromoCode(
                    code,
                    userId,
                    bookingId,
                    serviceOrderId
                );
                res.json(result);
            } catch (error) {
                console.error("Error validating promo code:", error);
                res.status(500).json({
                    message: "Failed to validate promo code",
                });
            }
        }
    );

    // Admin: Create promo code
    app.post("/api/admin/promo-codes", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);
            if (!user || user.role !== "admin") {
                return res.status(403).json({ message: "Unauthorized" });
            }

            const promoCodeData = {
                ...req.body,
                validFrom: new Date(req.body.validFrom),
                validUntil: new Date(req.body.validUntil),
            };

            const promoCode = await storage.createPromoCode(promoCodeData);
            res.status(201).json(promoCode);
        } catch (error) {
            console.error("Error creating promo code:", error);
            res.status(500).json({ message: "Failed to create promo code" });
        }
    });

    // Admin: Get all promo codes
    app.get("/api/admin/promo-codes", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);
            if (!user || user.role !== "admin") {
                return res.status(403).json({ message: "Unauthorized" });
            }

            const promoCodes = await storage.getAllPromoCodes();
            res.json(promoCodes);
        } catch (error) {
            console.error("Error getting promo codes:", error);
            res.status(500).json({ message: "Failed to get promo codes" });
        }
    });

    // ============ LOYALTY POINTS ENDPOINTS ============
    // Get user loyalty points
    app.get("/api/loyalty-points", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const loyaltyPoints = await storage.getUserLoyaltyPoints(userId);
            res.json(loyaltyPoints);
        } catch (error) {
            console.error("Error getting loyalty points:", error);
            res.status(500).json({ message: "Failed to get loyalty points" });
        }
    });

    // Get loyalty points history
    app.get(
        "/api/loyalty-points/history",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const history = await storage.getLoyaltyPointsHistory(userId);
                res.json(history);
            } catch (error) {
                console.error("Error getting loyalty points history:", error);
                res.status(500).json({
                    message: "Failed to get loyalty points history",
                });
            }
        }
    );

    // ============ BOOKING CANCELLATION ENDPOINTS ============
    // Get user's own cancellations
    app.get("/api/cancellations", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const userCancellations = await storage.getUserCancellations(userId);
            res.json(userCancellations);
        } catch (error) {
            console.error("Error getting user cancellations:", error);
            res.status(500).json({ message: "Failed to get cancellations" });
        }
    });

    // Get all cancellations (admin only)
    app.get("/api/admin/cancellations", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);
            if (!user || user.role !== "admin") {
                return res.status(403).json({ message: "Unauthorized" });
            }

            const cancellations = await storage.getAllCancellations();
            res.json(cancellations);
        } catch (error) {
            console.error("Error getting cancellations:", error);
            res.status(500).json({ message: "Failed to get cancellations" });
        }
    });

    // Request booking cancellation
    app.post("/api/bookings/:id/cancel", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const { reason } = req.body;

            const cancellation = await storage.requestBookingCancellation(
                req.params.id,
                userId,
                reason
            );

            // Get booking details
            const booking = await storage.getBooking(req.params.id);
            const user = await storage.getUser(userId);

            // Notify all admins about cancellation request
            const allUsers = await storage.getAllUsers();
            const admins = allUsers.filter(u => u.role === 'admin');
            
            for (const admin of admins) {
                await storage.createNotification({
                    userId: admin.id,
                    type: 'cancellation',
                    title: 'Cancellation Request',
                    message: `${user?.firstName || 'User'} requested cancellation for booking ${booking?.bookingCode}. Reason: ${reason}`,
                    isRead: false
                });
            }

            // Notify client that request was submitted
            await storage.createNotification({
                userId: userId,
                type: 'cancellation',
                title: 'Cancellation Requested',
                message: `Your cancellation request for booking ${booking?.bookingCode} has been submitted and is under review.`,
                isRead: false
            });

            res.status(201).json(cancellation);
        } catch (error) {
            console.error("Error requesting cancellation:", error);
            res.status(500).json({ message: "Failed to request cancellation" });
        }
    });

    // Admin: Approve/reject cancellation
    app.patch(
        "/api/admin/cancellations/:id",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const user = await storage.getUser(userId);
                if (!user || user.role !== "admin") {
                    return res.status(403).json({ message: "Unauthorized" });
                }

                const { status, rejectionReason } = req.body;

                const cancellation = await storage.updateCancellationStatus(
                    req.params.id,
                    status,
                    userId,
                    rejectionReason
                );

                // Get cancellation details
                const booking = await storage.getBooking(cancellation.bookingId);

                // Notify the client about the decision
                if (status === 'approved') {
                    await storage.createNotification({
                        userId: cancellation.requestedBy,
                        type: 'cancellation',
                        title: 'Cancellation Approved',
                        message: `Your cancellation request for booking ${booking?.bookingCode} has been approved.`,
                        isRead: false
                    });
                } else if (status === 'rejected') {
                    await storage.createNotification({
                        userId: cancellation.requestedBy,
                        type: 'cancellation',
                        title: 'Cancellation Rejected',
                        message: `Your cancellation request for booking ${booking?.bookingCode} was not approved. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`,
                        isRead: false
                    });
                }

                res.json(cancellation);
            } catch (error) {
                console.error("Error updating cancellation:", error);
                res.status(500).json({
                    message: "Failed to update cancellation",
                });
            }
        }
    );

    // ============ TRIP PLANS ENDPOINTS ============
    // Create trip plan
    app.post("/api/trip-plans", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const tripPlan = await storage.createTripPlan({
                ...req.body,
                userId,
            });

            res.status(201).json(tripPlan);
        } catch (error) {
            console.error("Error creating trip plan:", error);
            res.status(500).json({ message: "Failed to create trip plan" });
        }
    });

    // Get user's trip plans
    app.get("/api/trip-plans", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const tripPlans = await storage.getUserTripPlans(userId);
            res.json(tripPlans);
        } catch (error) {
            console.error("Error getting trip plans:", error);
            res.status(500).json({ message: "Failed to get trip plans" });
        }
    });

    // Get trip plan details
    app.get("/api/trip-plans/:id", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const tripPlan = await storage.getTripPlanWithItems(
                req.params.id,
                userId
            );
            res.json(tripPlan);
        } catch (error) {
            console.error("Error getting trip plan:", error);
            res.status(500).json({ message: "Failed to get trip plan" });
        }
    });

    // Add item to trip plan
    app.post(
        "/api/trip-plans/:id/items",
        requireAuth,
        async (req: any, res) => {
            try {
                const item = await storage.addTripPlanItem({
                    ...req.body,
                    tripPlanId: req.params.id,
                });

                res.status(201).json(item);
            } catch (error) {
                console.error("Error adding trip plan item:", error);
                res.status(500).json({
                    message: "Failed to add trip plan item",
                });
            }
        }
    );

    // ============ SERVICE PACKAGES ENDPOINTS ============
    // Provider: Create service package
    app.post("/api/provider/packages", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const provider = await storage.getProviderByUserId(userId);
            if (!provider) {
                return res
                    .status(404)
                    .json({ message: "Service provider profile not found" });
            }

            const package_ = await storage.createServicePackage({
                ...req.body,
                serviceProviderId: provider.id,
            });

            res.status(201).json(package_);
        } catch (error) {
            console.error("Error creating service package:", error);
            res.status(500).json({
                message: "Failed to create service package",
            });
        }
    });

    // Get provider's service packages
    app.get("/api/provider/packages/:providerId", async (req, res) => {
        try {
            const packages = await storage.getProviderPackages(
                req.params.providerId
            );
            res.json(packages);
        } catch (error) {
            console.error("Error getting service packages:", error);
            res.status(500).json({ message: "Failed to get service packages" });
        }
    });

    // ============ PROVIDER EARNINGS ENDPOINTS ============
    // Provider: Get earnings dashboard
    app.get("/api/provider/earnings", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const provider = await storage.getProviderByUserId(userId);
            if (!provider) {
                return res
                    .status(404)
                    .json({ message: "Service provider profile not found" });
            }

            const earnings = await storage.getProviderEarnings(provider.id);
            res.json(earnings);
        } catch (error) {
            console.error("Error getting earnings:", error);
            res.status(500).json({ message: "Failed to get earnings" });
        }
    });

    // Provider: Request payout
    app.post("/api/provider/payouts", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const provider = await storage.getProviderByUserId(userId);
            if (!provider) {
                return res
                    .status(404)
                    .json({ message: "Service provider profile not found" });
            }

            const payout = await storage.requestPayout({
                ...req.body,
                serviceProviderId: provider.id,
            });

            res.status(201).json(payout);
        } catch (error) {
            console.error("Error requesting payout:", error);
            res.status(500).json({ message: "Failed to request payout" });
        }
    });

    // ============ DISPUTES ENDPOINTS ============
    // Create dispute
    app.post("/api/disputes", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const dispute = await storage.createDispute({
                ...req.body,
                raisedBy: userId,
            });

            res.status(201).json(dispute);
        } catch (error) {
            console.error("Error creating dispute:", error);
            res.status(500).json({ message: "Failed to create dispute" });
        }
    });

    // Get user's disputes
    app.get("/api/disputes", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const disputes = await storage.getUserDisputes(userId);
            res.json(disputes);
        } catch (error) {
            console.error("Error getting disputes:", error);
            res.status(500).json({ message: "Failed to get disputes" });
        }
    });

    // Admin: Get all disputes
    app.get("/api/admin/disputes", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);
            if (!user || user.role !== "admin") {
                return res.status(403).json({ message: "Unauthorized" });
            }

            const disputes = await storage.getAllDisputes();
            res.json(disputes);
        } catch (error) {
            console.error("Error getting disputes:", error);
            res.status(500).json({ message: "Failed to get disputes" });
        }
    });

    // Admin: Resolve dispute
    app.patch(
        "/api/admin/disputes/:id/resolve",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const user = await storage.getUser(userId);
                if (!user || user.role !== "admin") {
                    return res.status(403).json({ message: "Unauthorized" });
                }

                const { resolution } = req.body;

                const dispute = await storage.resolveDispute(
                    req.params.id,
                    resolution,
                    userId
                );

                res.json(dispute);
            } catch (error) {
                console.error("Error resolving dispute:", error);
                res.status(500).json({ message: "Failed to resolve dispute" });
            }
        }
    );

    // ============ PLATFORM SETTINGS ENDPOINTS ============
    // Get public settings
    app.get("/api/settings/public", async (req, res) => {
        try {
            const settings = await storage.getPublicSettings();
            res.json(settings);
        } catch (error) {
            console.error("Error getting public settings:", error);
            res.status(500).json({ message: "Failed to get settings" });
        }
    });

    // Admin: Get all settings
    app.get("/api/admin/settings", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);
            if (!user || user.role !== "admin") {
                return res.status(403).json({ message: "Unauthorized" });
            }

            const settings = await storage.getAllSettings();
            res.json(settings);
        } catch (error) {
            console.error("Error getting settings:", error);
            res.status(500).json({ message: "Failed to get settings" });
        }
    });

    // Admin: Update multiple settings (bulk update)
    app.post("/api/admin/settings", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);
            if (!user || user.role !== "admin") {
                return res.status(403).json({ message: "Unauthorized" });
            }

            // Map camelCase form field names to snake_case database keys
            const keyMapping: Record<string, string> = {
                commissionRate: 'service_commission_rate',
                platformFee: 'platform_fee',
                minBookingAmount: 'min_booking_amount',
            };

            const settingsData = req.body;
            const updatedSettings: any[] = [];
            const errors: string[] = [];

            // Update each setting that was provided
            for (const [key, value] of Object.entries(settingsData)) {
                if (value !== undefined && value !== null && value !== "") {
                    const dbKey = keyMapping[key] || key;
                    try {
                        const updated = await storage.updateSetting(
                            dbKey,
                            value as string,
                            userId
                        );
                        if (updated) {
                            updatedSettings.push(updated);
                        } else {
                            errors.push(`Setting ${key} not found`);
                        }
                    } catch (error) {
                        console.error(`Failed to update setting ${key}:`, error);
                        errors.push(`Failed to update ${key}: ${error}`);
                    }
                }
            }

            res.json({
                message: "Settings update complete",
                updated: updatedSettings,
                errors: errors.length > 0 ? errors : undefined,
            });
        } catch (error) {
            console.error("Error updating settings:", error);
            res.status(500).json({ message: "Failed to update settings" });
        }
    });

    // Admin: Update setting
    app.put("/api/admin/settings/:key", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);
            if (!user || user.role !== "admin") {
                return res.status(403).json({ message: "Unauthorized" });
            }

            const setting = await storage.updateSetting(
                req.params.key,
                req.body.value,
                userId
            );

            res.json(setting);
        } catch (error) {
            console.error("Error updating setting:", error);
            res.status(500).json({ message: "Failed to update setting" });
        }
    });

    // Get WhatsApp link for service provider
    app.get("/api/whatsapp/link/:providerId", requireAuth, async (req, res) => {
        try {
            const provider = await storage.getServiceProvider(
                req.params.providerId
            );

            if (!provider) {
                return res
                    .status(404)
                    .json({ message: "Service provider not found" });
            }

            if (!provider.whatsappNumber) {
                return res.status(404).json({
                    message: "WhatsApp number not available for this provider",
                });
            }

            const link = whatsappService.getWhatsAppLink(
                provider.whatsappNumber
            );

            res.json({
                link,
                whatsappNumber: provider.whatsappNumber,
            });
        } catch (error) {
            console.error("Error getting WhatsApp link:", error);
            res.status(500).json({ message: "Failed to get WhatsApp link" });
        }
    });

    // Send WhatsApp message notification (for system notifications)
    app.post("/api/whatsapp/notify", requireAuth, async (req, res) => {
        try {
            const { phoneNumber, message } = req.body;

            if (!phoneNumber || !message) {
                return res
                    .status(400)
                    .json({ message: "Phone number and message are required" });
            }

            const result = await whatsappService.sendMessage({
                to: whatsappService.formatWhatsAppNumber(phoneNumber),
                body: message,
            });

            if (!result.success) {
                return res.status(500).json({
                    message: result.error || "Failed to send WhatsApp message",
                });
            }

            res.json({
                success: true,
                messageSid: result.messageSid,
            });
        } catch (error) {
            console.error("Error sending WhatsApp message:", error);
            res.status(500).json({
                message: "Failed to send WhatsApp message",
            });
        }
    });

    // ============ CONTACT SUBMISSIONS ENDPOINTS ============
    // POST /api/contact - Submit a new contact form (public)
    app.post("/api/contact", async (req, res) => {
        try {
            const validatedData = insertContactSubmissionSchema.parse(req.body);
            const submission = await storage.createContactSubmission(
                validatedData
            );

            // Send email notification to admin if Resend is configured
            if (resend && process.env.ADMIN_EMAIL) {
                try {
                    await resend.emails.send({
                        from: process.env.FROM_EMAIL || "noreply@travelhub.com",
                        to: process.env.ADMIN_EMAIL,
                        subject: `New Contact Form: ${validatedData.subject}`,
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #333;">New Contact Form Submission</h2>
                                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                                    <p><strong>Name:</strong> ${validatedData.name}</p>
                                    <p><strong>Email:</strong> ${validatedData.email}</p>
                                    <p><strong>Subject:</strong> ${validatedData.subject}</p>
                                    <p><strong>Message:</strong></p>
                                    <p style="white-space: pre-wrap;">${validatedData.message}</p>
                                </div>
                                <p style="color: #666; font-size: 12px;">
                                    This message was sent from the TravelHub contact form.
                                </p>
                            </div>
                        `,
                    });
                    console.log("Contact form email sent successfully");
                } catch (emailError) {
                    console.error("Error sending contact email:", emailError);
                    // Don't fail the request if email fails
                }
            }

            res.status(201).json(submission);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    message: "Validation error",
                    errors: error.errors,
                });
            }
            console.error("Error creating contact submission:", error);
            res.status(500).json({ message: "Failed to submit contact form" });
        }
    });

    // GET /api/contact - Get all contact submissions (admin only)
    app.get("/api/contact", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (!user || user.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Admin privileges required" });
            }

            const submissions = await storage.getAllContactSubmissions();
            res.json(submissions);
        } catch (error) {
            console.error("Error fetching contact submissions:", error);
            res.status(500).json({
                message: "Failed to fetch contact submissions",
            });
        }
    });

    // PATCH /api/contact/:id/respond - Admin responds to a submission (admin only)
    app.patch(
        "/api/contact/:id/respond",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const user = await storage.getUser(userId);

                if (!user || user.role !== "admin") {
                    return res
                        .status(403)
                        .json({ message: "Admin privileges required" });
                }

                const { response } = req.body;

                if (!response) {
                    return res
                        .status(400)
                        .json({ message: "Response is required" });
                }

                const submission =
                    await storage.updateContactSubmissionResponse(
                        req.params.id,
                        userId,
                        response
                    );

                res.json(submission);
            } catch (error) {
                console.error("Error responding to contact submission:", error);
                res.status(500).json({
                    message: "Failed to respond to submission",
                });
            }
        }
    );

    // ============ JOB POSTINGS ENDPOINTS ============
    // GET /api/jobs - Get all active job postings (public)
    app.get("/api/jobs", async (req, res) => {
        try {
            const jobs = await storage.getActiveJobPostings();
            res.json(jobs);
        } catch (error) {
            console.error("Error fetching job postings:", error);
            res.status(500).json({ message: "Failed to fetch job postings" });
        }
    });

    // GET /api/jobs/:id - Get single job posting (public)
    app.get("/api/jobs/:id", async (req, res) => {
        try {
            const job = await storage.getJobPosting(req.params.id);

            if (!job) {
                return res
                    .status(404)
                    .json({ message: "Job posting not found" });
            }

            res.json(job);
        } catch (error) {
            console.error("Error fetching job posting:", error);
            res.status(500).json({ message: "Failed to fetch job posting" });
        }
    });

    // POST /api/jobs - Create job posting (admin only)
    app.post("/api/jobs", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (!user || user.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Admin privileges required" });
            }

            const validatedData = insertJobPostingSchema.parse({
                ...req.body,
                postedBy: userId,
            });

            const job = await storage.createJobPosting(validatedData);
            res.status(201).json(job);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    message: "Validation error",
                    errors: error.errors,
                });
            }
            console.error("Error creating job posting:", error);
            res.status(500).json({ message: "Failed to create job posting" });
        }
    });

    // PATCH /api/jobs/:id - Update job posting (admin only)
    app.patch("/api/jobs/:id", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (!user || user.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Admin privileges required" });
            }

            const job = await storage.updateJobPosting(req.params.id, req.body);
            res.json(job);
        } catch (error) {
            console.error("Error updating job posting:", error);
            res.status(500).json({ message: "Failed to update job posting" });
        }
    });

    // DELETE /api/jobs/:id - Delete job posting (admin only)
    app.delete("/api/jobs/:id", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (!user || user.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Admin privileges required" });
            }

            await storage.deleteJobPosting(req.params.id);
            res.json({ message: "Job posting deleted successfully" });
        } catch (error) {
            console.error("Error deleting job posting:", error);
            res.status(500).json({ message: "Failed to delete job posting" });
        }
    });

    // ============ JOB APPLICATIONS ENDPOINTS ============
    // POST /api/applications - Submit job application (public)
    app.post("/api/applications", async (req, res) => {
        try {
            const validatedData = insertJobApplicationSchema.parse(req.body);
            const application = await storage.createJobApplication(
                validatedData
            );
            res.status(201).json(application);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    message: "Validation error",
                    errors: error.errors,
                });
            }
            console.error("Error creating job application:", error);
            res.status(500).json({ message: "Failed to submit application" });
        }
    });

    // GET /api/applications - Get all applications (admin only)
    app.get("/api/applications", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (!user || user.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Admin privileges required" });
            }

            const applications = await storage.getAllJobApplications();
            res.json(applications);
        } catch (error) {
            console.error("Error fetching applications:", error);
            res.status(500).json({ message: "Failed to fetch applications" });
        }
    });

    // GET /api/applications/job/:jobId - Get applications for specific job (admin only)
    app.get(
        "/api/applications/job/:jobId",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const user = await storage.getUser(userId);

                if (!user || user.role !== "admin") {
                    return res
                        .status(403)
                        .json({ message: "Admin privileges required" });
                }

                const applications = await storage.getJobApplicationsByJobId(
                    req.params.jobId
                );
                res.json(applications);
            } catch (error) {
                console.error("Error fetching applications:", error);
                res.status(500).json({
                    message: "Failed to fetch applications",
                });
            }
        }
    );

    // PATCH /api/applications/:id/status - Update application status (admin only)
    app.patch(
        "/api/applications/:id/status",
        requireAuth,
        async (req: any, res) => {
            try {
                const userId = (req.session as any).userId;
                const user = await storage.getUser(userId);

                if (!user || user.role !== "admin") {
                    return res
                        .status(403)
                        .json({ message: "Admin privileges required" });
                }

                const { status, notes } = req.body;

                if (!status) {
                    return res
                        .status(400)
                        .json({ message: "Status is required" });
                }

                const application = await storage.updateJobApplicationStatus(
                    req.params.id,
                    status,
                    userId,
                    notes
                );

                res.json(application);
            } catch (error) {
                console.error("Error updating application status:", error);
                res.status(500).json({
                    message: "Failed to update application status",
                });
            }
        }
    );

    // ============ BLOG POSTS ENDPOINTS ============
    // GET /api/blog - Get all published blog posts (public)
    app.get("/api/blog", async (req, res) => {
        try {
            const posts = await storage.getPublishedBlogPosts();
            res.json(posts);
        } catch (error) {
            console.error("Error fetching blog posts:", error);
            res.status(500).json({ message: "Failed to fetch blog posts" });
        }
    });

    // GET /api/blog/:slug - Get single blog post by slug (public)
    app.get("/api/blog/:slug", async (req, res) => {
        try {
            const post = await storage.getBlogPostBySlug(req.params.slug);

            if (!post) {
                return res.status(404).json({ message: "Blog post not found" });
            }

            res.json(post);
        } catch (error) {
            console.error("Error fetching blog post:", error);
            res.status(500).json({ message: "Failed to fetch blog post" });
        }
    });

    // POST /api/blog - Create blog post (admin only)
    app.post("/api/blog", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (!user || user.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Admin privileges required" });
            }

            const validatedData = insertBlogPostSchema.parse({
                ...req.body,
                authorId: userId,
            });

            const post = await storage.createBlogPost(validatedData);
            res.status(201).json(post);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    message: "Validation error",
                    errors: error.errors,
                });
            }
            console.error("Error creating blog post:", error);
            res.status(500).json({ message: "Failed to create blog post" });
        }
    });

    // PATCH /api/blog/:id - Update blog post (admin only)
    app.patch("/api/blog/:id", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (!user || user.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Admin privileges required" });
            }

            // If updating featured image, delete the old one
            if (req.body.featuredImage) {
                const existingPost = await storage.getBlogPost(req.params.id);
                if (existingPost && existingPost.featuredImage && 
                    existingPost.featuredImage !== req.body.featuredImage) {
                    await deleteImageFile(existingPost.featuredImage);
                }
            }

            const post = await storage.updateBlogPost(req.params.id, req.body);
            res.json(post);
        } catch (error) {
            console.error("Error updating blog post:", error);
            res.status(500).json({ message: "Failed to update blog post" });
        }
    });

    // DELETE /api/blog/:id - Delete blog post (admin only)
    app.delete("/api/blog/:id", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (!user || user.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Admin privileges required" });
            }

            // Get blog post to access featured image URL before deletion
            const blogPost = await storage.getBlogPost(req.params.id);
            
            // Delete featured image if it exists
            if (blogPost && blogPost.featuredImage) {
                await deleteImageFile(blogPost.featuredImage);
            }

            await storage.deleteBlogPost(req.params.id);
            res.json({ message: "Blog post deleted successfully" });
        } catch (error) {
            console.error("Error deleting blog post:", error);
            res.status(500).json({ message: "Failed to delete blog post" });
        }
    });

    // POST /api/role-change-request - Submit role change request
    app.post("/api/role-change-request", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const { requestedRole, requestNote } = req.body;

            const allowedRoles = ["client", "property_owner", "service_provider"];
            if (!allowedRoles.includes(requestedRole)) {
                return res.status(400).json({
                    message: "Invalid role. Valid roles: client, property_owner, service_provider",
                });
            }

            if (user.role === requestedRole) {
                return res.status(400).json({
                    message: `You already have the ${requestedRole} role`,
                });
            }

            const pendingRequest = await storage.getPendingRoleChangeRequest(userId);
            if (pendingRequest) {
                return res.status(400).json({
                    message: "You already have a pending role change request. Please wait for it to be reviewed.",
                });
            }

            const request = await storage.createRoleChangeRequest(
                userId,
                requestedRole,
                requestNote
            );

            res.status(201).json({
                message: "Role change request submitted successfully",
                request,
            });
        } catch (error) {
            console.error("Error creating role change request:", error);
            res.status(500).json({ message: "Failed to submit role change request" });
        }
    });

    // GET /api/my-role-change-request - Get user's latest role change request
    app.get("/api/my-role-change-request", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const request = await storage.getPendingRoleChangeRequest(userId);

            if (!request) {
                return res.status(404).json({ message: "No pending request found" });
            }

            res.json(request);
        } catch (error) {
            console.error("Error fetching role change request:", error);
            res.status(500).json({ message: "Failed to fetch role change request" });
        }
    });

    // GET /api/admin/role-change-requests - List all role change requests (admin only)
    app.get("/api/admin/role-change-requests", requireAuth, async (req: any, res) => {
        try {
            const userId = (req.session as any).userId;
            const user = await storage.getUser(userId);

            if (!user || user.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Admin privileges required" });
            }

            const { status } = req.query;
            const requests = await storage.getAllRoleChangeRequests(
                status as string | undefined
            );

            res.json(requests);
        } catch (error) {
            console.error("Error fetching role change requests:", error);
            res.status(500).json({ message: "Failed to fetch role change requests" });
        }
    });

    // PUT /api/admin/role-change-request/:id - Approve or reject role change request (admin only)
    app.put("/api/admin/role-change-request/:id", requireAuth, async (req: any, res) => {
        try {
            const adminUserId = (req.session as any).userId;
            const adminUser = await storage.getUser(adminUserId);

            if (!adminUser || adminUser.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Admin privileges required" });
            }

            const { id } = req.params;
            const { action, adminNote } = req.body;

            if (!["approve", "reject"].includes(action)) {
                return res.status(400).json({
                    message: "Invalid action. Must be 'approve' or 'reject'",
                });
            }

            if (action === "reject" && !adminNote) {
                return res.status(400).json({
                    message: "Admin note is required when rejecting a request",
                });
            }

            let updatedRequest;
            if (action === "approve") {
                updatedRequest = await storage.approveRoleChangeRequest(
                    id,
                    adminUserId,
                    adminNote
                );

                await storage.createNotification({
                    userId: updatedRequest.userId,
                    type: "approval",
                    title: "Role Change Request Approved",
                    message: `Your request to change your role to ${updatedRequest.requestedRole} has been approved.${adminNote ? ` Admin note: ${adminNote}` : ""}`,
                    isRead: false,
                });
            } else {
                updatedRequest = await storage.rejectRoleChangeRequest(
                    id,
                    adminUserId,
                    adminNote
                );

                await storage.createNotification({
                    userId: updatedRequest.userId,
                    type: "rejection",
                    title: "Role Change Request Rejected",
                    message: `Your request to change your role to ${updatedRequest.requestedRole} has been rejected. Reason: ${adminNote}`,
                    isRead: false,
                });
            }

            res.json({
                message: `Role change request ${action}ed successfully`,
                request: updatedRequest,
            });
        } catch (error: any) {
            console.error("Error processing role change request:", error);
            res.status(500).json({ 
                message: error.message || "Failed to process role change request" 
            });
        }
    });

    const httpServer = createServer(app);

    // WebSocket setup for real-time messaging and notifications
    const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
    const connectedClients = new Map<string, WebSocket>();

    // Helper function to send notification to a user via WebSocket
    const sendNotificationToUser = async (userId: string, notification: any) => {
        if (connectedClients.has(userId)) {
            const ws = connectedClients.get(userId);
            if (ws?.readyState === WebSocket.OPEN) {
                // Get fresh unread count
                const unreadCount = await storage.getUnreadNotificationCount(userId);
                
                ws.send(
                    JSON.stringify({
                        type: "notification",
                        data: notification,
                        unreadCount,
                    })
                );
            }
        }
    };

    // Export helper for use in notification creation
    (storage as any).sendNotificationToUser = sendNotificationToUser;

    wss.on("connection", async (ws, req) => {
        let userId: string | null = null;
        let authenticated = false;

        // Parse session cookie from WebSocket upgrade request
        try {
            const cookies = req.headers.cookie;
            if (cookies) {
                // Extract session ID from cookie
                const sessionMatch = cookies.match(/connect\.sid=([^;]+)/);
                if (sessionMatch) {
                    const signedCookie = decodeURIComponent(sessionMatch[1]);
                    
                    // Unsign the cookie using the session secret
                    const sessionSecret = process.env.SESSION_SECRET || "travelhub-secret-key-change-in-production";
                    const sid = signature.unsign(signedCookie.slice(2), sessionSecret); // Remove 's:' prefix and unsign
                    
                    if (sid === false) {
                        console.error("Invalid session signature");
                        ws.close(1008, "Authentication failed: invalid signature");
                        return;
                    }
                    
                    // Get session from store
                    const sessionStore = new PgSession({ pool, tableName: "sessions" });
                    
                    await new Promise<void>((resolve, reject) => {
                        sessionStore.get(sid as string, (err, session) => {
                            if (err) {
                                console.error("Error getting session:", err);
                                reject(err);
                                return;
                            }
                            if (session && (session as any).userId) {
                                const sessionUserId = (session as any).userId as string;
                                if (sessionUserId) {
                                    userId = sessionUserId;
                                    connectedClients.set(sessionUserId, ws);
                                    authenticated = true;
                                    ws.send(
                                        JSON.stringify({
                                            type: "auth_success",
                                            message: "WebSocket authenticated",
                                        })
                                    );
                                }
                            }
                            resolve();
                        });
                    });
                }
            }
            
            // Close connection if authentication failed
            if (!authenticated) {
                console.log("WebSocket authentication failed - closing connection");
                ws.close(1008, "Authentication required");
                return;
            }
        } catch (error) {
            console.error("WebSocket authentication error:", error);
            ws.close(1011, "Authentication error");
            return;
        }

        ws.on("close", () => {
            if (userId) {
                connectedClients.delete(userId);
            }
        });

        ws.on("error", (error) => {
            console.error("WebSocket error:", error);
            if (userId) {
                connectedClients.delete(userId);
            }
        });
    });

    return httpServer;
}
