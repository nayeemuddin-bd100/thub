import { relations } from "drizzle-orm";
import {
    boolean,
    date,
    decimal,
    index,
    integer,
    jsonb,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
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
    (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table
export const users = pgTable("users", {
    id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: varchar("email").unique().notNull(),
    password: varchar("password").notNull(),
    firstName: varchar("first_name"),
    lastName: varchar("last_name"),
    profileImageUrl: varchar("profile_image_url"),
    role: varchar("role", {
        enum: [
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
        ],
    })
        .notNull()
        .default("client"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Role change requests table
export const roleChangeRequests = pgTable("role_change_requests", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("user_id")
        .references(() => users.id)
        .notNull(),
    requestedRole: varchar("requested_role", {
        enum: ["client", "property_owner", "service_provider"],
    }).notNull(),
    status: varchar("status", {
        enum: ["pending", "approved", "rejected"],
    })
        .notNull()
        .default("pending"),
    requestNote: text("request_note"),
    adminNote: text("admin_note"),
    requestedAt: timestamp("requested_at").defaultNow().notNull(),
    reviewedAt: timestamp("reviewed_at"),
    reviewedBy: varchar("reviewed_by").references(() => users.id),
});

// Properties table
export const properties = pgTable("properties", {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id").references(() => users.id)
        .notNull(),
    title: varchar("title").notNull(),
    description: text("description"),
    location: varchar("location").notNull(),
    latitude: decimal("latitude", { precision: 10, scale: 8 }),
    longitude: decimal("longitude", { precision: 11, scale: 8 }),
    pricePerNight: decimal("price_per_night", {
        precision: 10,
        scale: 2,
    }).notNull(),
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
    userId: uuid("user_id").references(() => users.id)
        .notNull(),
    categoryId: uuid("category_id").references(() => serviceCategories.id)
        .notNull(),
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
    approvalStatus: varchar("approval_status", {
        enum: ["pending", "approved", "rejected"],
    }).default("pending"),
    rejectionReason: text("rejection_reason"),
    isVerified: boolean("is_verified").default(false),
    isActive: boolean("is_active").default(true),
    rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
    reviewCount: integer("review_count").default(0),

    yearsExperience: integer("years_experience"),
    languages: jsonb("languages").default([]),
    photoUrls: jsonb("photo_urls").default([]),
    profilePhotoUrl: varchar("profile_photo_url"),
    videoUrl: varchar("video_url"),
    awards: jsonb("awards").default([]),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Bookings table
export const bookings = pgTable("bookings", {
    id: uuid("id").defaultRandom().primaryKey(),
    clientId: uuid("client_id").references(() => users.id)
        .notNull(),
    propertyId: uuid("property_id").references(() => properties.id)
        .notNull(),
    bookingCode: varchar("booking_code").unique().notNull(),
    checkIn: timestamp("check_in").notNull(),
    checkOut: timestamp("check_out").notNull(),
    guests: integer("guests").notNull(),
    propertyTotal: decimal("property_total", {
        precision: 10,
        scale: 2,
    }).notNull(),
    servicesTotal: decimal("services_total", {
        precision: 10,
        scale: 2,
    }).default("0"),
    discountAmount: decimal("discount_amount", {
        precision: 10,
        scale: 2,
    }).default("0"),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    status: varchar("status", {
        enum: [
            "pending",
            "pending_payment",
            "confirmed",
            "completed",
            "cancelled",
        ],
    }).default("pending"),
    paymentStatus: varchar("payment_status", {
        enum: ["pending", "paid", "refunded"],
    }).default("pending"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Service bookings table
export const serviceBookings = pgTable("service_bookings", {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingId: uuid("booking_id").references(() => bookings.id)
        .notNull(),
    serviceProviderId: uuid("service_provider_id").references(
        () => serviceProviders.id
    ),
    serviceName: varchar("service_name").notNull(),
    serviceDate: timestamp("service_date").notNull(),
    duration: integer("duration"), // in hours
    rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
    status: varchar("status", {
        enum: [
            "pending",
            "awaiting_assignment",
            "assigned",
            "confirmed",
            "completed",
            "cancelled",
        ],
    }).default("pending"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
    id: uuid("id").defaultRandom().primaryKey(),
    reviewerId: uuid("reviewer_id").references(() => users.id)
        .notNull(),
    revieweeId: uuid("reviewee_id").references(() => users.id),
    propertyId: uuid("property_id").references(() => properties.id),
    serviceProviderId: uuid("service_provider_id").references(
        () => serviceProviders.id
    ),
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
    senderId: uuid("sender_id").references(() => users.id)
        .notNull(),
    receiverId: uuid("receiver_id").references(() => users.id)
        .notNull(),
    bookingId: uuid("booking_id").references(() => bookings.id),
    content: text("content").notNull(),
    messageType: varchar("message_type", {
        enum: ["text", "image", "file"],
    }).default("text"),
    isRead: boolean("is_read").default(false),
    createdAt: timestamp("created_at").defaultNow(),
});

// Property-Service Provider associations
export const propertyServices = pgTable("property_services", {
    id: uuid("id").defaultRandom().primaryKey(),
    propertyId: uuid("property_id").references(() => properties.id)
        .notNull(),
    serviceProviderId: uuid("service_provider_id").references(() => serviceProviders.id)
        .notNull(),
    isRecommended: boolean("is_recommended").default(false),
    createdAt: timestamp("created_at").defaultNow(),
});

// Service task templates (maid tasks, transport tasks, etc.)
export const serviceTasks = pgTable("service_tasks", {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id").references(() => serviceCategories.id)
        .notNull(),
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
    serviceBookingId: uuid("service_booking_id").references(() => serviceBookings.id)
        .notNull(),
    taskId: uuid("task_id").references(() => serviceTasks.id)
        .notNull(),
    isCompleted: boolean("is_completed").default(false),
    completedAt: timestamp("completed_at"),
    completedBy: uuid("completed_by").references(() => users.id),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Job assignments (country manager assigns providers to clients)
export const jobAssignments = pgTable("job_assignments", {
    id: uuid("id").defaultRandom().primaryKey(),
    serviceBookingId: uuid("service_booking_id").references(() => serviceBookings.id)
        .notNull(),
    assignedBy: uuid("assigned_by").references(() => users.id)
        .notNull(),
    serviceProviderId: uuid("service_provider_id").references(() => serviceProviders.id)
        .notNull(),
    status: varchar("status", {
        enum: ["pending", "accepted", "rejected", "cancelled"],
    }).default("pending"),
    rejectionReason: text("rejection_reason"),
    respondedAt: timestamp("responded_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id)
        .notNull(),
    type: varchar("type", {
        enum: [
            "job_assigned",
            "job_accepted",
            "job_rejected",
            "task_completed",
            "booking_confirmed",
            "payment_received",
            "message_received",
            "booking",
            "payment",
            "order",
            "message",
            "review",
            "approval",
            "rejection",
            "cancellation",
        ],
    }).notNull(),
    title: varchar("title").notNull(),
    message: text("message").notNull(),
    relatedId: varchar("related_id"),
    isRead: boolean("is_read").default(false),
    createdAt: timestamp("created_at").defaultNow(),
});

// Payment records table
export const payments = pgTable("payments", {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingId: uuid("booking_id").references(() => bookings.id)
        .notNull(),
    stripePaymentIntentId: varchar("stripe_payment_intent_id").unique(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency").default("usd"),
    status: varchar("status", {
        enum: ["pending", "succeeded", "failed", "refunded"],
    }).default("pending"),
    paymentMethod: varchar("payment_method"),
    refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }).default(
        "0"
    ),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Provider menus table (for chef services)
export const providerMenus = pgTable("provider_menus", {
    id: uuid("id").defaultRandom().primaryKey(),
    serviceProviderId: uuid("service_provider_id").references(() => serviceProviders.id)
        .notNull(),
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
    menuId: uuid("menu_id").references(() => providerMenus.id)
        .notNull(),
    dishName: varchar("dish_name").notNull(),
    description: text("description"),
    cuisineType: varchar("cuisine_type"),
    dietaryTags: jsonb("dietary_tags").default([]),
    preparationTime: integer("preparation_time"),
    servings: integer("servings"),
    price: decimal("price", { precision: 10, scale: 2 }),
    ingredients: jsonb("ingredients").default([]),
    photoUrl: varchar("photo_url"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Provider task configurations (maid can enable/disable and price tasks)
export const providerTaskConfigs = pgTable("provider_task_configs", {
    id: uuid("id").defaultRandom().primaryKey(),
    serviceProviderId: uuid("service_provider_id").references(() => serviceProviders.id)
        .notNull(),
    taskId: uuid("task_id").references(() => serviceTasks.id)
        .notNull(),
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
    serviceProviderId: uuid("service_provider_id").references(() => serviceProviders.id)
        .notNull(),
    materialName: varchar("material_name").notNull(),
    materialType: varchar("material_type", {
        enum: ["cleaning_supplies", "equipment", "ingredients", "other"],
    }).notNull(),
    providedBy: varchar("provided_by", {
        enum: ["provider", "client", "either"],
    }).default("provider"),
    additionalCost: decimal("additional_cost", {
        precision: 10,
        scale: 2,
    }).default("0"),
    isRequired: boolean("is_required").default(false),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
});

// Provider availability calendar
export const providerAvailability = pgTable("provider_availability", {
    id: uuid("id").defaultRandom().primaryKey(),
    serviceProviderId: uuid("service_provider_id").references(() => serviceProviders.id)
        .notNull(),
    date: date("date").notNull(),
    startTime: varchar("start_time").notNull(),
    endTime: varchar("end_time").notNull(),
    isAvailable: boolean("is_available").default(true),
    maxBookings: integer("max_bookings").default(1),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Provider pricing configuration
export const providerPricing = pgTable("provider_pricing", {
    id: uuid("id").defaultRandom().primaryKey(),
    serviceProviderId: uuid("service_provider_id").references(() => serviceProviders.id)
        .unique()
        .notNull(),
    minimumOrder: decimal("minimum_order", { precision: 10, scale: 2 }).default(
        "0"
    ),
    weekendSurcharge: decimal("weekend_surcharge", {
        precision: 5,
        scale: 2,
    }).default("0"),
    holidaySurcharge: decimal("holiday_surcharge", {
        precision: 5,
        scale: 2,
    }).default("0"),
    lastMinuteFee: decimal("last_minute_fee", {
        precision: 10,
        scale: 2,
    }).default("0"),
    earlyBirdDiscount: decimal("early_bird_discount", {
        precision: 5,
        scale: 2,
    }).default("0"),
    recurringDiscount: decimal("recurring_discount", {
        precision: 5,
        scale: 2,
    }).default("0"),
    travelFeeFixed: decimal("travel_fee_fixed", {
        precision: 10,
        scale: 2,
    }).default("0"),
    travelFeePerKm: decimal("travel_fee_per_km", {
        precision: 10,
        scale: 2,
    }).default("0"),
    materialMarkup: decimal("material_markup", {
        precision: 5,
        scale: 2,
    }).default("0"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Service orders (when clients order extra services)
export const serviceOrders = pgTable("service_orders", {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingId: uuid("booking_id").references(() => bookings.id),
    clientId: uuid("client_id").references(() => users.id)
        .notNull(),
    serviceProviderId: uuid("service_provider_id").references(() => serviceProviders.id)
        .notNull(),
    orderCode: varchar("order_code").unique().notNull(),
    serviceDate: date("service_date").notNull(),
    startTime: varchar("start_time").notNull(),
    endTime: varchar("end_time"),
    duration: integer("duration"),
    status: varchar("status", {
        enum: [
            "pending",
            "pending_payment",
            "confirmed",
            "pending_acceptance",
            "accepted",
            "in_progress",
            "completed",
            "cancelled",
            "rejected",
        ],
    }).default("pending"),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    platformFeePercentage: decimal("platform_fee_percentage", { precision: 5, scale: 2 }).default("15.00"),
    platformFeeAmount: decimal("platform_fee_amount", { precision: 10, scale: 2 }).default("0"),
    providerAmount: decimal("provider_amount", { precision: 10, scale: 2 }).default("0"),
    paymentStatus: varchar("payment_status", {
        enum: ["pending", "paid", "refunded"],
    }).default("pending"),
    paymentIntentId: varchar("payment_intent_id"),
    stripeRefundId: varchar("stripe_refund_id"),
    specialInstructions: text("special_instructions"),
    providerNotes: text("provider_notes"),
    cancellationReason: text("cancellation_reason"),
    rejectionReason: text("rejection_reason"),
    serviceLocation: varchar("service_location"), // City where service is provided
    serviceCountry: varchar("service_country"), // Country where service is provided
    acceptedAt: timestamp("accepted_at"),
    completedAt: timestamp("completed_at"),
    cancelledAt: timestamp("cancelled_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Service order items (selected menu items or tasks)
export const serviceOrderItems = pgTable("service_order_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    serviceOrderId: uuid("service_order_id").references(() => serviceOrders.id)
        .notNull(),
    itemType: varchar("item_type", {
        enum: ["menu_item", "task", "custom"],
    }).notNull(),
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

// Shopping cart items (for service booking cart)
export const cartItems = pgTable("cart_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("user_id").references(() => users.id)
        .notNull(),
    serviceProviderId: uuid("service_provider_id").references(() => serviceProviders.id)
        .notNull(),
    serviceDate: date("service_date").notNull(),
    startTime: varchar("start_time").notNull(),
    endTime: varchar("end_time"),
    duration: integer("duration"),
    items: jsonb("items").notNull().default([]), // Array of {itemType, itemId, itemName, quantity, unitPrice, totalPrice}
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    specialInstructions: text("special_instructions"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Booking events audit log (track all status changes and actions)
export const bookingEvents = pgTable("booking_events", {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingId: uuid("booking_id").references(() => bookings.id),
    serviceOrderId: uuid("service_order_id").references(() => serviceOrders.id),
    eventType: varchar("event_type", {
        enum: [
            "created",
            "status_changed",
            "payment_received",
            "payment_refunded",
            "provider_assigned",
            "provider_accepted",
            "provider_rejected",
            "started",
            "completed",
            "cancelled",
            "admin_override",
        ],
    }).notNull(),
    oldStatus: varchar("old_status"),
    newStatus: varchar("new_status"),
    performedBy: varchar("performed_by").references(() => users.id),
    performedByRole: varchar("performed_by_role"),
    notes: text("notes"),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at").defaultNow(),
});

// Favorites (clients save favorite properties and service providers)
export const favorites = pgTable("favorites", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("user_id").references(() => users.id)
        .notNull(),
    favoriteType: varchar("favorite_type", {
        enum: ["property", "service_provider"],
    }).notNull(),
    propertyId: uuid("property_id").references(() => properties.id),
    serviceProviderId: uuid("service_provider_id").references(
        () => serviceProviders.id
    ),
    createdAt: timestamp("created_at").defaultNow(),
});

// Promotional codes
export const promotionalCodes = pgTable("promotional_codes", {
    id: uuid("id").defaultRandom().primaryKey(),
    code: varchar("code").unique().notNull(),
    description: text("description"),
    discountType: varchar("discount_type", {
        enum: ["percentage", "fixed_amount"],
    }).notNull(),
    discountValue: decimal("discount_value", {
        precision: 10,
        scale: 2,
    }).notNull(),
    minimumPurchase: decimal("minimum_purchase", {
        precision: 10,
        scale: 2,
    }).default("0"),
    maxUses: integer("max_uses"),
    usedCount: integer("used_count").default(0),
    validFrom: timestamp("valid_from").notNull(),
    validUntil: timestamp("valid_until").notNull(),
    applicableTo: varchar("applicable_to", {
        enum: ["all", "properties", "services"],
    }).default("all"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
});

// Promotional code usage tracking
export const promoCodeUsage = pgTable("promo_code_usage", {
    id: uuid("id").defaultRandom().primaryKey(),
    promoCodeId: uuid("promo_code_id").references(() => promotionalCodes.id)
        .notNull(),
    userId: varchar("user_id").references(() => users.id)
        .notNull(),
    bookingId: uuid("booking_id").references(() => bookings.id),
    serviceOrderId: uuid("service_order_id").references(() => serviceOrders.id),
    discountAmount: decimal("discount_amount", {
        precision: 10,
        scale: 2,
    }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

// Loyalty points
export const loyaltyPoints = pgTable("loyalty_points", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id)
        .notNull(),
    points: integer("points").default(0),
    lifetimePoints: integer("lifetime_points").default(0),
    tier: varchar("tier", {
        enum: ["bronze", "silver", "gold", "platinum"],
    }).default("bronze"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Loyalty points transactions
export const loyaltyPointsTransactions = pgTable(
    "loyalty_points_transactions",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: uuid("user_id").references(() => users.id)
            .notNull(),
        points: integer("points").notNull(),
        transactionType: varchar("transaction_type", {
            enum: ["earned", "redeemed", "expired", "adjustment"],
        }).notNull(),
        reason: varchar("reason").notNull(),
        bookingId: uuid("booking_id").references(() => bookings.id),
        serviceOrderId: uuid("service_order_id").references(
            () => serviceOrders.id
        ),
        expiresAt: timestamp("expires_at"),
        createdAt: timestamp("created_at").defaultNow(),
    }
);

// Booking cancellations and refunds
export const bookingCancellations = pgTable("booking_cancellations", {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingId: uuid("booking_id").references(() => bookings.id)
        .notNull(),
    requestedBy: uuid("requested_by").references(() => users.id)
        .notNull(),
    reason: text("reason").notNull(),
    cancellationFee: decimal("cancellation_fee", {
        precision: 10,
        scale: 2,
    }).default("0"),
    refundAmount: decimal("refund_amount", {
        precision: 10,
        scale: 2,
    }).notNull(),
    status: varchar("status", {
        enum: ["pending", "approved", "rejected", "refunded"],
    }).default("pending"),
    approvedBy: uuid("approved_by").references(() => users.id),
    rejectionReason: text("rejection_reason"),
    refundedAt: timestamp("refunded_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Trip plans / Itineraries
export const tripPlans = pgTable("trip_plans", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id)
        .notNull(),
    title: varchar("title").notNull(),
    description: text("description"),
    destination: varchar("destination").notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    status: varchar("status", {
        enum: ["planning", "booked", "completed", "cancelled"],
    }).default("planning"),
    isPublic: boolean("is_public").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Trip plan items (activities, bookings, notes)
export const tripPlanItems = pgTable("trip_plan_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    tripPlanId: uuid("trip_plan_id").references(() => tripPlans.id)
        .notNull(),
    itemType: varchar("item_type", {
        enum: ["booking", "activity", "note", "reminder"],
    }).notNull(),
    bookingId: uuid("booking_id").references(() => bookings.id),
    title: varchar("title").notNull(),
    description: text("description"),
    scheduledDate: date("scheduled_date"),
    scheduledTime: varchar("scheduled_time"),
    location: varchar("location"),
    cost: decimal("cost", { precision: 10, scale: 2 }),
    status: varchar("status", {
        enum: ["pending", "confirmed", "completed", "cancelled"],
    }).default("pending"),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow(),
});

// Property seasonal pricing
export const propertySeasonalPricing = pgTable("property_seasonal_pricing", {
    id: uuid("id").defaultRandom().primaryKey(),
    propertyId: uuid("property_id").references(() => properties.id)
        .notNull(),
    name: varchar("name").notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    pricePerNight: decimal("price_per_night", {
        precision: 10,
        scale: 2,
    }).notNull(),
    minimumStay: integer("minimum_stay").default(1),
    isActive: boolean("is_active").default(true),
    priority: integer("priority").default(0),
    createdAt: timestamp("created_at").defaultNow(),
});

// Service packages / bundles
export const servicePackages = pgTable("service_packages", {
    id: uuid("id").defaultRandom().primaryKey(),
    serviceProviderId: uuid("service_provider_id").references(() => serviceProviders.id)
        .notNull(),
    packageName: varchar("package_name").notNull(),
    description: text("description"),
    duration: integer("duration"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    discountPercentage: decimal("discount_percentage", {
        precision: 5,
        scale: 2,
    }).default("0"),
    includedServices: jsonb("included_services").default([]),
    isRecurring: boolean("is_recurring").default(false),
    recurringInterval: varchar("recurring_interval", {
        enum: ["daily", "weekly", "monthly"],
    }),
    maxOccurrences: integer("max_occurrences"),
    isActive: boolean("is_active").default(true),
    photoUrl: varchar("photo_url"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Provider earnings / payouts
export const providerEarnings = pgTable("provider_earnings", {
    id: uuid("id").defaultRandom().primaryKey(),
    serviceProviderId: uuid("service_provider_id").references(() => serviceProviders.id)
        .notNull(),
    month: varchar("month").notNull(),
    year: integer("year").notNull(),
    totalEarnings: decimal("total_earnings", {
        precision: 10,
        scale: 2,
    }).default("0"),
    platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).default(
        "0"
    ),
    netEarnings: decimal("net_earnings", { precision: 10, scale: 2 }).default(
        "0"
    ),
    totalOrders: integer("total_orders").default(0),
    completedOrders: integer("completed_orders").default(0),
    averageRating: decimal("average_rating", {
        precision: 3,
        scale: 2,
    }).default("0"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Provider payouts
export const providerPayouts = pgTable("provider_payouts", {
    id: uuid("id").defaultRandom().primaryKey(),
    serviceProviderId: uuid("service_provider_id").references(() => serviceProviders.id)
        .notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    payoutMethod: varchar("payout_method", {
        enum: ["bank_transfer", "paypal", "stripe"],
    }).notNull(),
    status: varchar("status", {
        enum: ["pending", "processing", "completed", "failed"],
    }).default("pending"),
    accountDetails: jsonb("account_details"),
    transactionId: varchar("transaction_id"),
    failureReason: text("failure_reason"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// User activity logs
export const userActivityLogs = pgTable("user_activity_logs", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id),
    activityType: varchar("activity_type").notNull(),
    description: text("description").notNull(),
    ipAddress: varchar("ip_address"),
    userAgent: text("user_agent"),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at").defaultNow(),
});

// Platform settings
export const platformSettings = pgTable("platform_settings", {
    id: uuid("id").defaultRandom().primaryKey(),
    settingKey: varchar("setting_key").unique().notNull(),
    settingValue: text("setting_value").notNull(),
    settingType: varchar("setting_type", {
        enum: ["string", "number", "boolean", "json"],
    }).notNull(),
    description: text("description"),
    category: varchar("category").notNull(),
    isPublic: boolean("is_public").default(false),
    updatedBy: uuid("updated_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Email templates
export const emailTemplates = pgTable("email_templates", {
    id: uuid("id").defaultRandom().primaryKey(),
    templateKey: varchar("template_key").unique().notNull(),
    subject: varchar("subject").notNull(),
    htmlContent: text("html_content").notNull(),
    textContent: text("text_content"),
    variables: jsonb("variables").default([]),
    category: varchar("category").notNull(),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Disputes
export const disputes = pgTable("disputes", {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingId: uuid("booking_id").references(() => bookings.id),
    serviceOrderId: uuid("service_order_id").references(() => serviceOrders.id),
    raisedBy: uuid("raised_by").references(() => users.id)
        .notNull(),
    againstUser: uuid("against_user").references(() => users.id),
    category: varchar("category", {
        enum: [
            "payment",
            "service_quality",
            "cancellation",
            "refund",
            "behavior",
            "other",
        ],
    }).notNull(),
    subject: varchar("subject").notNull(),
    description: text("description").notNull(),
    evidence: jsonb("evidence").default([]),
    status: varchar("status", {
        enum: ["open", "investigating", "resolved", "closed"],
    }).default("open"),
    resolution: text("resolution"),
    resolvedBy: uuid("resolved_by").references(() => users.id),
    resolvedAt: timestamp("resolved_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Dispute messages
export const disputeMessages = pgTable("dispute_messages", {
    id: uuid("id").defaultRandom().primaryKey(),
    disputeId: uuid("dispute_id").references(() => disputes.id)
        .notNull(),
    senderId: uuid("sender_id").references(() => users.id)
        .notNull(),
    message: text("message").notNull(),
    attachments: jsonb("attachments").default([]),
    isAdminMessage: boolean("is_admin_message").default(false),
    createdAt: timestamp("created_at").defaultNow(),
});

// Regional territories (for country managers)
export const territories = pgTable("territories", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name").notNull(),
    country: varchar("country").notNull(),
    regions: jsonb("regions").default([]),
    managerId: uuid("manager_id").references(() => users.id),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Regional analytics
export const regionalAnalytics = pgTable("regional_analytics", {
    id: uuid("id").defaultRandom().primaryKey(),
    territoryId: uuid("territory_id").references(() => territories.id)
        .notNull(),
    month: varchar("month").notNull(),
    year: integer("year").notNull(),
    totalBookings: integer("total_bookings").default(0),
    totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).default(
        "0"
    ),
    activeProviders: integer("active_providers").default(0),
    newCustomers: integer("new_customers").default(0),
    averageRating: decimal("average_rating", {
        precision: 3,
        scale: 2,
    }).default("0"),
    createdAt: timestamp("created_at").defaultNow(),
});

// Contact submissions
export const contactSubmissions = pgTable("contact_submissions", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name").notNull(),
    email: varchar("email").notNull(),
    subject: varchar("subject").notNull(),
    message: text("message").notNull(),
    status: varchar("status", {
        enum: ["new", "read", "responded", "archived"],
    }).default("new"),
    respondedBy: uuid("responded_by").references(() => users.id),
    response: text("response"),
    createdAt: timestamp("created_at").defaultNow(),
});

// Job postings
export const jobPostings = pgTable("job_postings", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title").notNull(),
    department: varchar("department").notNull(),
    location: varchar("location").notNull(),
    type: varchar("type", {
        enum: ["full-time", "part-time", "contract", "internship"],
    }).notNull(),
    description: text("description").notNull(),
    requirements: text("requirements").notNull(),
    responsibilities: text("responsibilities").notNull(),
    benefits: text("benefits"),
    salary: varchar("salary"),
    status: varchar("status", { enum: ["draft", "active", "closed"] }).default(
        "draft"
    ),
    postedBy: uuid("posted_by").references(() => users.id)
        .notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Job applications
export const jobApplications = pgTable("job_applications", {
    id: uuid("id").defaultRandom().primaryKey(),
    jobPostingId: uuid("job_posting_id").references(() => jobPostings.id)
        .notNull(),
    applicantName: varchar("applicant_name").notNull(),
    email: varchar("email").notNull(),
    phone: varchar("phone"),
    resumeUrl: varchar("resume_url"),
    coverLetter: text("cover_letter"),
    status: varchar("status", {
        enum: ["pending", "reviewing", "interview", "rejected", "accepted"],
    }).default("pending"),
    reviewedBy: uuid("reviewed_by").references(() => users.id),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
});

// Blog posts
export const blogPosts = pgTable("blog_posts", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title").notNull(),
    slug: varchar("slug").unique().notNull(),
    excerpt: text("excerpt"),
    content: text("content").notNull(),
    featuredImage: varchar("featured_image"),
    authorId: uuid("author_id").references(() => users.id)
        .notNull(),
    category: varchar("category").notNull(),
    tags: text("tags").array().default([]),
    status: varchar("status", {
        enum: ["draft", "published", "archived"],
    }).default("draft"),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
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

export const serviceCategoriesRelations = relations(
    serviceCategories,
    ({ many }) => ({
        providers: many(serviceProviders),
    })
);

export const serviceProvidersRelations = relations(
    serviceProviders,
    ({ one, many }) => ({
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
    })
);

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

export const serviceBookingsRelations = relations(
    serviceBookings,
    ({ one }) => ({
        booking: one(bookings, {
            fields: [serviceBookings.bookingId],
            references: [bookings.id],
        }),
        serviceProvider: one(serviceProviders, {
            fields: [serviceBookings.serviceProviderId],
            references: [serviceProviders.id],
        }),
    })
);

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

export const propertyServicesRelations = relations(
    propertyServices,
    ({ one }) => ({
        property: one(properties, {
            fields: [propertyServices.propertyId],
            references: [properties.id],
        }),
        serviceProvider: one(serviceProviders, {
            fields: [propertyServices.serviceProviderId],
            references: [serviceProviders.id],
        }),
    })
);

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

export const insertServiceProviderSchema = createInsertSchema(
    serviceProviders
).omit({
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

export const insertProviderTaskConfigSchema = createInsertSchema(
    providerTaskConfigs
).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export type InsertProviderTaskConfig = z.infer<
    typeof insertProviderTaskConfigSchema
>;

export const insertProviderMaterialSchema = createInsertSchema(
    providerMaterials
).omit({
    id: true,
    createdAt: true,
});
export type InsertProviderMaterial = z.infer<
    typeof insertProviderMaterialSchema
>;

// Service Orders
export type ServiceOrder = typeof serviceOrders.$inferSelect;
export type ServiceOrderItem = typeof serviceOrderItems.$inferSelect;
export type ProviderAvailability = typeof providerAvailability.$inferSelect;
export type ProviderPricing = typeof providerPricing.$inferSelect;

export const insertProviderAvailabilitySchema = createInsertSchema(
    providerAvailability
).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export type InsertProviderAvailability = z.infer<
    typeof insertProviderAvailabilitySchema
>;

export const insertProviderPricingSchema = createInsertSchema(
    providerPricing
).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export type InsertProviderPricing = z.infer<typeof insertProviderPricingSchema>;

export const insertServiceOrderSchema = createInsertSchema(serviceOrders).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    orderCode: true,
});
export type InsertServiceOrder = z.infer<typeof insertServiceOrderSchema>;

export const insertServiceOrderItemSchema = createInsertSchema(
    serviceOrderItems
).omit({
    id: true,
    createdAt: true,
});
export type InsertServiceOrderItem = z.infer<
    typeof insertServiceOrderItemSchema
>;

// Cart and audit log types
export type CartItem = typeof cartItems.$inferSelect;
export const insertCartItemSchema = createInsertSchema(cartItems).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type BookingEvent = typeof bookingEvents.$inferSelect;
export const insertBookingEventSchema = createInsertSchema(bookingEvents).omit({
    id: true,
    createdAt: true,
});
export type InsertBookingEvent = z.infer<typeof insertBookingEventSchema>;

// New feature types
export type Favorite = typeof favorites.$inferSelect;
export const insertFavoriteSchema = createInsertSchema(favorites).omit({
    id: true,
    createdAt: true,
});
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

export type PromotionalCode = typeof promotionalCodes.$inferSelect;
export const insertPromotionalCodeSchema = createInsertSchema(
    promotionalCodes
).omit({
    id: true,
    createdAt: true,
    usedCount: true,
});
export type InsertPromotionalCode = z.infer<typeof insertPromotionalCodeSchema>;

export type PromoCodeUsage = typeof promoCodeUsage.$inferSelect;
export type LoyaltyPoints = typeof loyaltyPoints.$inferSelect;
export type LoyaltyPointsTransaction =
    typeof loyaltyPointsTransactions.$inferSelect;

export type BookingCancellation = typeof bookingCancellations.$inferSelect;
export const insertBookingCancellationSchema = createInsertSchema(
    bookingCancellations
).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export type InsertBookingCancellation = z.infer<
    typeof insertBookingCancellationSchema
>;

// Enriched type for user cancellations with booking details
export type BookingCancellationWithBooking = BookingCancellation & {
    bookingCode?: string;
};

export type TripPlan = typeof tripPlans.$inferSelect;
export const insertTripPlanSchema = createInsertSchema(tripPlans).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export type InsertTripPlan = z.infer<typeof insertTripPlanSchema>;

export type TripPlanItem = typeof tripPlanItems.$inferSelect;
export const insertTripPlanItemSchema = createInsertSchema(tripPlanItems).omit({
    id: true,
    createdAt: true,
});
export type InsertTripPlanItem = z.infer<typeof insertTripPlanItemSchema>;

export type PropertySeasonalPricing =
    typeof propertySeasonalPricing.$inferSelect;
export const insertPropertySeasonalPricingSchema = createInsertSchema(
    propertySeasonalPricing
).omit({
    id: true,
    createdAt: true,
});
export type InsertPropertySeasonalPricing = z.infer<
    typeof insertPropertySeasonalPricingSchema
>;

export type ServicePackage = typeof servicePackages.$inferSelect;
export const insertServicePackageSchema = createInsertSchema(
    servicePackages
).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export type InsertServicePackage = z.infer<typeof insertServicePackageSchema>;

export type ProviderEarnings = typeof providerEarnings.$inferSelect;
export type ProviderPayout = typeof providerPayouts.$inferSelect;
export const insertProviderPayoutSchema = createInsertSchema(
    providerPayouts
).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export type InsertProviderPayout = z.infer<typeof insertProviderPayoutSchema>;

export type UserActivityLog = typeof userActivityLogs.$inferSelect;
export type PlatformSetting = typeof platformSettings.$inferSelect;
export type EmailTemplate = typeof emailTemplates.$inferSelect;

export type Dispute = typeof disputes.$inferSelect;
export const insertDisputeSchema = createInsertSchema(disputes).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export type InsertDispute = z.infer<typeof insertDisputeSchema>;

export type DisputeMessage = typeof disputeMessages.$inferSelect;
export type Territory = typeof territories.$inferSelect;
export type RegionalAnalytics = typeof regionalAnalytics.$inferSelect;

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export const insertContactSubmissionSchema = createInsertSchema(
    contactSubmissions
).omit({
    id: true,
    createdAt: true,
});
export type InsertContactSubmission = z.infer<
    typeof insertContactSubmissionSchema
>;

export type JobPosting = typeof jobPostings.$inferSelect;
export const insertJobPostingSchema = createInsertSchema(jobPostings).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export type InsertJobPosting = z.infer<typeof insertJobPostingSchema>;

export type JobApplication = typeof jobApplications.$inferSelect;
export const insertJobApplicationSchema = createInsertSchema(
    jobApplications
).omit({
    id: true,
    createdAt: true,
});
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;

export type BlogPost = typeof blogPosts.$inferSelect;
export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

export type RoleChangeRequest = typeof roleChangeRequests.$inferSelect;
export const insertRoleChangeRequestSchema = createInsertSchema(roleChangeRequests).omit({
    id: true,
    requestedAt: true,
    reviewedAt: true,
});
export type InsertRoleChangeRequest = z.infer<typeof insertRoleChangeRequestSchema>;
