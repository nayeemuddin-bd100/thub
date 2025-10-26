import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { storage } from "./storage";
import { hashPassword, verifyPassword, requireAuth } from "./auth";
import { generateBookingCode } from "./base44";
import { z } from "zod";

const PgSession = connectPg(session);

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
      res.json(properties);
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
        status: 'pending' as const,
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

  app.get('/api/conversations/:userId', requireAuth, async (req: any, res) => {
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

  const httpServer = createServer(app);

  // WebSocket setup for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const connectedClients = new Map<string, WebSocket>();

  wss.on('connection', (ws, req) => {
    let userId: string | null = null;

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'auth') {
          userId = message.userId;
          connectedClients.set(userId, ws);
          
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
