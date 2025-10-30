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
  providerMenus,
  menuItems,
  providerTaskConfigs,
  providerMaterials,
  serviceOrders,
  serviceOrderItems,
  providerAvailability,
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
  type ProviderMenu,
  type InsertProviderMenu,
  type MenuItem,
  type InsertMenuItem,
  type ProviderTaskConfig,
  type InsertProviderTaskConfig,
  type ProviderMaterial,
  type InsertProviderMaterial,
  type ServiceOrder,
  type InsertServiceOrder,
  type ServiceOrderItem,
  type InsertServiceOrderItem,
  type ProviderAvailability,
  type InsertProviderAvailability,
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
  
  // Provider Configuration - Menus
  getProviderMenus(serviceProviderId: string): Promise<ProviderMenu[]>;
  createProviderMenu(menu: InsertProviderMenu): Promise<ProviderMenu>;
  updateProviderMenu(id: string, updates: Partial<InsertProviderMenu>): Promise<ProviderMenu>;
  deleteProviderMenu(id: string): Promise<void>;
  
  // Provider Configuration - Menu Items
  getMenuItems(menuId: string): Promise<MenuItem[]>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: string, updates: Partial<InsertMenuItem>): Promise<MenuItem>;
  deleteMenuItem(id: string): Promise<void>;
  
  // Provider Configuration - Task Configs
  getProviderTaskConfigs(serviceProviderId: string): Promise<ProviderTaskConfig[]>;
  upsertProviderTaskConfig(config: InsertProviderTaskConfig): Promise<ProviderTaskConfig>;
  deleteProviderTaskConfig(id: string): Promise<void>;
  
  // Provider Configuration - Materials
  getProviderMaterials(serviceProviderId: string): Promise<ProviderMaterial[]>;
  createProviderMaterial(material: InsertProviderMaterial): Promise<ProviderMaterial>;
  updateProviderMaterial(id: string, updates: Partial<InsertProviderMaterial>): Promise<ProviderMaterial>;
  deleteProviderMaterial(id: string): Promise<void>;
  
  // Service Tasks
  getServiceTasks(categoryId: string): Promise<ServiceTask[]>;
  
  // Service Orders
  createServiceOrder(order: InsertServiceOrder, items: InsertServiceOrderItem[]): Promise<ServiceOrder>;
  getServiceOrder(id: string): Promise<ServiceOrder | undefined>;
  getServiceOrderByCode(orderCode: string): Promise<ServiceOrder | undefined>;
  getClientServiceOrders(clientId: string): Promise<ServiceOrder[]>;
  getProviderServiceOrders(providerId: string): Promise<ServiceOrder[]>;
  updateServiceOrderStatus(id: string, status: string): Promise<ServiceOrder>;
  getServiceOrderItems(orderId: string): Promise<ServiceOrderItem[]>;
  updateServiceOrderItem(id: string, updates: Partial<ServiceOrderItem>): Promise<ServiceOrderItem>;
  
  // Provider Availability
  getProviderAvailability(providerId: string, startDate: string, endDate: string): Promise<ProviderAvailability[]>;
  createProviderAvailability(availability: InsertProviderAvailability): Promise<ProviderAvailability>;
  updateProviderAvailability(id: string, updates: Partial<InsertProviderAvailability>): Promise<ProviderAvailability>;
  deleteProviderAvailability(id: string): Promise<void>;
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
    const conditions = [eq(properties.isActive, true)];
    
    if (filters?.location) {
      conditions.push(like(properties.location, `%${filters.location}%`));
    }
    if (filters?.maxPrice) {
      conditions.push(lte(properties.pricePerNight, filters.maxPrice.toString()));
    }
    if (filters?.minPrice) {
      conditions.push(gte(properties.pricePerNight, filters.minPrice.toString()));
    }
    if (filters?.guests) {
      conditions.push(gte(properties.maxGuests, filters.guests));
    }
    
    return await db.select().from(properties).where(and(...conditions)).orderBy(desc(properties.rating));
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
    const conditions = [eq(serviceProviders.isActive, true)];
    
    if (categoryId) {
      conditions.push(eq(serviceProviders.categoryId, categoryId));
    }
    if (location) {
      conditions.push(like(serviceProviders.location, `%${location}%`));
    }
    
    return await db.select().from(serviceProviders).where(and(...conditions)).orderBy(desc(serviceProviders.rating));
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

  // Provider Configuration - Menus
  async getProviderMenus(serviceProviderId: string): Promise<ProviderMenu[]> {
    return await db.select().from(providerMenus)
      .where(eq(providerMenus.serviceProviderId, serviceProviderId))
      .orderBy(asc(providerMenus.createdAt));
  }

  async createProviderMenu(menu: InsertProviderMenu): Promise<ProviderMenu> {
    const [newMenu] = await db.insert(providerMenus).values(menu).returning();
    return newMenu;
  }

  async updateProviderMenu(id: string, updates: Partial<InsertProviderMenu>): Promise<ProviderMenu> {
    const [updatedMenu] = await db.update(providerMenus)
      .set(updates)
      .where(eq(providerMenus.id, id))
      .returning();
    return updatedMenu;
  }

  async deleteProviderMenu(id: string): Promise<void> {
    await db.delete(providerMenus).where(eq(providerMenus.id, id));
  }

  // Provider Configuration - Menu Items
  async getMenuItems(menuId: string): Promise<MenuItem[]> {
    return await db.select().from(menuItems)
      .where(eq(menuItems.menuId, menuId))
      .orderBy(asc(menuItems.createdAt));
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const [newItem] = await db.insert(menuItems).values(item).returning();
    return newItem;
  }

  async updateMenuItem(id: string, updates: Partial<InsertMenuItem>): Promise<MenuItem> {
    const [updatedItem] = await db.update(menuItems)
      .set(updates)
      .where(eq(menuItems.id, id))
      .returning();
    return updatedItem;
  }

  async deleteMenuItem(id: string): Promise<void> {
    await db.delete(menuItems).where(eq(menuItems.id, id));
  }

  // Provider Configuration - Task Configs
  async getProviderTaskConfigs(serviceProviderId: string): Promise<ProviderTaskConfig[]> {
    return await db.select().from(providerTaskConfigs)
      .where(eq(providerTaskConfigs.serviceProviderId, serviceProviderId));
  }

  async upsertProviderTaskConfig(config: InsertProviderTaskConfig): Promise<ProviderTaskConfig> {
    const [result] = await db.insert(providerTaskConfigs)
      .values(config)
      .onConflictDoUpdate({
        target: [providerTaskConfigs.serviceProviderId, providerTaskConfigs.taskId],
        set: {
          isEnabled: config.isEnabled,
          customPrice: config.customPrice,
        },
      })
      .returning();
    return result;
  }

  async deleteProviderTaskConfig(id: string): Promise<void> {
    await db.delete(providerTaskConfigs).where(eq(providerTaskConfigs.id, id));
  }

  // Provider Configuration - Materials
  async getProviderMaterials(serviceProviderId: string): Promise<ProviderMaterial[]> {
    return await db.select().from(providerMaterials)
      .where(eq(providerMaterials.serviceProviderId, serviceProviderId))
      .orderBy(asc(providerMaterials.createdAt));
  }

  async createProviderMaterial(material: InsertProviderMaterial): Promise<ProviderMaterial> {
    const [newMaterial] = await db.insert(providerMaterials).values(material).returning();
    return newMaterial;
  }

  async updateProviderMaterial(id: string, updates: Partial<InsertProviderMaterial>): Promise<ProviderMaterial> {
    const [updatedMaterial] = await db.update(providerMaterials)
      .set(updates)
      .where(eq(providerMaterials.id, id))
      .returning();
    return updatedMaterial;
  }

  async deleteProviderMaterial(id: string): Promise<void> {
    await db.delete(providerMaterials).where(eq(providerMaterials.id, id));
  }

  // Service Tasks
  async getServiceTasks(categoryId: string): Promise<ServiceTask[]> {
    return await db.select().from(serviceTasks)
      .where(eq(serviceTasks.categoryId, categoryId))
      .orderBy(asc(serviceTasks.taskName));
  }

  // Service Orders
  async createServiceOrder(order: InsertServiceOrder, items: InsertServiceOrderItem[]): Promise<ServiceOrder> {
    const [newOrder] = await db.insert(serviceOrders).values(order).returning();
    
    if (items.length > 0) {
      const itemsWithOrderId = items.map(item => ({
        ...item,
        serviceOrderId: newOrder.id,
      }));
      await db.insert(serviceOrderItems).values(itemsWithOrderId);
    }
    
    return newOrder;
  }

  async getServiceOrder(id: string): Promise<ServiceOrder | undefined> {
    const [order] = await db.select().from(serviceOrders).where(eq(serviceOrders.id, id));
    return order;
  }

  async getServiceOrderByCode(orderCode: string): Promise<ServiceOrder | undefined> {
    const [order] = await db.select().from(serviceOrders).where(eq(serviceOrders.orderCode, orderCode));
    return order;
  }

  async getClientServiceOrders(clientId: string): Promise<ServiceOrder[]> {
    return await db.select().from(serviceOrders)
      .where(eq(serviceOrders.clientId, clientId))
      .orderBy(desc(serviceOrders.createdAt));
  }

  async getProviderServiceOrders(providerId: string): Promise<ServiceOrder[]> {
    return await db.select().from(serviceOrders)
      .where(eq(serviceOrders.serviceProviderId, providerId))
      .orderBy(desc(serviceOrders.createdAt));
  }

  async updateServiceOrderStatus(id: string, status: string): Promise<ServiceOrder> {
    const [updatedOrder] = await db.update(serviceOrders)
      .set({ status, updatedAt: new Date() })
      .where(eq(serviceOrders.id, id))
      .returning();
    return updatedOrder;
  }

  async getServiceOrderItems(orderId: string): Promise<ServiceOrderItem[]> {
    return await db.select().from(serviceOrderItems)
      .where(eq(serviceOrderItems.serviceOrderId, orderId))
      .orderBy(asc(serviceOrderItems.createdAt));
  }

  async updateServiceOrderItem(id: string, updates: Partial<ServiceOrderItem>): Promise<ServiceOrderItem> {
    const [updatedItem] = await db.update(serviceOrderItems)
      .set(updates)
      .where(eq(serviceOrderItems.id, id))
      .returning();
    return updatedItem;
  }

  // Provider Availability
  async getProviderAvailability(providerId: string, startDate: string, endDate: string): Promise<ProviderAvailability[]> {
    return await db.select().from(providerAvailability)
      .where(
        and(
          eq(providerAvailability.serviceProviderId, providerId),
          gte(providerAvailability.date, startDate),
          lte(providerAvailability.date, endDate)
        )
      )
      .orderBy(asc(providerAvailability.date));
  }

  async createProviderAvailability(availability: InsertProviderAvailability): Promise<ProviderAvailability> {
    const [newAvailability] = await db.insert(providerAvailability).values(availability).returning();
    return newAvailability;
  }

  async updateProviderAvailability(id: string, updates: Partial<InsertProviderAvailability>): Promise<ProviderAvailability> {
    const [updatedAvailability] = await db.update(providerAvailability)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(providerAvailability.id, id))
      .returning();
    return updatedAvailability;
  }

  async deleteProviderAvailability(id: string): Promise<void> {
    await db.delete(providerAvailability).where(eq(providerAvailability.id, id));
  }
}

export const storage = new DatabaseStorage();
