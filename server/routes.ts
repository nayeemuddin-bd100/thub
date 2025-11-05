import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { storage } from "./storage";
import { hashPassword, verifyPassword, requireAuth } from "./auth";
import { generateBookingCode } from "./base44";
import { whatsappService } from "./whatsapp";
import { insertServiceProviderSchema } from "@shared/schema";
import { z } from "zod";
import Stripe from "stripe";
import { format } from "date-fns";

const PgSession = connectPg(session);

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(
    session({
      store: new PgSession({
        pool,
        tableName: 'session',
      }),
      secret: process.env.SESSION_SECRET || 'travelhub-secret-key-change-in-production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      },
    })
  );
  // Register endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await storage.upsertUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'client',
      });

      // Set session
      (req.session as any).userId = user.id;

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.code === '23505') { // Unique violation
        return res.status(409).json({ message: "Email already exists" });
      }
      res.status(500).json({ message: "Failed to register" });
    }
  });

  // Login endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Find user by email
      const users = await storage.getUserByEmail(email);
      if (!users) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const isValid = await verifyPassword(password, users.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Set session
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
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get('/api/auth/user', requireAuth, async (req, res) => {
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
  app.get('/api/users/:userId', requireAuth, async (req, res) => {
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

  // User role management routes
  app.put('/api/auth/change-role', requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const { role } = req.body;
      
      // Validate role
      const validRoles = ['client', 'property_owner', 'service_provider'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role. Valid roles: client, property_owner, service_provider" });
      }
      
      const updatedUser = await storage.updateUserRole(userId, role);
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  app.put('/api/admin/assign-role', requireAuth, async (req, res) => {
    try {
      const adminUserId = (req.session as any).userId;
      const adminUser = await storage.getUser(adminUserId);
      
      // Check if user is admin
      if (adminUser?.role !== 'admin') {
        return res.status(403).json({ message: "Admin privileges required" });
      }
      
      const { userId, role } = req.body;
      
      // Validate role
      const validRoles = ['client', 'property_owner', 'service_provider', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
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
  app.get('/api/admin/stats', requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      
      // Check if user is admin
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin privileges required" });
      }
      
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  app.get('/api/admin/users', requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      
      // Check if user is admin
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin privileges required" });
      }
      
      const users = await storage.getAllUsers();
      // Remove passwords from all users
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Admin property management routes
  app.get('/api/admin/properties', requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin privileges required" });
      }
      
      const properties = await storage.getAllProperties();
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.post('/api/admin/properties', requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin privileges required" });
      }
      
      const property = await storage.createProperty(req.body);
      res.json(property);
    } catch (error) {
      console.error("Error creating property:", error);
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  app.put('/api/admin/properties/:id', requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin privileges required" });
      }
      
      const property = await storage.updateProperty(req.params.id, req.body);
      res.json(property);
    } catch (error) {
      console.error("Error updating property:", error);
      res.status(500).json({ message: "Failed to update property" });
    }
  });

  app.delete('/api/admin/properties/:id', requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin privileges required" });
      }
      
      await storage.deleteProperty(req.params.id);
      res.json({ message: "Property deleted successfully" });
    } catch (error) {
      console.error("Error deleting property:", error);
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  // Self-service provider application with form data (pending approval)
  app.post('/api/user/become-provider', requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role === 'service_provider') {
        return res.status(400).json({ message: "You are already a service provider" });
      }

      // Check if user already has a pending application
      const existingProvider = await storage.getServiceProviderByUserId(userId);
      if (existingProvider) {
        if (existingProvider.approvalStatus === 'pending') {
          return res.status(400).json({ message: "You already have a pending application" });
        } else if (existingProvider.approvalStatus === 'rejected') {
          return res.status(400).json({ message: "Your previous application was rejected. Please contact support." });
        }
      }

      // Validate the provider application data
      const providerData = insertServiceProviderSchema.parse({
        userId,
        approvalStatus: 'pending',
        ...req.body,
      });

      // Create service provider profile (pending approval)
      const provider = await storage.createServiceProvider(providerData);
      
      res.json({ 
        message: "Application submitted successfully! An admin will review it soon.", 
        provider 
      });
    } catch (error) {
      console.error("Error submitting provider application:", error);
      res.status(500).json({ message: "Failed to submit application" });
    }
  });

  // Admin: Approve provider application
  app.post('/api/admin/providers/:providerId/approve', requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { providerId } = req.params;
      const provider = await storage.getServiceProvider(providerId);
      
      if (!provider) {
        return res.status(404).json({ message: "Provider application not found" });
      }

      // Update provider approval status
      const updatedProvider = await storage.updateServiceProviderApproval(providerId, 'approved', null);
      
      // Update user role to service_provider
      await storage.updateUserRole(provider.userId, 'service_provider');
      
      res.json({ 
        message: "Provider application approved successfully",
        provider: updatedProvider
      });
    } catch (error) {
      console.error("Error approving provider:", error);
      res.status(500).json({ message: "Failed to approve application" });
    }
  });

  // Admin: Reject provider application
  app.post('/api/admin/providers/:providerId/reject', requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { providerId } = req.params;
      const { reason } = req.body;
      const provider = await storage.getServiceProvider(providerId);
      
      if (!provider) {
        return res.status(404).json({ message: "Provider application not found" });
      }

      // Update provider approval status
      const updatedProvider = await storage.updateServiceProviderApproval(providerId, 'rejected', reason);
      
      res.json({ 
        message: "Provider application rejected",
        provider: updatedProvider
      });
    } catch (error) {
      console.error("Error rejecting provider:", error);
      res.status(500).json({ message: "Failed to reject application" });
    }
  });

  // Admin bookings route
  app.get('/api/admin/bookings', requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin privileges required" });
      }
      
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching admin bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Admin service orders route
  app.get('/api/admin/service-orders', requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin privileges required" });
      }
      
      const orders = await storage.getAllServiceOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching admin service orders:", error);
      res.status(500).json({ message: "Failed to fetch service orders" });
    }
  });

  app.patch('/api/admin/service-orders/:id/status', requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin privileges required" });
      }
      
      const { status } = req.body;
      const order = await storage.updateServiceOrderStatus(req.params.id, status);
      res.json(order);
    } catch (error) {
      console.error("Error updating service order status:", error);
      res.status(500).json({ message: "Failed to update service order status" });
    }
  });

  app.get('/api/admin/bookings/:id', requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin privileges required" });
      }
      
      const bookingDetails = await storage.getBookingDetails(req.params.id);
      if (!bookingDetails) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(bookingDetails);
    } catch (error) {
      console.error("Error fetching booking details:", error);
      res.status(500).json({ message: "Failed to fetch booking details" });
    }
  });

  app.patch('/api/admin/bookings/:id/status', requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin privileges required" });
      }
      
      const { status } = req.body;
      const booking = await storage.updateBookingStatus(req.params.id, status);
      res.json(booking);
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  // Admin service providers routes
  app.get('/api/admin/service-providers', requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin privileges required" });
      }
      
      const providers = await storage.getServiceProviders();
      res.json(providers);
    } catch (error) {
      console.error("Error fetching service providers:", error);
      res.status(500).json({ message: "Failed to fetch service providers" });
    }
  });

  app.post('/api/admin/service-providers', requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin privileges required" });
      }
      
      const provider = await storage.createServiceProvider(req.body);
      res.status(201).json(provider);
    } catch (error) {
      console.error("Error creating service provider:", error);
      res.status(500).json({ message: "Failed to create service provider" });
    }
  });

  app.patch('/api/admin/service-providers/:id', requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin privileges required" });
      }
      
      const provider = await storage.updateServiceProvider(req.params.id, req.body);
      res.json(provider);
    } catch (error) {
      console.error("Error updating service provider:", error);
      res.status(500).json({ message: "Failed to update service provider" });
    }
  });

  app.delete('/api/admin/service-providers/:id', requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin privileges required" });
      }
      
      await storage.deleteServiceProvider(req.params.id);
      res.json({ message: "Service provider deleted successfully" });
    } catch (error) {
      console.error("Error deleting service provider:", error);
      res.status(500).json({ message: "Failed to delete service provider" });
    }
  });

  // Property routes
  app.get('/api/properties', async (req, res) => {
    try {
      const { location, maxPrice, minPrice, guests, checkIn, checkOut } = req.query;
      
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
          const services = await storage.getPropertyServices(property.id);
          return {
            ...property,
            serviceCount: services.length
          };
        })
      );
      
      res.json(propertiesWithServiceCounts);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get('/api/properties/:id', async (req, res) => {
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

  app.post('/api/properties', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'property_owner' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Insufficient permissions" });
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

  // Service routes
  app.get('/api/service-categories', async (req, res) => {
    try {
      const categories = await storage.getServiceCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching service categories:", error);
      res.status(500).json({ message: "Failed to fetch service categories" });
    }
  });

  app.get('/api/service-providers', async (req, res) => {
    try {
      const { categoryId, location } = req.query;
      const providers = await storage.getServiceProviders(
        categoryId as string,
        location as string
      );
      res.json(providers);
    } catch (error) {
      console.error("Error fetching service providers:", error);
      res.status(500).json({ message: "Failed to fetch service providers" });
    }
  });

  app.get('/api/service-providers/:id', async (req, res) => {
    try {
      const provider = await storage.getServiceProvider(req.params.id);
      if (!provider) {
        return res.status(404).json({ message: "Service provider not found" });
      }
      res.json(provider);
    } catch (error) {
      console.error("Error fetching service provider:", error);
      res.status(500).json({ message: "Failed to fetch service provider" });
    }
  });

  app.post('/api/service-providers', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'service_provider' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const providerData = {
        ...req.body,
        userId,
      };
      
      const provider = await storage.createServiceProvider(providerData);
      res.status(201).json(provider);
    } catch (error) {
      console.error("Error creating service provider:", error);
      res.status(500).json({ message: "Failed to create service provider" });
    }
  });

  // Provider Configuration Routes
  app.get('/api/provider/profile', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const provider = await storage.getServiceProviderByUserId(userId);
      if (!provider) {
        return res.status(404).json({ message: "Provider profile not found" });
      }
      res.json(provider);
    } catch (error) {
      console.error("Error fetching provider profile:", error);
      res.status(500).json({ message: "Failed to fetch provider profile" });
    }
  });

  app.patch('/api/provider/profile', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const provider = await storage.getServiceProviderByUserId(userId);
      if (!provider) {
        return res.status(404).json({ message: "Provider profile not found" });
      }
      
      // Only allow updating specific fields, not userId, categoryId, approvalStatus
      const allowedUpdates: Record<string, any> = {
        businessName: req.body.businessName,
        description: req.body.description,
        location: req.body.location,
        whatsappNumber: req.body.whatsappNumber,
        hourlyRate: req.body.hourlyRate,
        fixedRate: req.body.fixedRate,
      };
      
      // Remove undefined fields
      Object.keys(allowedUpdates).forEach(key => 
        allowedUpdates[key] === undefined && delete allowedUpdates[key]
      );
      
      const updated = await storage.updateServiceProvider(provider.id, allowedUpdates);
      res.json(updated);
    } catch (error) {
      console.error("Error updating provider profile:", error);
      res.status(500).json({ message: "Failed to update provider profile" });
    }
  });

  // Provider Menus
  app.get('/api/provider/menus/:providerId', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const provider = await storage.getServiceProviderByUserId(userId);
      if (!provider) {
        return res.status(403).json({ message: "Not authorized as a service provider" });
      }
      
      // Verify ownership
      if (provider.id !== req.params.providerId) {
        return res.status(403).json({ message: "Not authorized to access this provider's menus" });
      }
      
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

  app.post('/api/provider/menus', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const provider = await storage.getServiceProviderByUserId(userId);
      if (!provider) {
        return res.status(403).json({ message: "Not authorized as a service provider" });
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

  app.patch('/api/provider/menus/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const provider = await storage.getServiceProviderByUserId(userId);
      if (!provider) {
        return res.status(403).json({ message: "Not authorized as a service provider" });
      }
      
      // Verify ownership by fetching the menu
      const menus = await storage.getProviderMenus(provider.id);
      const menu = menus.find(m => m.id === req.params.id);
      if (!menu) {
        return res.status(404).json({ message: "Menu not found or not authorized" });
      }
      
      const allowedUpdates: Record<string, any> = {
        categoryName: req.body.categoryName,
        description: req.body.description,
      };
      
      Object.keys(allowedUpdates).forEach(key => 
        allowedUpdates[key] === undefined && delete allowedUpdates[key]
      );
      
      const updated = await storage.updateProviderMenu(req.params.id, allowedUpdates);
      res.json(updated);
    } catch (error) {
      console.error("Error updating menu:", error);
      res.status(500).json({ message: "Failed to update menu" });
    }
  });

  app.delete('/api/provider/menus/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const provider = await storage.getServiceProviderByUserId(userId);
      if (!provider) {
        return res.status(403).json({ message: "Not authorized as a service provider" });
      }
      
      // Verify ownership
      const menus = await storage.getProviderMenus(provider.id);
      const menu = menus.find(m => m.id === req.params.id);
      if (!menu) {
        return res.status(404).json({ message: "Menu not found or not authorized" });
      }
      
      await storage.deleteProviderMenu(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting menu:", error);
      res.status(500).json({ message: "Failed to delete menu" });
    }
  });

  // Menu Items
  app.post('/api/provider/menu-items', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const provider = await storage.getServiceProviderByUserId(userId);
      if (!provider) {
        return res.status(403).json({ message: "Not authorized as a service provider" });
      }
      
      // Verify the menu belongs to this provider
      const menus = await storage.getProviderMenus(provider.id);
      const menu = menus.find(m => m.id === req.body.menuId);
      if (!menu) {
        return res.status(403).json({ message: "Not authorized to add items to this menu" });
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

  app.patch('/api/provider/menu-items/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const provider = await storage.getServiceProviderByUserId(userId);
      if (!provider) {
        return res.status(403).json({ message: "Not authorized as a service provider" });
      }
      
      // Verify ownership through menu
      const menus = await storage.getProviderMenus(provider.id);
      let authorized = false;
      for (const menu of menus) {
        const items = await storage.getMenuItems(menu.id);
        if (items.find(item => item.id === req.params.id)) {
          authorized = true;
          break;
        }
      }
      
      if (!authorized) {
        return res.status(404).json({ message: "Menu item not found or not authorized" });
      }
      
      const allowedUpdates: Record<string, any> = {
        dishName: req.body.dishName,
        description: req.body.description,
        price: req.body.price,
        ingredients: req.body.ingredients,
        dietaryTags: req.body.dietaryTags,
        photoUrl: req.body.photoUrl,
      };
      
      Object.keys(allowedUpdates).forEach(key => 
        allowedUpdates[key] === undefined && delete allowedUpdates[key]
      );
      
      const updated = await storage.updateMenuItem(req.params.id, allowedUpdates);
      res.json(updated);
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(500).json({ message: "Failed to update menu item" });
    }
  });

  app.delete('/api/provider/menu-items/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const provider = await storage.getServiceProviderByUserId(userId);
      if (!provider) {
        return res.status(403).json({ message: "Not authorized as a service provider" });
      }
      
      // Verify ownership
      const menus = await storage.getProviderMenus(provider.id);
      let authorized = false;
      for (const menu of menus) {
        const items = await storage.getMenuItems(menu.id);
        if (items.find(item => item.id === req.params.id)) {
          authorized = true;
          break;
        }
      }
      
      if (!authorized) {
        return res.status(404).json({ message: "Menu item not found or not authorized" });
      }
      
      await storage.deleteMenuItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ message: "Failed to delete menu item" });
    }
  });

  // Provider Task Configs
  app.get('/api/provider/tasks/:providerId', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const provider = await storage.getServiceProviderByUserId(userId);
      if (!provider) {
        return res.status(403).json({ message: "Not authorized as a service provider" });
      }
      
      // Verify ownership
      if (provider.id !== req.params.providerId) {
        return res.status(403).json({ message: "Not authorized to access this provider's task configs" });
      }
      
      const configs = await storage.getProviderTaskConfigs(req.params.providerId);
      res.json(configs);
    } catch (error) {
      console.error("Error fetching task configs:", error);
      res.status(500).json({ message: "Failed to fetch task configs" });
    }
  });

  app.post('/api/provider/tasks', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const provider = await storage.getServiceProviderByUserId(userId);
      if (!provider) {
        return res.status(403).json({ message: "Not authorized as a service provider" });
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
  app.get('/api/service-tasks/:categoryId', async (req, res) => {
    try {
      const tasks = await storage.getServiceTasks(req.params.categoryId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching service tasks:", error);
      res.status(500).json({ message: "Failed to fetch service tasks" });
    }
  });

  // Provider Materials
  app.get('/api/provider/materials/:providerId', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const provider = await storage.getServiceProviderByUserId(userId);
      if (!provider) {
        return res.status(403).json({ message: "Not authorized as a service provider" });
      }
      
      // Verify ownership
      if (provider.id !== req.params.providerId) {
        return res.status(403).json({ message: "Not authorized to access this provider's materials" });
      }
      
      const materials = await storage.getProviderMaterials(req.params.providerId);
      res.json(materials);
    } catch (error) {
      console.error("Error fetching materials:", error);
      res.status(500).json({ message: "Failed to fetch materials" });
    }
  });

  app.post('/api/provider/materials', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const provider = await storage.getServiceProviderByUserId(userId);
      if (!provider) {
        return res.status(403).json({ message: "Not authorized as a service provider" });
      }
      
      // Ensure material is created for the authenticated provider
      const materialData = {
        serviceProviderId: provider.id,
        materialName: req.body.materialName,
        materialType: req.body.materialType || 'other',
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

  app.patch('/api/provider/materials/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const provider = await storage.getServiceProviderByUserId(userId);
      if (!provider) {
        return res.status(403).json({ message: "Not authorized as a service provider" });
      }
      
      // Verify ownership
      const materials = await storage.getProviderMaterials(provider.id);
      const material = materials.find(m => m.id === req.params.id);
      if (!material) {
        return res.status(404).json({ message: "Material not found or not authorized" });
      }
      
      const allowedUpdates: Record<string, any> = {
        materialName: req.body.materialName,
        description: req.body.description,
        unitPrice: req.body.unitPrice,
        isProvidedByProvider: req.body.isProvidedByProvider,
      };
      
      Object.keys(allowedUpdates).forEach(key => 
        allowedUpdates[key] === undefined && delete allowedUpdates[key]
      );
      
      const updated = await storage.updateProviderMaterial(req.params.id, allowedUpdates);
      res.json(updated);
    } catch (error) {
      console.error("Error updating material:", error);
      res.status(500).json({ message: "Failed to update material" });
    }
  });

  app.delete('/api/provider/materials/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const provider = await storage.getServiceProviderByUserId(userId);
      if (!provider) {
        return res.status(403).json({ message: "Not authorized as a service provider" });
      }
      
      // Verify ownership
      const materials = await storage.getProviderMaterials(provider.id);
      const material = materials.find(m => m.id === req.params.id);
      if (!material) {
        return res.status(404).json({ message: "Material not found or not authorized" });
      }
      
      await storage.deleteProviderMaterial(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting material:", error);
      res.status(500).json({ message: "Failed to delete material" });
    }
  });

  // Public Provider Info routes (for clients to browse)
  app.get('/api/public/provider/:providerId/menus', async (req, res) => {
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

  app.get('/api/public/provider/:providerId/tasks', async (req, res) => {
    try {
      const configs = await storage.getProviderTaskConfigs(req.params.providerId);
      
      // Get full task details for enabled tasks
      if (configs.length > 0) {
        const provider = await storage.getServiceProvider(req.params.providerId);
        if (!provider) {
          return res.status(404).json({ message: "Provider not found" });
        }
        
        const allTasks = await storage.getServiceTasks(provider.categoryId);
        const enabledTasks = allTasks
          .filter(task => {
            const config = configs.find(c => c.taskId === task.id);
            return config?.isEnabled;
          })
          .map(task => {
            const config = configs.find(c => c.taskId === task.id);
            return {
              ...task,
              customPrice: config?.customPrice,
              effectivePrice: config?.customPrice || '0',
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

  app.get('/api/public/provider/:providerId/materials', async (req, res) => {
    try {
      const materials = await storage.getProviderMaterials(req.params.providerId);
      
      // Transform to match frontend expectations
      const formattedMaterials = materials.map(material => ({
        id: material.id,
        name: material.materialName,
        category: material.materialType,
        unitCost: material.additionalCost || '0',
        unit: 'item', // Default unit since not in schema
        isClientProvided: material.providedBy === 'client' || material.providedBy === 'either',
      }));
      
      res.json(formattedMaterials);
    } catch (error) {
      console.error("Error fetching provider materials:", error);
      res.status(500).json({ message: "Failed to fetch materials" });
    }
  });

  app.get('/api/service-providers/:providerId/reviews', async (req, res) => {
    try {
      const reviews = await storage.getServiceProviderReviews(req.params.providerId);
      
      // Format reviews with client names
      const formattedReviews = await Promise.all(
        reviews.map(async (review) => {
          const reviewer = await storage.getUser(review.reviewerId);
          const clientName = reviewer 
            ? `${reviewer.firstName || ''} ${reviewer.lastName || ''}`.trim() || 'Anonymous'
            : 'Anonymous';
          return {
            id: review.id,
            clientName,
            rating: review.rating,
            comment: review.comment || '',
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
  app.post('/api/service-orders', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { serviceProviderId, serviceDate, startTime, endTime, duration, items, specialInstructions, bookingId } = req.body;
      
      if (!serviceProviderId || !serviceDate || !startTime || !items || items.length === 0) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Verify provider exists
      const provider = await storage.getServiceProvider(serviceProviderId);
      if (!provider) {
        return res.status(404).json({ message: "Service provider not found" });
      }
      
      // Validate and recalculate prices from authoritative sources
      const validatedItems = [];
      let subtotal = 0;
      
      for (const item of items) {
        if (item.itemType === 'menu_item' && item.menuItemId) {
          // Fetch menu item from database
          const menus = await storage.getProviderMenus(serviceProviderId);
          let menuItem = null;
          
          for (const menu of menus) {
            const items = await storage.getMenuItems(menu.id);
            menuItem = items.find(i => i.id === item.menuItemId);
            if (menuItem) break;
          }
          
          if (!menuItem) {
            return res.status(400).json({ message: `Menu item ${item.menuItemId} not found for this provider` });
          }
          
          const price = parseFloat(menuItem.price || '0');
          validatedItems.push({
            itemType: 'menu_item',
            menuItemId: menuItem.id,
            taskId: null,
            itemName: menuItem.dishName,
            quantity: item.quantity || 1,
            unitPrice: price.toString(),
            totalPrice: (price * (item.quantity || 1)).toString(),
          });
          subtotal += price * (item.quantity || 1);
        } else if (item.itemType === 'task' && item.taskId) {
          // Fetch task config
          const configs = await storage.getProviderTaskConfigs(serviceProviderId);
          const config = configs.find(c => c.taskId === item.taskId && c.isEnabled);
          
          if (!config) {
            return res.status(400).json({ message: `Task ${item.taskId} not available for this provider` });
          }
          
          // Get task details
          const allTasks = await storage.getServiceTasks(provider.categoryId);
          const task = allTasks.find(t => t.id === item.taskId);
          
          if (!task) {
            return res.status(400).json({ message: `Task ${item.taskId} not found` });
          }
          
          const price = parseFloat(config.customPrice || '0');
          validatedItems.push({
            itemType: 'task',
            menuItemId: null,
            taskId: task.id,
            itemName: task.taskName,
            quantity: 1,
            unitPrice: price.toString(),
            totalPrice: price.toString(),
          });
          subtotal += price;
        } else {
          return res.status(400).json({ message: "Invalid item type or missing IDs" });
        }
      }
      
      const taxAmount = subtotal * 0.1; // 10% tax
      const totalAmount = subtotal + taxAmount;
      
      const orderData = {
        clientId: userId,
        serviceProviderId,
        bookingId: bookingId || null,
        orderCode: generateBookingCode(),
        serviceDate,
        startTime,
        endTime: endTime || null,
        duration: duration || null,
        status: 'pending_payment' as const, // Status will be updated to 'confirmed' after payment
        subtotal: subtotal.toString(),
        taxAmount: taxAmount.toString(),
        totalAmount: totalAmount.toString(),
        paymentStatus: 'pending' as const,
        specialInstructions: specialInstructions || null,
      };
      
      const order = await storage.createServiceOrder(orderData, validatedItems as any);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating service order:", error);
      res.status(500).json({ message: "Failed to create service order" });
    }
  });

  app.get('/api/service-orders/client', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const orders = await storage.getClientServiceOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching client service orders:", error);
      res.status(500).json({ message: "Failed to fetch service orders" });
    }
  });

  app.get('/api/service-orders/provider', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const provider = await storage.getServiceProviderByUserId(userId);
      if (!provider) {
        return res.status(403).json({ message: "Not authorized as a service provider" });
      }
      
      const orders = await storage.getProviderServiceOrders(provider.id);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching provider service orders:", error);
      res.status(500).json({ message: "Failed to fetch service orders" });
    }
  });

  app.get('/api/service-orders/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const order = await storage.getServiceOrder(req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: "Service order not found" });
      }
      
      // Check authorization
      const provider = await storage.getServiceProviderByUserId(userId);
      if (order.clientId !== userId && (!provider || order.serviceProviderId !== provider.id)) {
        return res.status(403).json({ message: "Not authorized to view this order" });
      }
      
      const items = await storage.getServiceOrderItems(order.id);
      res.json({ ...order, items });
    } catch (error) {
      console.error("Error fetching service order:", error);
      res.status(500).json({ message: "Failed to fetch service order" });
    }
  });

  app.patch('/api/service-orders/:id/status', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { status } = req.body;
      const order = await storage.getServiceOrder(req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: "Service order not found" });
      }
      
      // Check authorization
      const provider = await storage.getServiceProviderByUserId(userId);
      if (!provider || order.serviceProviderId !== provider.id) {
        return res.status(403).json({ message: "Not authorized to update this order" });
      }
      
      const updatedOrder = await storage.updateServiceOrderStatus(req.params.id, status);
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating service order status:", error);
      res.status(500).json({ message: "Failed to update service order status" });
    }
  });

  app.patch('/api/service-order-items/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { isCompleted, notes } = req.body;
      
      // Verify provider owns this order item
      const item = await storage.updateServiceOrderItem(req.params.id, {
        isCompleted: isCompleted !== undefined ? isCompleted : undefined,
        completedAt: isCompleted ? new Date() : undefined,
        notes: notes !== undefined ? notes : undefined,
      });
      
      res.json(item);
    } catch (error) {
      console.error("Error updating service order item:", error);
      res.status(500).json({ message: "Failed to update service order item" });
    }
  });

  // Service Order Payment routes
  app.post('/api/service-orders/:id/payment-intent', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const order = await storage.getServiceOrder(req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: "Service order not found" });
      }
      
      // Verify the user is the client who created the order
      if (order.clientId !== userId) {
        return res.status(403).json({ message: "Not authorized to pay for this order" });
      }
      
      // Only allow payment if order is pending payment
      if (order.status !== 'pending_payment') {
        return res.status(400).json({ message: "Order must be in pending_payment status" });
      }
      
      if (order.paymentStatus === 'paid') {
        return res.status(400).json({ message: "Order has already been paid" });
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
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });

  app.post('/api/service-orders/:id/confirm-payment', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { paymentIntentId } = req.body;
      const order = await storage.getServiceOrder(req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: "Service order not found" });
      }
      
      // Verify the user is the client who created the order
      if (order.clientId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded' && paymentIntent.metadata.orderId === order.id) {
        // Update both payment status and order status in database
        await storage.updateServiceOrderPaymentStatus(order.id, 'paid');
        await storage.updateServiceOrderStatus(order.id, 'confirmed');
        res.json({ success: true, message: "Payment confirmed" });
      } else {
        res.status(400).json({ message: "Payment verification failed" });
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });

  // Provider Availability routes
  app.get('/api/provider/availability/:providerId', async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      // If dates not provided, get availability for next 90 days
      const start = startDate as string || format(new Date(), 'yyyy-MM-dd');
      const end = endDate as string || format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
      
      const availability = await storage.getProviderAvailability(
        req.params.providerId,
        start,
        end
      );
      res.json(availability);
    } catch (error) {
      console.error("Error fetching provider availability:", error);
      res.status(500).json({ message: "Failed to fetch provider availability" });
    }
  });

  app.post('/api/provider/availability', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const provider = await storage.getServiceProviderByUserId(userId);
      if (!provider) {
        return res.status(403).json({ message: "Not authorized as a service provider" });
      }
      
      const availabilityData = {
        ...req.body,
        serviceProviderId: provider.id,
      };
      
      const availability = await storage.createProviderAvailability(availabilityData);
      res.status(201).json(availability);
    } catch (error) {
      console.error("Error creating provider availability:", error);
      res.status(500).json({ message: "Failed to create provider availability" });
    }
  });

  app.patch('/api/provider/availability/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const provider = await storage.getServiceProviderByUserId(userId);
      if (!provider) {
        return res.status(403).json({ message: "Not authorized as a service provider" });
      }
      
      const availability = await storage.updateProviderAvailability(req.params.id, req.body);
      res.json(availability);
    } catch (error) {
      console.error("Error updating provider availability:", error);
      res.status(500).json({ message: "Failed to update provider availability" });
    }
  });

  app.delete('/api/provider/availability/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const provider = await storage.getServiceProviderByUserId(userId);
      if (!provider) {
        return res.status(403).json({ message: "Not authorized as a service provider" });
      }
      
      await storage.deleteProviderAvailability(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting provider availability:", error);
      res.status(500).json({ message: "Failed to delete provider availability" });
    }
  });

  // Provider pricing routes
  app.get('/api/provider/pricing/:providerId', async (req, res) => {
    try {
      const pricing = await storage.getProviderPricing(req.params.providerId);
      res.json(pricing || {});
    } catch (error) {
      console.error("Error fetching provider pricing:", error);
      res.status(500).json({ message: "Failed to fetch provider pricing" });
    }
  });

  app.put('/api/provider/pricing', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const provider = await storage.getServiceProviderByUserId(userId);
      if (!provider) {
        return res.status(403).json({ message: "Not authorized as a service provider" });
      }
      
      const pricingData = {
        serviceProviderId: provider.id,
        ...req.body,
      };
      
      const pricing = await storage.upsertProviderPricing(pricingData);
      res.json(pricing);
    } catch (error) {
      console.error("Error updating provider pricing:", error);
      res.status(500).json({ message: "Failed to update provider pricing" });
    }
  });

  // Property services routes
  app.get('/api/properties/:id/services', async (req, res) => {
    try {
      const services = await storage.getPropertyServices(req.params.id);
      res.json(services);
    } catch (error) {
      console.error("Error fetching property services:", error);
      res.status(500).json({ message: "Failed to fetch property services" });
    }
  });

  app.post('/api/admin/properties/:id/services', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin privileges required" });
      }
      
      const { serviceProviderId } = req.body;
      
      // Validate inputs
      if (!serviceProviderId) {
        return res.status(400).json({ message: "Service provider ID is required" });
      }
      
      // Check if property exists
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      // Check if service provider exists
      const provider = await storage.getServiceProvider(serviceProviderId);
      if (!provider) {
        return res.status(404).json({ message: "Service provider not found" });
      }
      
      // Check if link already exists
      const existingServices = await storage.getPropertyServices(req.params.id);
      if (existingServices.some(s => s.id === serviceProviderId)) {
        return res.status(409).json({ message: "Service provider already linked to this property" });
      }
      
      const propertyService = await storage.addPropertyService(req.params.id, serviceProviderId);
      res.status(201).json(propertyService);
    } catch (error) {
      console.error("Error adding property service:", error);
      res.status(500).json({ message: "Failed to add property service" });
    }
  });

  app.delete('/api/admin/properties/:propertyId/services/:serviceProviderId', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin privileges required" });
      }
      
      // Check if property exists
      const property = await storage.getProperty(req.params.propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      // Check if service provider exists
      const provider = await storage.getServiceProvider(req.params.serviceProviderId);
      if (!provider) {
        return res.status(404).json({ message: "Service provider not found" });
      }
      
      // Check if link exists
      const existingServices = await storage.getPropertyServices(req.params.propertyId);
      if (!existingServices.some(s => s.id === req.params.serviceProviderId)) {
        return res.status(404).json({ message: "Service provider not linked to this property" });
      }
      
      await storage.removePropertyService(req.params.propertyId, req.params.serviceProviderId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing property service:", error);
      res.status(500).json({ message: "Failed to remove property service" });
    }
  });

  // Booking routes
  app.post('/api/bookings', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { propertyId, checkIn, checkOut, guests, services = [] } = req.body;
      
      // Calculate totals
      const property = await storage.getProperty(propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      const nights = Math.ceil(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      const propertyTotal = parseFloat(property.pricePerNight) * nights;
      let servicesTotal = 0;
      
      // Calculate service costs
      for (const service of services) {
        const provider = await storage.getServiceProvider(service.serviceProviderId);
        if (provider) {
          const rate = service.duration ? 
            parseFloat(provider.hourlyRate || '0') * service.duration :
            parseFloat(provider.fixedRate || '0');
          servicesTotal += rate;
        }
      }
      
      // Calculate bundle discount (10% for 3+ services, 5% for 1-2 services)
      const discountRate = services.length >= 3 ? 0.1 : services.length > 0 ? 0.05 : 0;
      const discountAmount = (propertyTotal + servicesTotal) * discountRate;
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
        status: 'pending_payment' as const, // Status will be updated to 'confirmed' after payment
        paymentStatus: 'pending' as const,
      };
      
      const booking = await storage.createBooking(bookingData, services);
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get('/api/bookings', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const bookings = await storage.getUserBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get('/api/bookings/:id', requireAuth, async (req: any, res) => {
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

  app.get('/api/bookings/code/:code', requireAuth, async (req, res) => {
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

  app.post('/api/bookings/:id/payment-intent', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const booking = await storage.getBooking(req.params.id);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Verify the user is the client who created the booking
      if (booking.clientId !== userId) {
        return res.status(403).json({ message: "Not authorized to pay for this booking" });
      }
      
      // Only allow payment if booking is pending payment
      if (booking.status !== 'pending_payment') {
        return res.status(400).json({ message: "Booking must be in pending_payment status" });
      }
      
      if (booking.paymentStatus === 'paid') {
        return res.status(400).json({ message: "Booking has already been paid" });
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
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });

  app.post('/api/bookings/:id/confirm-payment', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { paymentIntentId } = req.body;
      const booking = await storage.getBooking(req.params.id);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Verify the user is the client who created the booking
      if (booking.clientId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded' && paymentIntent.metadata.bookingId === booking.id) {
        // Update both payment status and booking status in database
        await storage.updateBookingPaymentStatus(booking.id, 'paid');
        await storage.updateBookingStatus(booking.id, 'confirmed');
        res.json({ success: true, message: "Payment confirmed" });
      } else {
        res.status(400).json({ message: "Payment verification failed" });
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });

  // Review routes
  app.post('/api/reviews', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const reviewData = {
        ...req.body,
        reviewerId: userId,
      };
      
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.get('/api/properties/:id/reviews', async (req, res) => {
    try {
      const reviews = await storage.getPropertyReviews(req.params.id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching property reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.get('/api/service-providers/:id/reviews', async (req, res) => {
    try {
      const reviews = await storage.getServiceProviderReviews(req.params.id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching service provider reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Message routes
  app.post('/api/messages', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const messageData = {
        ...req.body,
        senderId: userId,
      };
      
      const message = await storage.sendMessage(messageData);
      
      // Broadcast message via WebSocket if connected
      if (connectedClients.has(messageData.receiverId)) {
        const ws = connectedClients.get(messageData.receiverId);
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'new_message',
            data: message,
          }));
        }
      }
      
      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Get all conversations for current user
  app.get('/api/conversations', requireAuth, async (req: any, res) => {
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
  app.get('/api/messages/:userId', requireAuth, async (req: any, res) => {
    try {
      const currentUserId = (req.session as any).userId;
      const otherUserId = req.params.userId;
      
      const messages = await storage.getConversation(currentUserId, otherUserId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  // Mark messages as read
  app.put('/api/messages/read', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { senderId } = req.body;
      
      if (!senderId) {
        return res.status(400).json({ message: "Sender ID is required" });
      }
      
      await storage.markMessagesAsRead(userId, senderId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });

  // Update user role (admin only)
  app.patch('/api/users/:id/role', requireAuth, async (req: any, res) => {
    try {
      const currentUserId = (req.session as any).userId;
      const currentUser = await storage.getUser(currentUserId);
      
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
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
  app.post('/api/favorites', requireAuth, async (req: any, res) => {
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
  app.delete('/api/favorites/:id', requireAuth, async (req: any, res) => {
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
  app.get('/api/favorites', requireAuth, async (req: any, res) => {
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
  app.post('/api/promo-codes/validate', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { code, bookingId, serviceOrderId } = req.body;
      
      const result = await storage.validatePromoCode(code, userId, bookingId, serviceOrderId);
      res.json(result);
    } catch (error) {
      console.error("Error validating promo code:", error);
      res.status(500).json({ message: "Failed to validate promo code" });
    }
  });

  // Admin: Create promo code
  app.post('/api/admin/promo-codes', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'admin') {
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
  app.get('/api/admin/promo-codes', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'admin') {
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
  app.get('/api/loyalty-points', requireAuth, async (req: any, res) => {
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
  app.get('/api/loyalty-points/history', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const history = await storage.getLoyaltyPointsHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Error getting loyalty points history:", error);
      res.status(500).json({ message: "Failed to get loyalty points history" });
    }
  });

  // ============ BOOKING CANCELLATION ENDPOINTS ============
  // Get all cancellations (admin only)
  app.get('/api/admin/cancellations', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'admin') {
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
  app.post('/api/bookings/:id/cancel', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { reason } = req.body;
      
      const cancellation = await storage.requestBookingCancellation(
        req.params.id,
        userId,
        reason
      );
      
      res.status(201).json(cancellation);
    } catch (error) {
      console.error("Error requesting cancellation:", error);
      res.status(500).json({ message: "Failed to request cancellation" });
    }
  });

  // Admin: Approve/reject cancellation
  app.patch('/api/admin/cancellations/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const { status, rejectionReason } = req.body;
      
      const cancellation = await storage.updateCancellationStatus(
        req.params.id,
        status,
        userId,
        rejectionReason
      );
      
      res.json(cancellation);
    } catch (error) {
      console.error("Error updating cancellation:", error);
      res.status(500).json({ message: "Failed to update cancellation" });
    }
  });

  // ============ TRIP PLANS ENDPOINTS ============
  // Create trip plan
  app.post('/api/trip-plans', requireAuth, async (req: any, res) => {
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
  app.get('/api/trip-plans', requireAuth, async (req: any, res) => {
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
  app.get('/api/trip-plans/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const tripPlan = await storage.getTripPlanWithItems(req.params.id, userId);
      res.json(tripPlan);
    } catch (error) {
      console.error("Error getting trip plan:", error);
      res.status(500).json({ message: "Failed to get trip plan" });
    }
  });

  // Add item to trip plan
  app.post('/api/trip-plans/:id/items', requireAuth, async (req: any, res) => {
    try {
      const item = await storage.addTripPlanItem({
        ...req.body,
        tripPlanId: req.params.id,
      });
      
      res.status(201).json(item);
    } catch (error) {
      console.error("Error adding trip plan item:", error);
      res.status(500).json({ message: "Failed to add trip plan item" });
    }
  });

  // ============ SERVICE PACKAGES ENDPOINTS ============
  // Provider: Create service package
  app.post('/api/provider/packages', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const provider = await storage.getProviderByUserId(userId);
      if (!provider) {
        return res.status(404).json({ message: "Service provider profile not found" });
      }

      const package_ = await storage.createServicePackage({
        ...req.body,
        serviceProviderId: provider.id,
      });
      
      res.status(201).json(package_);
    } catch (error) {
      console.error("Error creating service package:", error);
      res.status(500).json({ message: "Failed to create service package" });
    }
  });

  // Get provider's service packages
  app.get('/api/provider/packages/:providerId', async (req, res) => {
    try {
      const packages = await storage.getProviderPackages(req.params.providerId);
      res.json(packages);
    } catch (error) {
      console.error("Error getting service packages:", error);
      res.status(500).json({ message: "Failed to get service packages" });
    }
  });

  // ============ PROVIDER EARNINGS ENDPOINTS ============
  // Provider: Get earnings dashboard
  app.get('/api/provider/earnings', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const provider = await storage.getProviderByUserId(userId);
      if (!provider) {
        return res.status(404).json({ message: "Service provider profile not found" });
      }

      const earnings = await storage.getProviderEarnings(provider.id);
      res.json(earnings);
    } catch (error) {
      console.error("Error getting earnings:", error);
      res.status(500).json({ message: "Failed to get earnings" });
    }
  });

  // Provider: Request payout
  app.post('/api/provider/payouts', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const provider = await storage.getProviderByUserId(userId);
      if (!provider) {
        return res.status(404).json({ message: "Service provider profile not found" });
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
  app.post('/api/disputes', requireAuth, async (req: any, res) => {
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
  app.get('/api/disputes', requireAuth, async (req: any, res) => {
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
  app.get('/api/admin/disputes', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'admin') {
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
  app.patch('/api/admin/disputes/:id/resolve', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'admin') {
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
  });

  // ============ PLATFORM SETTINGS ENDPOINTS ============
  // Get public settings
  app.get('/api/settings/public', async (req, res) => {
    try {
      const settings = await storage.getPublicSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error getting public settings:", error);
      res.status(500).json({ message: "Failed to get settings" });
    }
  });

  // Admin: Get all settings
  app.get('/api/admin/settings', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error getting settings:", error);
      res.status(500).json({ message: "Failed to get settings" });
    }
  });

  // Admin: Update setting
  app.put('/api/admin/settings/:key', requireAuth, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'admin') {
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
  app.get('/api/whatsapp/link/:providerId', requireAuth, async (req, res) => {
    try {
      const provider = await storage.getServiceProvider(req.params.providerId);
      
      if (!provider) {
        return res.status(404).json({ message: "Service provider not found" });
      }

      if (!provider.whatsappNumber) {
        return res.status(404).json({ message: "WhatsApp number not available for this provider" });
      }

      const link = whatsappService.getWhatsAppLink(provider.whatsappNumber);
      
      res.json({ 
        link,
        whatsappNumber: provider.whatsappNumber 
      });
    } catch (error) {
      console.error("Error getting WhatsApp link:", error);
      res.status(500).json({ message: "Failed to get WhatsApp link" });
    }
  });

  // Send WhatsApp message notification (for system notifications)
  app.post('/api/whatsapp/notify', requireAuth, async (req, res) => {
    try {
      const { phoneNumber, message } = req.body;

      if (!phoneNumber || !message) {
        return res.status(400).json({ message: "Phone number and message are required" });
      }

      const result = await whatsappService.sendMessage({
        to: whatsappService.formatWhatsAppNumber(phoneNumber),
        body: message
      });

      if (!result.success) {
        return res.status(500).json({ message: result.error || "Failed to send WhatsApp message" });
      }

      res.json({ 
        success: true,
        messageSid: result.messageSid 
      });
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      res.status(500).json({ message: "Failed to send WhatsApp message" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const connectedClients = new Map<string, WebSocket>();

  wss.on('connection', (ws, req) => {
    let userId: string | null = null;

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'auth' && message.userId) {
          userId = message.userId;
          if (userId) {
            connectedClients.set(userId, ws);
          }
          
          ws.send(JSON.stringify({
            type: 'auth_success',
            message: 'Connected successfully',
          }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (userId) {
        connectedClients.delete(userId);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      if (userId) {
        connectedClients.delete(userId);
      }
    });
  });

  return httpServer;
}
