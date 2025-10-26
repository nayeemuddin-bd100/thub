import {
  users,
  properties,
  serviceCategories,
  serviceProviders,
  bookings,
  serviceBookings,
  reviews,
  messages,
  propertyServices,
  serviceTasks,
  serviceTaskAssignments,
  jobAssignments,
  notifications,
  payments,
  type User,
  type UpsertUser,
  type Property,
  type InsertProperty,
  type ServiceProvider,
  type InsertServiceProvider,
  type Booking,
  type InsertBooking,
  type Review,
  type InsertReview,
  type ServiceCategory,
  type ServiceBooking,
  type Message,
  type PropertyService,
  type ServiceTask,
  type InsertServiceTask,
  type ServiceTaskAssignment,
  type JobAssignment,
  type Notification,
  type InsertNotification,
  type Payment,
  type InsertPayment,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, like, gte, lte, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User>;
  
  // Property operations
  getProperties(filters?: {
    location?: string;
    maxPrice?: number;
    minPrice?: number;
    guests?: number;
    checkIn?: Date;
    checkOut?: Date;
  }): Promise<Property[]>;
  getAllProperties(): Promise<Property[]>;
  getProperty(id: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, updates: Partial<InsertProperty>): Promise<Property>;
  deleteProperty(id: string): Promise<void>;
  
  // Service operations
  getServiceCategories(): Promise<ServiceCategory[]>;
  getServiceProviders(categoryId?: string, location?: string): Promise<ServiceProvider[]>;
  getServiceProvider(id: string): Promise<ServiceProvider | undefined>;
  getServiceProviderByUserId(userId: string): Promise<ServiceProvider | undefined>;
  createServiceProvider(provider: InsertServiceProvider): Promise<ServiceProvider>;
  updateServiceProvider(id: string, updates: Partial<InsertServiceProvider>): Promise<ServiceProvider>;
  updateServiceProviderApproval(id: string, status: 'approved' | 'rejected', reason: string | null): Promise<ServiceProvider>;
  deleteServiceProvider(id: string): Promise<void>;
  
  // Booking operations
  getAllBookings(): Promise<Booking[]>;
  getBookingDetails(id: string): Promise<any>;
  createBooking(booking: InsertBooking, serviceBookings?: Omit<ServiceBooking, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Booking>;
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingByCode(code: string): Promise<Booking | undefined>;
  getUserBookings(userId: string): Promise<Booking[]>;
  updateBookingStatus(id: string, status: string): Promise<Booking>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getPropertyReviews(propertyId: string): Promise<Review[]>;
  getServiceProviderReviews(serviceProviderId: string): Promise<Review[]>;
  
  // Message operations
  sendMessage(message: Omit<Message, 'id' | 'createdAt' | 'isRead'>): Promise<Message>;
  getConversation(userId1: string, userId2: string): Promise<Message[]>;
  markMessagesAsRead(userId: string, senderId: string): Promise<void>;
  
  // Property-Service associations
  getPropertyServices(propertyId: string): Promise<ServiceProvider[]>;
  addPropertyService(propertyId: string, serviceProviderId: string): Promise<PropertyService>;
  
  // Admin statistics
  getAdminStats(): Promise<{
    totalUsers: number;
    totalProperties: number;
    totalServiceProviders: number;
    totalBookings: number;
  }>;
  getAllUsers(): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Property operations
  async getAllProperties(): Promise<Property[]> {
    return await db.select().from(properties).orderBy(desc(properties.createdAt));
  }

  async getProperties(filters?: {
    location?: string;
    maxPrice?: number;
    minPrice?: number;
    guests?: number;
    checkIn?: Date;
    checkOut?: Date;
  }): Promise<Property[]> {
    let query = db.select().from(properties).where(eq(properties.isActive, true));
    
    if (filters?.location) {
      query = query.where(like(properties.location, `%${filters.location}%`));
    }
    if (filters?.maxPrice) {
      query = query.where(lte(properties.pricePerNight, filters.maxPrice.toString()));
    }
    if (filters?.minPrice) {
      query = query.where(gte(properties.pricePerNight, filters.minPrice.toString()));
    }
    if (filters?.guests) {
      query = query.where(gte(properties.maxGuests, filters.guests));
    }
    
    return await query.orderBy(desc(properties.rating));
  }

  async getProperty(id: string): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const [newProperty] = await db.insert(properties).values(property).returning();
    return newProperty;
  }

  async updateProperty(id: string, updates: Partial<InsertProperty>): Promise<Property> {
    const [updatedProperty] = await db
      .update(properties)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(properties.id, id))
      .returning();
    return updatedProperty;
  }

  async deleteProperty(id: string): Promise<void> {
    await db.delete(properties).where(eq(properties.id, id));
  }

  // Service operations
  async getServiceCategories(): Promise<ServiceCategory[]> {
    return await db.select().from(serviceCategories).orderBy(asc(serviceCategories.name));
  }

  async getServiceProviders(categoryId?: string, location?: string): Promise<ServiceProvider[]> {
    let query = db.select().from(serviceProviders).where(eq(serviceProviders.isActive, true));
    
    if (categoryId) {
      query = query.where(eq(serviceProviders.categoryId, categoryId));
    }
    if (location) {
      query = query.where(like(serviceProviders.location, `%${location}%`));
    }
    
    return await query.orderBy(desc(serviceProviders.rating));
  }

  async getServiceProvider(id: string): Promise<ServiceProvider | undefined> {
    const [provider] = await db.select().from(serviceProviders).where(eq(serviceProviders.id, id));
    return provider;
  }

  async getServiceProviderByUserId(userId: string): Promise<ServiceProvider | undefined> {
    const [provider] = await db.select().from(serviceProviders).where(eq(serviceProviders.userId, userId));
    return provider;
  }

  async createServiceProvider(provider: InsertServiceProvider): Promise<ServiceProvider> {
    const [newProvider] = await db.insert(serviceProviders).values(provider).returning();
    return newProvider;
  }

  async updateServiceProvider(id: string, updates: Partial<InsertServiceProvider>): Promise<ServiceProvider> {
    const [updatedProvider] = await db
      .update(serviceProviders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(serviceProviders.id, id))
      .returning();
    return updatedProvider;
  }

  async updateServiceProviderApproval(id: string, status: 'approved' | 'rejected', reason: string | null): Promise<ServiceProvider> {
    const [updatedProvider] = await db
      .update(serviceProviders)
      .set({ 
        approvalStatus: status, 
        rejectionReason: reason,
        updatedAt: new Date() 
      })
      .where(eq(serviceProviders.id, id))
      .returning();
    return updatedProvider;
  }

  async deleteServiceProvider(id: string): Promise<void> {
    await db.delete(serviceProviders).where(eq(serviceProviders.id, id));
  }

  // Booking operations
  async createBooking(booking: InsertBooking, serviceBookingsData?: Omit<ServiceBooking, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    
    if (serviceBookingsData && serviceBookingsData.length > 0) {
      await db.insert(serviceBookings).values(
        serviceBookingsData.map(sb => ({
          ...sb,
          bookingId: newBooking.id,
        }))
      );
    }
    
    return newBooking;
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingByCode(code: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.bookingCode, code));
    return booking;
  }

  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookings)
      .orderBy(desc(bookings.createdAt));
  }

  async getBookingDetails(id: string): Promise<any> {
    const booking = await this.getBooking(id);
    if (!booking) return null;

    const property = await this.getProperty(booking.propertyId);
    const client = await this.getUser(booking.clientId);
    const serviceBookingsList = await db.select().from(serviceBookings)
      .where(eq(serviceBookings.bookingId, id));

    return {
      ...booking,
      property,
      client,
      serviceBookings: serviceBookingsList,
    };
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    return await db.select().from(bookings)
      .where(eq(bookings.clientId, userId))
      .orderBy(desc(bookings.createdAt));
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  // Review operations
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    
    // Update property or service provider rating
    if (review.propertyId) {
      await this.updatePropertyRating(review.propertyId);
    }
    if (review.serviceProviderId) {
      await this.updateServiceProviderRating(review.serviceProviderId);
    }
    
    return newReview;
  }

  async getPropertyReviews(propertyId: string): Promise<Review[]> {
    return await db.select().from(reviews)
      .where(eq(reviews.propertyId, propertyId))
      .orderBy(desc(reviews.createdAt));
  }

  async getServiceProviderReviews(serviceProviderId: string): Promise<Review[]> {
    return await db.select().from(reviews)
      .where(eq(reviews.serviceProviderId, serviceProviderId))
      .orderBy(desc(reviews.createdAt));
  }

  private async updatePropertyRating(propertyId: string): Promise<void> {
    const result = await db
      .select({
        avgRating: sql<number>`AVG(${reviews.rating})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(reviews)
      .where(eq(reviews.propertyId, propertyId));
    
    if (result[0]) {
      await db
        .update(properties)
        .set({
          rating: result[0].avgRating.toFixed(2),
          reviewCount: result[0].count,
        })
        .where(eq(properties.id, propertyId));
    }
  }

  private async updateServiceProviderRating(serviceProviderId: string): Promise<void> {
    const result = await db
      .select({
        avgRating: sql<number>`AVG(${reviews.rating})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(reviews)
      .where(eq(reviews.serviceProviderId, serviceProviderId));
    
    if (result[0]) {
      await db
        .update(serviceProviders)
        .set({
          rating: result[0].avgRating.toFixed(2),
          reviewCount: result[0].count,
        })
        .where(eq(serviceProviders.id, serviceProviderId));
    }
  }

  // Message operations
  async sendMessage(message: Omit<Message, 'id' | 'createdAt' | 'isRead'>): Promise<Message> {
    const [newMessage] = await db.insert(messages).values({
      ...message,
      isRead: false,
    }).returning();
    return newMessage;
  }

  async getConversation(userId1: string, userId2: string): Promise<Message[]> {
    return await db.select().from(messages)
      .where(
        and(
          eq(messages.senderId, userId1),
          eq(messages.receiverId, userId2)
        )
      )
      .orderBy(asc(messages.createdAt));
  }

  async markMessagesAsRead(userId: string, senderId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.receiverId, userId),
          eq(messages.senderId, senderId),
          eq(messages.isRead, false)
        )
      );
  }

  // Property-Service associations
  async getPropertyServices(propertyId: string): Promise<ServiceProvider[]> {
    const result = await db
      .select({
        serviceProvider: serviceProviders,
      })
      .from(propertyServices)
      .innerJoin(serviceProviders, eq(propertyServices.serviceProviderId, serviceProviders.id))
      .where(eq(propertyServices.propertyId, propertyId));
    
    return result.map(r => r.serviceProvider);
  }

  async addPropertyService(propertyId: string, serviceProviderId: string): Promise<PropertyService> {
    const [propertyService] = await db.insert(propertyServices).values({
      propertyId,
      serviceProviderId,
    }).returning();
    return propertyService;
  }

  // Admin statistics
  async getAdminStats(): Promise<{
    totalUsers: number;
    totalProperties: number;
    totalServiceProviders: number;
    totalBookings: number;
  }> {
    const [userCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
    const [propertyCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(properties);
    const [providerCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(serviceProviders);
    const [bookingCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(bookings);

    return {
      totalUsers: Number(userCount.count),
      totalProperties: Number(propertyCount.count),
      totalServiceProviders: Number(providerCount.count),
      totalBookings: Number(bookingCount.count),
    };
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }
}

export const storage = new DatabaseStorage();
