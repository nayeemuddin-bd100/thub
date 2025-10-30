import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  uuid,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["admin", "property_owner", "service_provider", "client", "country_manager"] }).notNull().default("client"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Properties table
export const properties = pgTable("properties", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  location: varchar("location").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  pricePerNight: decimal("price_per_night", { precision: 10, scale: 2 }).notNull(),
  maxGuests: integer("max_guests").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  amenities: jsonb("amenities").default([]),
  images: jsonb("images").default([]),
  videos: jsonb("videos").default([]),
  isActive: boolean("is_active").default(true),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service categories table
export const serviceCategories = pgTable("service_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Service providers table
export const serviceProviders = pgTable("service_providers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  categoryId: uuid("category_id").references(() => serviceCategories.id).notNull(),
  businessName: varchar("business_name").notNull(),
  description: text("description"),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  fixedRate: decimal("fixed_rate", { precision: 10, scale: 2 }),
  availability: jsonb("availability").default([]),
  location: varchar("location"),
  radius: integer("radius").default(50),
  whatsappNumber: varchar("whatsapp_number"),
  certifications: jsonb("certifications").default([]),
  portfolio: jsonb("portfolio").default([]),
  approvalStatus: varchar("approval_status", { enum: ["pending", "approved", "rejected"] }).default("pending"),
  rejectionReason: text("rejection_reason"),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: varchar("client_id").references(() => users.id).notNull(),
  propertyId: uuid("property_id").references(() => properties.id).notNull(),
  bookingCode: varchar("booking_code").unique().notNull(),
  checkIn: timestamp("check_in").notNull(),
  checkOut: timestamp("check_out").notNull(),
  guests: integer("guests").notNull(),
  propertyTotal: decimal("property_total", { precision: 10, scale: 2 }).notNull(),
  servicesTotal: decimal("services_total", { precision: 10, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { enum: ["pending", "confirmed", "completed", "cancelled"] }).default("pending"),
  paymentStatus: varchar("payment_status", { enum: ["pending", "paid", "refunded"] }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service bookings table
export const serviceBookings = pgTable("service_bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id").references(() => bookings.id).notNull(),
  serviceProviderId: uuid("service_provider_id").references(() => serviceProviders.id),
  serviceName: varchar("service_name").notNull(),
  serviceDate: timestamp("service_date").notNull(),
  duration: integer("duration"), // in hours
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { enum: ["pending", "awaiting_assignment", "assigned", "confirmed", "completed", "cancelled"] }).default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  reviewerId: varchar("reviewer_id").references(() => users.id).notNull(),
  revieweeId: varchar("reviewee_id").references(() => users.id),
  propertyId: uuid("property_id").references(() => properties.id),
  serviceProviderId: uuid("service_provider_id").references(() => serviceProviders.id),
  bookingId: uuid("booking_id").references(() => bookings.id),
  rating: integer("rating").notNull(),
  title: varchar("title"),
  comment: text("comment"),
  images: jsonb("images").default([]),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages table
export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  receiverId: varchar("receiver_id").references(() => users.id).notNull(),
  bookingId: uuid("booking_id").references(() => bookings.id),
  content: text("content").notNull(),
  messageType: varchar("message_type", { enum: ["text", "image", "file"] }).default("text"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Property-Service Provider associations
export const propertyServices = pgTable("property_services", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyId: uuid("property_id").references(() => properties.id).notNull(),
  serviceProviderId: uuid("service_provider_id").references(() => serviceProviders.id).notNull(),
  isRecommended: boolean("is_recommended").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Service task templates (maid tasks, transport tasks, etc.)
export const serviceTasks = pgTable("service_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id").references(() => serviceCategories.id).notNull(),
  taskCode: varchar("task_code").notNull(),
  taskName: varchar("task_name").notNull(),
  description: text("description"),
  isRequired: boolean("is_required").default(false),
  defaultDuration: integer("default_duration"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Service task assignments for bookings
export const serviceTaskAssignments = pgTable("service_task_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  serviceBookingId: uuid("service_booking_id").references(() => serviceBookings.id).notNull(),
  taskId: uuid("task_id").references(() => serviceTasks.id).notNull(),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  completedBy: varchar("completed_by").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job assignments (country manager assigns providers to clients)
export const jobAssignments = pgTable("job_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  serviceBookingId: uuid("service_booking_id").references(() => serviceBookings.id).notNull(),
  assignedBy: varchar("assigned_by").references(() => users.id).notNull(),
  serviceProviderId: uuid("service_provider_id").references(() => serviceProviders.id).notNull(),
  status: varchar("status", { enum: ["pending", "accepted", "rejected", "cancelled"] }).default("pending"),
  rejectionReason: text("rejection_reason"),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type", { 
    enum: ["job_assigned", "job_accepted", "job_rejected", "task_completed", "booking_confirmed", "payment_received", "message_received"] 
  }).notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  relatedId: uuid("related_id"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment records table
export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id").references(() => bookings.id).notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id").unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("usd"),
  status: varchar("status", { enum: ["pending", "succeeded", "failed", "refunded"] }).default("pending"),
  paymentMethod: varchar("payment_method"),
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }).default("0"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Provider menus table (for chef services)
export const providerMenus = pgTable("provider_menus", {
  id: uuid("id").defaultRandom().primaryKey(),
  serviceProviderId: uuid("service_provider_id").references(() => serviceProviders.id).notNull(),
  categoryName: varchar("category_name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Menu items table (for chef services)
export const menuItems = pgTable("menu_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  menuId: uuid("menu_id").references(() => providerMenus.id).notNull(),
  dishName: varchar("dish_name").notNull(),
  description: text("description"),
  cuisineType: varchar("cuisine_type"),
  dietaryTags: jsonb("dietary_tags").default([]),
  preparationTime: integer("preparation_time"),
  servings: integer("servings"),
  price: decimal("price", { precision: 10, scale: 2 }),
  ingredients: jsonb("ingredients").default([]),
  images: jsonb("images").default([]),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Provider task configurations (maid can enable/disable and price tasks)
export const providerTaskConfigs = pgTable("provider_task_configs", {
  id: uuid("id").defaultRandom().primaryKey(),
  serviceProviderId: uuid("service_provider_id").references(() => serviceProviders.id).notNull(),
  taskId: uuid("task_id").references(() => serviceTasks.id).notNull(),
  isEnabled: boolean("is_enabled").default(true),
  customPrice: decimal("custom_price", { precision: 10, scale: 2 }),
  estimatedDuration: integer("estimated_duration"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Provider materials/supplies (what materials provider offers or requires)
export const providerMaterials = pgTable("provider_materials", {
  id: uuid("id").defaultRandom().primaryKey(),
  serviceProviderId: uuid("service_provider_id").references(() => serviceProviders.id).notNull(),
  materialName: varchar("material_name").notNull(),
  materialType: varchar("material_type", { enum: ["cleaning_supplies", "equipment", "ingredients", "other"] }).notNull(),
  providedBy: varchar("provided_by", { enum: ["provider", "client", "either"] }).default("provider"),
  additionalCost: decimal("additional_cost", { precision: 10, scale: 2 }).default("0"),
  isRequired: boolean("is_required").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Provider availability calendar
export const providerAvailability = pgTable("provider_availability", {
  id: uuid("id").defaultRandom().primaryKey(),
  serviceProviderId: uuid("service_provider_id").references(() => serviceProviders.id).notNull(),
  date: date("date").notNull(),
  startTime: varchar("start_time").notNull(),
  endTime: varchar("end_time").notNull(),
  isAvailable: boolean("is_available").default(true),
  maxBookings: integer("max_bookings").default(1),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service orders (when clients order extra services)
export const serviceOrders = pgTable("service_orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id").references(() => bookings.id),
  clientId: uuid("client_id").references(() => users.id).notNull(),
  serviceProviderId: uuid("service_provider_id").references(() => serviceProviders.id).notNull(),
  orderCode: varchar("order_code").unique().notNull(),
  serviceDate: date("service_date").notNull(),
  startTime: varchar("start_time").notNull(),
  endTime: varchar("end_time"),
  duration: integer("duration"),
  status: varchar("status", { 
    enum: ["pending", "confirmed", "in_progress", "completed", "cancelled", "rejected"] 
  }).default("pending"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: varchar("payment_status", { enum: ["pending", "paid", "refunded"] }).default("pending"),
  specialInstructions: text("special_instructions"),
  providerNotes: text("provider_notes"),
  cancellationReason: text("cancellation_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service order items (selected menu items or tasks)
export const serviceOrderItems = pgTable("service_order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  serviceOrderId: uuid("service_order_id").references(() => serviceOrders.id).notNull(),
  itemType: varchar("item_type", { enum: ["menu_item", "task", "custom"] }).notNull(),
  menuItemId: uuid("menu_item_id").references(() => menuItems.id),
  taskId: uuid("task_id").references(() => serviceTasks.id),
  itemName: varchar("item_name").notNull(),
  quantity: integer("quantity").default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  properties: many(properties),
  serviceProviders: many(serviceProviders),
  bookings: many(bookings),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  reviewsGiven: many(reviews, { relationName: "reviewer" }),
  reviewsReceived: many(reviews, { relationName: "reviewee" }),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  owner: one(users, {
    fields: [properties.ownerId],
    references: [users.id],
  }),
  bookings: many(bookings),
  reviews: many(reviews),
  services: many(propertyServices),
}));

export const serviceCategoriesRelations = relations(serviceCategories, ({ many }) => ({
  providers: many(serviceProviders),
}));

export const serviceProvidersRelations = relations(serviceProviders, ({ one, many }) => ({
  user: one(users, {
    fields: [serviceProviders.userId],
    references: [users.id],
  }),
  category: one(serviceCategories, {
    fields: [serviceProviders.categoryId],
    references: [serviceCategories.id],
  }),
  serviceBookings: many(serviceBookings),
  reviews: many(reviews),
  properties: many(propertyServices),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  client: one(users, {
    fields: [bookings.clientId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [bookings.propertyId],
    references: [properties.id],
  }),
  serviceBookings: many(serviceBookings),
  reviews: many(reviews),
  messages: many(messages),
}));

export const serviceBookingsRelations = relations(serviceBookings, ({ one }) => ({
  booking: one(bookings, {
    fields: [serviceBookings.bookingId],
    references: [bookings.id],
  }),
  serviceProvider: one(serviceProviders, {
    fields: [serviceBookings.serviceProviderId],
    references: [serviceProviders.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
    relationName: "reviewer",
  }),
  reviewee: one(users, {
    fields: [reviews.revieweeId],
    references: [users.id],
    relationName: "reviewee",
  }),
  property: one(properties, {
    fields: [reviews.propertyId],
    references: [properties.id],
  }),
  serviceProvider: one(serviceProviders, {
    fields: [reviews.serviceProviderId],
    references: [serviceProviders.id],
  }),
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
  booking: one(bookings, {
    fields: [messages.bookingId],
    references: [bookings.id],
  }),
}));

export const propertyServicesRelations = relations(propertyServices, ({ one }) => ({
  property: one(properties, {
    fields: [propertyServices.propertyId],
    references: [properties.id],
  }),
  serviceProvider: one(serviceProviders, {
    fields: [propertyServices.serviceProviderId],
    references: [serviceProviders.id],
  }),
}));

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
  reviewCount: true,
});
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

export const insertServiceProviderSchema = createInsertSchema(serviceProviders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
  reviewCount: true,
  isVerified: true,
});
export type InsertServiceProvider = z.infer<typeof insertServiceProviderSchema>;
export type ServiceProvider = typeof serviceProviders.$inferSelect;

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  bookingCode: true,
});
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isVerified: true,
});
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type ServiceBooking = typeof serviceBookings.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type PropertyService = typeof propertyServices.$inferSelect;
export type ServiceTask = typeof serviceTasks.$inferSelect;
export type ServiceTaskAssignment = typeof serviceTaskAssignments.$inferSelect;
export type JobAssignment = typeof jobAssignments.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Payment = typeof payments.$inferSelect;

export const insertServiceTaskSchema = createInsertSchema(serviceTasks).omit({
  id: true,
  createdAt: true,
});
export type InsertServiceTask = z.infer<typeof insertServiceTaskSchema>;

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type ProviderMenu = typeof providerMenus.$inferSelect;
export type MenuItem = typeof menuItems.$inferSelect;
export type ProviderTaskConfig = typeof providerTaskConfigs.$inferSelect;
export type ProviderMaterial = typeof providerMaterials.$inferSelect;

export const insertProviderMenuSchema = createInsertSchema(providerMenus).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProviderMenu = z.infer<typeof insertProviderMenuSchema>;

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;

export const insertProviderTaskConfigSchema = createInsertSchema(providerTaskConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProviderTaskConfig = z.infer<typeof insertProviderTaskConfigSchema>;

export const insertProviderMaterialSchema = createInsertSchema(providerMaterials).omit({
  id: true,
  createdAt: true,
});
export type InsertProviderMaterial = z.infer<typeof insertProviderMaterialSchema>;

// Service Orders
export type ServiceOrder = typeof serviceOrders.$inferSelect;
export type ServiceOrderItem = typeof serviceOrderItems.$inferSelect;
export type ProviderAvailability = typeof providerAvailability.$inferSelect;

export const insertServiceOrderSchema = createInsertSchema(serviceOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  orderCode: true,
});
export type InsertServiceOrder = z.infer<typeof insertServiceOrderSchema>;

export const insertServiceOrderItemSchema = createInsertSchema(serviceOrderItems).omit({
  id: true,
  createdAt: true,
});
export type InsertServiceOrderItem = z.infer<typeof insertServiceOrderItemSchema>;

export const insertProviderAvailabilitySchema = createInsertSchema(providerAvailability).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProviderAvailability = z.infer<typeof insertProviderAvailabilitySchema>;
