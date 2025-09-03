import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateBookingCode } from "./base44";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User role management routes
  app.put('/api/auth/change-role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role } = req.body;
      
      // Validate role
      const validRoles = ['client', 'property_owner', 'service_provider'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role. Valid roles: client, property_owner, service_provider" });
      }
      
      const updatedUser = await storage.updateUserRole(userId, role);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  app.put('/api/admin/assign-role', isAuthenticated, async (req: any, res) => {
    try {
      const adminUserId = req.user.claims.sub;
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
      res.json(updatedUser);
    } catch (error) {
      console.error("Error assigning user role:", error);
      res.status(500).json({ message: "Failed to assign role" });
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

  app.post('/api/properties', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.post('/api/service-providers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.get('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookings = await storage.getUserBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get('/api/bookings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const userId = req.user.claims.sub;
      if (booking.clientId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  app.get('/api/bookings/code/:code', isAuthenticated, async (req, res) => {
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
  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.get('/api/conversations/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const otherUserId = req.params.userId;
      
      const messages = await storage.getConversation(currentUserId, otherUserId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  // Update user role (admin only)
  app.patch('/api/users/:id/role', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
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
