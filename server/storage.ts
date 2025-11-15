import {
    blogPosts,
    bookingCancellations,
    bookings,
    contactSubmissions,
    disputes,
    favorites,
    jobApplications,
    jobAssignments,
    jobPostings,
    loyaltyPoints,
    loyaltyPointsTransactions,
    menuItems,
    messages,
    notifications,
    platformSettings,
    promoCodeUsage,
    promotionalCodes,
    properties,
    propertyServices,
    providerAvailability,
    providerEarnings,
    providerMaterials,
    providerMenus,
    providerPayouts,
    providerPricing,
    providerTaskConfigs,
    reviews,
    roleChangeRequests,
    serviceBookings,
    serviceCategories,
    serviceOrderItems,
    serviceOrders,
    servicePackages,
    serviceProviders,
    serviceTasks,
    tripPlanItems,
    tripPlans,
    users,
    type BlogPost,
    type Booking,
    type BookingCancellation,
    type BookingCancellationWithBooking,
    type ContactSubmission,
    type Dispute,
    type Favorite,
    type InsertBlogPost,
    type InsertBooking,
    type InsertContactSubmission,
    type InsertDispute,
    type InsertFavorite,
    type InsertJobApplication,
    type InsertJobAssignment,
    type InsertJobPosting,
    type InsertMenuItem,
    type InsertNotification,
    type InsertPromotionalCode,
    type InsertProperty,
    type InsertProviderAvailability,
    type InsertProviderMaterial,
    type InsertProviderMenu,
    type InsertProviderPayout,
    type InsertProviderPricing,
    type InsertProviderTaskConfig,
    type InsertReview,
    type InsertRoleChangeRequest,
    type InsertServiceOrder,
    type InsertServiceOrderItem,
    type InsertServicePackage,
    type InsertServiceProvider,
    type InsertTripPlan,
    type InsertTripPlanItem,
    type JobApplication,
    type JobAssignment,
    type JobPosting,
    type LoyaltyPoints,
    type LoyaltyPointsTransaction,
    type MenuItem,
    type Message,
    type Notification,
    type PlatformSetting,
    type PromotionalCode,
    type Property,
    type PropertyService,
    type ProviderAvailability,
    type ProviderEarnings,
    type ProviderMaterial,
    type ProviderMenu,
    type ProviderPayout,
    type ProviderPricing,
    type ProviderTaskConfig,
    type Review,
    type RoleChangeRequest,
    type ServiceBooking,
    type ServiceCategory,
    type ServiceOrder,
    type ServiceOrderItem,
    type ServicePackage,
    type ServiceProvider,
    type ServiceTask,
    type TripPlan,
    type TripPlanItem,
    type UpsertUser,
    type User,
} from "@shared/schema";
import { and, asc, desc, eq, gte, ilike, inArray, like, lte, or, sql } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
    // User operations
    getUser(id: string): Promise<User | undefined>;
    getUserByEmail(email: string): Promise<User | undefined>;
    getUsersByRole(role: string): Promise<User[]>;
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
    updateProperty(
        id: string,
        updates: Partial<InsertProperty>
    ): Promise<Property>;
    deleteProperty(id: string): Promise<void>;
    getPropertiesByOwner(ownerId: string): Promise<Property[]>;

    // Service operations
    getServiceCategories(): Promise<ServiceCategory[]>;
    createServiceCategory(
        category: Omit<ServiceCategory, "id" | "createdAt">
    ): Promise<ServiceCategory>;
    updateServiceCategory(
        id: string,
        updates: Partial<Omit<ServiceCategory, "id" | "createdAt">>
    ): Promise<ServiceCategory>;
    deleteServiceCategory(id: string): Promise<void>;
    getServiceProviders(
        categoryId?: string,
        location?: string
    ): Promise<ServiceProvider[]>;
    getServiceProvider(id: string): Promise<ServiceProvider | undefined>;
    getServiceProviderByUserId(
        userId: string
    ): Promise<ServiceProvider | undefined>;
    createServiceProvider(
        provider: InsertServiceProvider
    ): Promise<ServiceProvider>;
    updateServiceProvider(
        id: string,
        updates: Partial<InsertServiceProvider>
    ): Promise<ServiceProvider>;
    updateServiceProviderApproval(
        id: string,
        status: "approved" | "rejected",
        reason: string | null
    ): Promise<ServiceProvider>;
    deleteServiceProvider(id: string): Promise<void>;

    // Booking operations
    getAllBookings(): Promise<Booking[]>;
    getBookingDetails(id: string): Promise<any>;
    createBooking(
        booking: InsertBooking,
        serviceBookings?: Omit<
            ServiceBooking,
            "id" | "createdAt" | "updatedAt"
        >[]
    ): Promise<Booking>;
    getBooking(id: string): Promise<Booking | undefined>;
    getBookingByCode(code: string): Promise<Booking | undefined>;
    getUserBookings(userId: string): Promise<Booking[]>;
    updateBookingStatus(id: string, status: string): Promise<Booking>;
    updateBookingPaymentStatus(
        id: string,
        paymentStatus: string
    ): Promise<Booking>;

    // Review operations
    createReview(review: InsertReview): Promise<Review>;
    getPropertyReviews(propertyId: string): Promise<Review[]>;
    getServiceProviderReviews(serviceProviderId: string): Promise<Review[]>;

    // Message operations
    sendMessage(
        message: Omit<Message, "id" | "createdAt" | "isRead">
    ): Promise<Message>;
    getConversation(userId1: string, userId2: string): Promise<Message[]>;
    markMessagesAsRead(userId: string, senderId: string): Promise<void>;
    getUserConversations(userId: string): Promise<any[]>;

    // Notification operations
    getUserNotifications(userId: string): Promise<Notification[]>;
    createNotification(notification: InsertNotification): Promise<Notification>;
    markNotificationAsRead(id: string, userId: string): Promise<number>;
    getUnreadNotificationCount(userId: string): Promise<number>;

    // Job Assignment operations
    createJobAssignment(assignment: InsertJobAssignment): Promise<JobAssignment>;
    getJobAssignment(id: string): Promise<JobAssignment | undefined>;
    getJobAssignmentsByProvider(providerId: string): Promise<JobAssignment[]>;
    getJobAssignmentsByCountryManager(managerId: string): Promise<JobAssignment[]>;
    getJobAssignmentByBooking(serviceBookingId: string): Promise<JobAssignment | undefined>;
    acceptJobAssignment(id: string, providerId: string): Promise<JobAssignment>;
    rejectJobAssignment(id: string, providerId: string, reason: string): Promise<JobAssignment>;
    getPendingJobAssignmentsCount(providerId?: string): Promise<number>;
    getCompletedJobAssignmentsCount(managerId?: string): Promise<number>;

    // Property-Service associations
    getPropertyServices(propertyId: string): Promise<ServiceProvider[]>;
    addPropertyService(
        propertyId: string,
        serviceProviderId: string
    ): Promise<PropertyService>;
    removePropertyService(
        propertyId: string,
        serviceProviderId: string
    ): Promise<void>;

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
    updateProviderMenu(
        id: string,
        updates: Partial<InsertProviderMenu>
    ): Promise<ProviderMenu>;
    deleteProviderMenu(id: string): Promise<void>;

    // Provider Configuration - Menu Items
    getMenuItems(menuId: string): Promise<MenuItem[]>;
    createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
    updateMenuItem(
        id: string,
        updates: Partial<InsertMenuItem>
    ): Promise<MenuItem>;
    deleteMenuItem(id: string): Promise<void>;

    // Provider Configuration - Task Configs
    getProviderTaskConfigs(
        serviceProviderId: string
    ): Promise<ProviderTaskConfig[]>;
    upsertProviderTaskConfig(
        config: InsertProviderTaskConfig
    ): Promise<ProviderTaskConfig>;
    deleteProviderTaskConfig(id: string): Promise<void>;

    // Provider Configuration - Materials
    getProviderMaterials(
        serviceProviderId: string
    ): Promise<ProviderMaterial[]>;
    createProviderMaterial(
        material: InsertProviderMaterial
    ): Promise<ProviderMaterial>;
    updateProviderMaterial(
        id: string,
        updates: Partial<InsertProviderMaterial>
    ): Promise<ProviderMaterial>;
    deleteProviderMaterial(id: string): Promise<void>;

    // Service Tasks
    getServiceTasks(categoryId: string): Promise<ServiceTask[]>;

    // Service Orders
    createServiceOrder(
        order: InsertServiceOrder,
        items: InsertServiceOrderItem[]
    ): Promise<ServiceOrder>;
    getServiceOrder(id: string): Promise<ServiceOrder | undefined>;
    getServiceOrderByCode(orderCode: string): Promise<ServiceOrder | undefined>;
    getClientServiceOrders(clientId: string): Promise<ServiceOrder[]>;
    getProviderServiceOrders(providerId: string): Promise<ServiceOrder[]>;
    getAllServiceOrders(): Promise<ServiceOrder[]>;
    getFilteredServiceOrders(filters: {
        status?: string[];
        providerName?: string;
        dateFrom?: string;
        dateTo?: string;
        paymentStatus?: string;
    }): Promise<ServiceOrder[]>;
    updateServiceOrderStatus(id: string, status: string): Promise<ServiceOrder>;
    updateServiceOrderPaymentStatus(
        id: string,
        paymentStatus: string
    ): Promise<ServiceOrder>;
    getServiceOrderItems(orderId: string): Promise<ServiceOrderItem[]>;
    updateServiceOrderItem(
        id: string,
        updates: Partial<ServiceOrderItem>
    ): Promise<ServiceOrderItem>;

    // Provider Availability
    getProviderAvailability(
        providerId: string,
        startDate: string,
        endDate: string
    ): Promise<ProviderAvailability[]>;
    createProviderAvailability(
        availability: InsertProviderAvailability
    ): Promise<ProviderAvailability>;
    updateProviderAvailability(
        id: string,
        updates: Partial<InsertProviderAvailability>
    ): Promise<ProviderAvailability>;
    deleteProviderAvailability(id: string): Promise<void>;

    // Provider Pricing
    getProviderPricing(
        providerId: string
    ): Promise<ProviderPricing | undefined>;
    upsertProviderPricing(
        pricing: InsertProviderPricing
    ): Promise<ProviderPricing>;
    calculateServicePrice(
        providerId: string,
        basePrice: number,
        options: {
            isWeekend?: boolean;
            isHoliday?: boolean;
            isLastMinute?: boolean;
            isEarlyBird?: boolean;
            isRecurring?: boolean;
            distance?: number;
            materialsCost?: number;
        }
    ): Promise<number>;

    // NEW FEATURES - Favorites
    addFavorite(favorite: InsertFavorite): Promise<Favorite>;
    removeFavorite(id: string, userId: string): Promise<void>;
    getUserFavorites(userId: string): Promise<Favorite[]>;

    // NEW FEATURES - Promotional Codes
    validatePromoCode(
        code: string,
        userId: string,
        bookingId?: string,
        serviceOrderId?: string
    ): Promise<{ valid: boolean; discount?: number; message?: string }>;
    createPromoCode(code: InsertPromotionalCode): Promise<PromotionalCode>;
    getAllPromoCodes(): Promise<PromotionalCode[]>;

    // NEW FEATURES - Loyalty Points
    getUserLoyaltyPoints(userId: string): Promise<LoyaltyPoints | undefined>;
    getLoyaltyPointsHistory(
        userId: string
    ): Promise<LoyaltyPointsTransaction[]>;
    awardLoyaltyPoints(
        userId: string,
        points: number,
        reason: string,
        bookingId?: string,
        serviceOrderId?: string
    ): Promise<void>;
    redeemLoyaltyPoints(
        userId: string,
        points: number,
        reason: string
    ): Promise<void>;

    // NEW FEATURES - Booking Cancellations
    requestBookingCancellation(
        bookingId: string,
        userId: string,
        reason: string
    ): Promise<BookingCancellation>;
    updateCancellationStatus(
        id: string,
        status: string,
        approvedBy: string,
        rejectionReason?: string
    ): Promise<BookingCancellation>;
    getAllCancellations(): Promise<BookingCancellation[]>;
    getUserCancellations(userId: string): Promise<BookingCancellationWithBooking[]>;

    // NEW FEATURES - Trip Plans
    createTripPlan(plan: InsertTripPlan): Promise<TripPlan>;
    getUserTripPlans(userId: string): Promise<TripPlan[]>;
    getTripPlanWithItems(
        id: string,
        userId: string
    ): Promise<TripPlan & { items: TripPlanItem[] }>;
    addTripPlanItem(item: InsertTripPlanItem): Promise<TripPlanItem>;

    // NEW FEATURES - Service Packages
    createServicePackage(
        package_: InsertServicePackage
    ): Promise<ServicePackage>;
    getProviderPackages(providerId: string): Promise<ServicePackage[]>;

    // NEW FEATURES - Provider Earnings & Payouts
    getProviderByUserId(userId: string): Promise<ServiceProvider | undefined>;
    getProviderEarnings(providerId: string): Promise<ProviderEarnings[]>;
    requestPayout(payout: InsertProviderPayout): Promise<ProviderPayout>;

    // NEW FEATURES - Disputes
    createDispute(dispute: InsertDispute): Promise<Dispute>;
    getUserDisputes(userId: string): Promise<Dispute[]>;
    getAllDisputes(): Promise<Dispute[]>;
    resolveDispute(
        id: string,
        resolution: string,
        resolvedBy: string
    ): Promise<Dispute>;

    // NEW FEATURES - Platform Settings
    getPublicSettings(): Promise<PlatformSetting[]>;
    getAllSettings(): Promise<PlatformSetting[]>;
    updateSetting(
        key: string,
        value: string,
        updatedBy: string
    ): Promise<PlatformSetting>;

    // Contact Submissions
    createContactSubmission(
        submission: InsertContactSubmission
    ): Promise<ContactSubmission>;
    getAllContactSubmissions(): Promise<ContactSubmission[]>;
    updateContactSubmissionResponse(
        id: string,
        respondedBy: string,
        response: string
    ): Promise<ContactSubmission>;

    // Job Postings
    getActiveJobPostings(): Promise<JobPosting[]>;
    getJobPosting(id: string): Promise<JobPosting | undefined>;
    createJobPosting(posting: InsertJobPosting): Promise<JobPosting>;
    updateJobPosting(
        id: string,
        updates: Partial<InsertJobPosting>
    ): Promise<JobPosting>;
    deleteJobPosting(id: string): Promise<void>;

    // Job Applications
    createJobApplication(
        application: InsertJobApplication
    ): Promise<JobApplication>;
    getAllJobApplications(): Promise<JobApplication[]>;
    getJobApplicationsByJobId(jobId: string): Promise<JobApplication[]>;
    updateJobApplicationStatus(
        id: string,
        status: string,
        reviewedBy: string,
        notes?: string
    ): Promise<JobApplication>;

    // Blog Posts
    getPublishedBlogPosts(): Promise<BlogPost[]>;
    getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
    getBlogPost(id: string): Promise<BlogPost | undefined>;
    createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
    updateBlogPost(
        id: string,
        updates: Partial<InsertBlogPost>
    ): Promise<BlogPost>;
    deleteBlogPost(id: string): Promise<void>;

    // Role Change Requests
    createRoleChangeRequest(
        userId: string,
        requestedRole: string,
        requestNote?: string
    ): Promise<RoleChangeRequest>;
    getPendingRoleChangeRequest(
        userId: string
    ): Promise<RoleChangeRequest | undefined>;
    getAllRoleChangeRequests(
        status?: string
    ): Promise<RoleChangeRequest[]>;
    approveRoleChangeRequest(
        requestId: string,
        reviewedBy: string,
        adminNote?: string
    ): Promise<RoleChangeRequest>;
    rejectRoleChangeRequest(
        requestId: string,
        reviewedBy: string,
        adminNote: string
    ): Promise<RoleChangeRequest>;
}

export class DatabaseStorage implements IStorage {
    // User operations
    async getUser(id: string): Promise<User | undefined> {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
    }

    async getUserByEmail(email: string): Promise<User | undefined> {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email));
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
            .set({ role: role as any, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning();
        return user;
    }

    // Property operations
    async getAllProperties(): Promise<Property[]> {
        return await db
            .select()
            .from(properties)
            .orderBy(desc(properties.createdAt));
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
            conditions.push(ilike(properties.location, `%${filters.location}%`));
        }
        if (filters?.maxPrice) {
            conditions.push(
                lte(properties.pricePerNight, filters.maxPrice.toString())
            );
        }
        if (filters?.minPrice) {
            conditions.push(
                gte(properties.pricePerNight, filters.minPrice.toString())
            );
        }
        if (filters?.guests) {
            conditions.push(gte(properties.maxGuests, filters.guests));
        }

        return await db
            .select()
            .from(properties)
            .where(and(...conditions))
            .orderBy(desc(properties.rating));
    }

    async getProperty(id: string): Promise<Property | undefined> {
        const [property] = await db
            .select()
            .from(properties)
            .where(eq(properties.id, id));
        return property;
    }

    async createProperty(property: InsertProperty): Promise<Property> {
        const [newProperty] = await db
            .insert(properties)
            .values(property)
            .returning();
        return newProperty;
    }

    async updateProperty(
        id: string,
        updates: Partial<InsertProperty>
    ): Promise<Property> {
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

    async getPropertiesByOwner(ownerId: string): Promise<Property[]> {
        return await db
            .select()
            .from(properties)
            .where(eq(properties.ownerId, ownerId))
            .orderBy(desc(properties.createdAt));
    }

    // Service operations
    async getServiceCategories(): Promise<ServiceCategory[]> {
        return await db
            .select()
            .from(serviceCategories)
            .orderBy(asc(serviceCategories.name));
    }

    async createServiceCategory(
        category: Omit<ServiceCategory, "id" | "createdAt">
    ): Promise<ServiceCategory> {
        const [newCategory] = await db
            .insert(serviceCategories)
            .values(category)
            .returning();
        return newCategory;
    }

    async updateServiceCategory(
        id: string,
        updates: Partial<Omit<ServiceCategory, "id" | "createdAt">>
    ): Promise<ServiceCategory> {
        const [updatedCategory] = await db
            .update(serviceCategories)
            .set(updates)
            .where(eq(serviceCategories.id, id))
            .returning();
        return updatedCategory;
    }

    async deleteServiceCategory(id: string): Promise<void> {
        await db.delete(serviceCategories).where(eq(serviceCategories.id, id));
    }

    async getServiceProviders(
        categoryId?: string,
        location?: string
    ): Promise<any[]> {
        const conditions = [eq(serviceProviders.isActive, true)];

        if (categoryId) {
            conditions.push(eq(serviceProviders.categoryId, categoryId));
        }
        if (location) {
            conditions.push(like(serviceProviders.location, `%${location}%`));
        }

        const results = await db
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
            })
            .from(serviceProviders)
            .leftJoin(
                serviceCategories,
                eq(serviceProviders.categoryId, serviceCategories.id)
            )
            .where(and(...conditions))
            .orderBy(desc(serviceProviders.rating));

        return results;
    }

    async getServiceProvider(id: string): Promise<ServiceProvider | undefined> {
        const [provider] = await db
            .select()
            .from(serviceProviders)
            .where(eq(serviceProviders.id, id));
        return provider;
    }

    async getServiceProviderByUserId(
        userId: string
    ): Promise<ServiceProvider | undefined> {
        const [result] = await db
            .select({
                id: serviceProviders.id,
                userId: serviceProviders.userId,
                categoryId: serviceProviders.categoryId,
                businessName: serviceProviders.businessName,
                description: serviceProviders.description,
                location: serviceProviders.location,
                whatsappNumber: serviceProviders.whatsappNumber,
                approvalStatus: serviceProviders.approvalStatus,
                rejectionReason: serviceProviders.rejectionReason,
                hourlyRate: serviceProviders.hourlyRate,
                fixedRate: serviceProviders.fixedRate,
                certifications: serviceProviders.certifications,
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
            })
            .from(serviceProviders)
            .leftJoin(
                serviceCategories,
                eq(serviceProviders.categoryId, serviceCategories.id)
            )
            .where(eq(serviceProviders.userId, userId));
        return result as any;
    }

    async createServiceProvider(
        provider: InsertServiceProvider
    ): Promise<ServiceProvider> {
        const [newProvider] = await db
            .insert(serviceProviders)
            .values(provider)
            .returning();
        return newProvider;
    }

    async updateServiceProvider(
        id: string,
        updates: Partial<InsertServiceProvider>
    ): Promise<ServiceProvider> {
        const [updatedProvider] = await db
            .update(serviceProviders)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(serviceProviders.id, id))
            .returning();
        return updatedProvider;
    }

    async updateServiceProviderApproval(
        id: string,
        status: "approved" | "rejected",
        reason: string | null
    ): Promise<ServiceProvider> {
        const [updatedProvider] = await db
            .update(serviceProviders)
            .set({
                approvalStatus: status,
                rejectionReason: reason,
                updatedAt: new Date(),
            })
            .where(eq(serviceProviders.id, id))
            .returning();
        return updatedProvider;
    }

    async deleteServiceProvider(id: string): Promise<void> {
        await db.delete(serviceProviders).where(eq(serviceProviders.id, id));
    }

    // Booking operations
    async createBooking(
        booking: InsertBooking & { bookingCode: string },
        serviceBookingsData?: Omit<
            ServiceBooking,
            "id" | "createdAt" | "updatedAt"
        >[]
    ): Promise<Booking> {
        const [newBooking] = await db
            .insert(bookings)
            .values([booking])
            .returning();

        if (serviceBookingsData && serviceBookingsData.length > 0) {
            await db.insert(serviceBookings).values(
                serviceBookingsData.map((sb) => ({
                    ...sb,
                    bookingId: newBooking.id,
                }))
            );
        }

        return newBooking;
    }

    async getBooking(id: string): Promise<Booking | undefined> {
        const [booking] = await db
            .select()
            .from(bookings)
            .where(eq(bookings.id, id));
        return booking;
    }

    async getBookingByCode(code: string): Promise<Booking | undefined> {
        const [booking] = await db
            .select()
            .from(bookings)
            .where(eq(bookings.bookingCode, code));
        return booking;
    }

    async getAllBookings(): Promise<Booking[]> {
        return await db
            .select()
            .from(bookings)
            .orderBy(desc(bookings.createdAt));
    }

    async getBookingDetails(id: string): Promise<any> {
        const booking = await this.getBooking(id);
        if (!booking) return null;

        const property = await this.getProperty(booking.propertyId);
        const client = await this.getUser(booking.clientId);
        const serviceBookingsList = await db
            .select()
            .from(serviceBookings)
            .where(eq(serviceBookings.bookingId, id));

        return {
            ...booking,
            property,
            client,
            serviceBookings: serviceBookingsList,
        };
    }

    async getUserBookings(userId: string): Promise<Booking[]> {
        return await db
            .select()
            .from(bookings)
            .where(eq(bookings.clientId, userId))
            .orderBy(desc(bookings.createdAt));
    }

    async updateBookingStatus(id: string, status: string): Promise<Booking> {
        const [updatedBooking] = await db
            .update(bookings)
            .set({ status: status as any, updatedAt: new Date() })
            .where(eq(bookings.id, id))
            .returning();
        return updatedBooking;
    }

    async updateBookingPaymentStatus(
        id: string,
        paymentStatus: string
    ): Promise<Booking> {
        const [updatedBooking] = await db
            .update(bookings)
            .set({ paymentStatus: paymentStatus as any, updatedAt: new Date() })
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
        return await db
            .select()
            .from(reviews)
            .where(eq(reviews.propertyId, propertyId))
            .orderBy(desc(reviews.createdAt));
    }

    async getServiceProviderReviews(
        serviceProviderId: string
    ): Promise<Review[]> {
        return await db
            .select()
            .from(reviews)
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

    private async updateServiceProviderRating(
        serviceProviderId: string
    ): Promise<void> {
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
    async sendMessage(
        message: Omit<Message, "id" | "createdAt" | "isRead">
    ): Promise<Message> {
        const [newMessage] = await db
            .insert(messages)
            .values({
                ...message,
                isRead: false,
            })
            .returning();
        return newMessage;
    }

    async getConversation(
        userId1: string,
        userId2: string
    ): Promise<Message[]> {
        return await db
            .select()
            .from(messages)
            .where(
                or(
                    and(
                        eq(messages.senderId, userId1),
                        eq(messages.receiverId, userId2)
                    ),
                    and(
                        eq(messages.senderId, userId2),
                        eq(messages.receiverId, userId1)
                    )
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

    async getUserConversations(userId: string): Promise<any[]> {
        // Get all unique users this user has messaged with
        const sent = await db
            .selectDistinct({ userId: messages.receiverId })
            .from(messages)
            .where(eq(messages.senderId, userId));

        const received = await db
            .selectDistinct({ userId: messages.senderId })
            .from(messages)
            .where(eq(messages.receiverId, userId));

        const uniqueUserIds = Array.from(
            new Set([
                ...sent.map((m) => m.userId),
                ...received.map((m) => m.userId),
            ])
        );

        const conversations = [];

        for (const otherUserId of uniqueUserIds) {
            const user = await this.getUser(otherUserId);
            if (!user) continue;

            // Get latest message
            const [latestMessage] = await db
                .select()
                .from(messages)
                .where(
                    or(
                        and(
                            eq(messages.senderId, userId),
                            eq(messages.receiverId, otherUserId)
                        ),
                        and(
                            eq(messages.senderId, otherUserId),
                            eq(messages.receiverId, userId)
                        )
                    )
                )
                .orderBy(desc(messages.createdAt))
                .limit(1);

            // Count unread messages
            const unreadMessages = await db
                .select()
                .from(messages)
                .where(
                    and(
                        eq(messages.senderId, otherUserId),
                        eq(messages.receiverId, userId),
                        eq(messages.isRead, false)
                    )
                );

            conversations.push({
                userId: user.id,
                userName: `${user.firstName} ${user.lastName}`,
                userEmail: user.email,
                lastMessage: latestMessage?.content || "",
                lastMessageTime:
                    latestMessage?.createdAt || new Date().toISOString(),
                unreadCount: unreadMessages.length,
            });
        }

        // Sort by latest message time
        conversations.sort(
            (a, b) =>
                new Date(b.lastMessageTime).getTime() -
                new Date(a.lastMessageTime).getTime()
        );

        return conversations;
    }

    // Notification operations
    async getUserNotifications(userId: string): Promise<Notification[]> {
        return await db
            .select()
            .from(notifications)
            .where(eq(notifications.userId, userId))
            .orderBy(desc(notifications.createdAt));
    }

    async createNotification(
        notification: InsertNotification
    ): Promise<Notification> {
        const [newNotification] = await db
            .insert(notifications)
            .values(notification)
            .returning();
        
        // Send real-time notification via WebSocket
        if ((this as any).sendNotificationToUser) {
            await (this as any).sendNotificationToUser(
                notification.userId,
                newNotification
            );
        }
        
        return newNotification;
    }

    async markNotificationAsRead(id: string, userId: string): Promise<number> {
        const result = await db
            .update(notifications)
            .set({ isRead: true })
            .where(
                and(
                    eq(notifications.id, id),
                    eq(notifications.userId, userId)
                )
            )
            .returning();
        return result.length;
    }

    async getUnreadNotificationCount(userId: string): Promise<number> {
        const result = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(notifications)
            .where(
                and(
                    eq(notifications.userId, userId),
                    eq(notifications.isRead, false)
                )
            );
        return result[0]?.count || 0;
    }

    // Job Assignment operations
    async createJobAssignment(assignment: InsertJobAssignment): Promise<JobAssignment> {
        const [newAssignment] = await db
            .insert(jobAssignments)
            .values(assignment)
            .returning();
        return newAssignment;
    }

    async getJobAssignment(id: string): Promise<JobAssignment | undefined> {
        const [assignment] = await db
            .select()
            .from(jobAssignments)
            .where(eq(jobAssignments.id, id));
        return assignment;
    }

    async getJobAssignmentsByProvider(providerId: string): Promise<JobAssignment[]> {
        return await db
            .select()
            .from(jobAssignments)
            .where(eq(jobAssignments.serviceProviderId, providerId))
            .orderBy(desc(jobAssignments.createdAt));
    }

    async getJobAssignmentsByCountryManager(managerId: string): Promise<JobAssignment[]> {
        return await db
            .select()
            .from(jobAssignments)
            .where(eq(jobAssignments.assignedBy, managerId))
            .orderBy(desc(jobAssignments.createdAt));
    }

    async getJobAssignmentByBooking(serviceBookingId: string): Promise<JobAssignment | undefined> {
        const [assignment] = await db
            .select()
            .from(jobAssignments)
            .where(eq(jobAssignments.serviceBookingId, serviceBookingId));
        return assignment;
    }

    async acceptJobAssignment(id: string, providerId: string): Promise<JobAssignment> {
        const [assignment] = await db
            .update(jobAssignments)
            .set({
                status: 'accepted',
                respondedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(jobAssignments.id, id),
                    eq(jobAssignments.serviceProviderId, providerId),
                    eq(jobAssignments.status, 'pending')
                )
            )
            .returning();
        
        if (!assignment) {
            throw new Error('Assignment not found or already processed');
        }
        
        return assignment;
    }

    async rejectJobAssignment(id: string, providerId: string, reason: string): Promise<JobAssignment> {
        const [assignment] = await db
            .update(jobAssignments)
            .set({
                status: 'rejected',
                rejectionReason: reason,
                respondedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(jobAssignments.id, id),
                    eq(jobAssignments.serviceProviderId, providerId),
                    eq(jobAssignments.status, 'pending')
                )
            )
            .returning();
        
        if (!assignment) {
            throw new Error('Assignment not found or already processed');
        }
        
        return assignment;
    }

    async getPendingJobAssignmentsCount(providerId?: string): Promise<number> {
        const conditions = [eq(jobAssignments.status, 'pending')];
        
        if (providerId) {
            conditions.push(eq(jobAssignments.serviceProviderId, providerId));
        }
        
        const result = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(jobAssignments)
            .where(and(...conditions));
        
        return result[0]?.count || 0;
    }

    async getCompletedJobAssignmentsCount(managerId?: string): Promise<number> {
        const conditions = [eq(jobAssignments.status, 'accepted')];
        
        if (managerId) {
            conditions.push(eq(jobAssignments.assignedBy, managerId));
        }
        
        const result = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(jobAssignments)
            .where(and(...conditions));
        
        return result[0]?.count || 0;
    }

    // Property-Service associations
    async getPropertyServices(propertyId: string): Promise<ServiceProvider[]> {
        const result = await db
            .select({
                serviceProvider: serviceProviders,
            })
            .from(propertyServices)
            .innerJoin(
                serviceProviders,
                eq(propertyServices.serviceProviderId, serviceProviders.id)
            )
            .where(eq(propertyServices.propertyId, propertyId));

        return result.map((r) => r.serviceProvider);
    }

    async addPropertyService(
        propertyId: string,
        serviceProviderId: string
    ): Promise<PropertyService> {
        const [propertyService] = await db
            .insert(propertyServices)
            .values({
                propertyId,
                serviceProviderId,
            })
            .returning();
        return propertyService;
    }

    async removePropertyService(
        propertyId: string,
        serviceProviderId: string
    ): Promise<void> {
        await db
            .delete(propertyServices)
            .where(
                and(
                    eq(propertyServices.propertyId, propertyId),
                    eq(propertyServices.serviceProviderId, serviceProviderId)
                )
            );
    }

    // Admin statistics
    async getAdminStats(): Promise<{
        totalUsers: number;
        totalProperties: number;
        totalServiceProviders: number;
        totalBookings: number;
    }> {
        const [userCount] = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(users);
        const [propertyCount] = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(properties);
        const [providerCount] = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(serviceProviders);
        const [bookingCount] = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(bookings);

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

    async getUsersByRole(role: string): Promise<User[]> {
        return await db
            .select()
            .from(users)
            .where(eq(users.role, role as any))
            .orderBy(asc(users.firstName), asc(users.lastName));
    }

    // Provider Configuration - Menus
    async getProviderMenus(serviceProviderId: string): Promise<ProviderMenu[]> {
        return await db
            .select()
            .from(providerMenus)
            .where(eq(providerMenus.serviceProviderId, serviceProviderId))
            .orderBy(asc(providerMenus.createdAt));
    }

    async createProviderMenu(menu: InsertProviderMenu): Promise<ProviderMenu> {
        const [newMenu] = await db
            .insert(providerMenus)
            .values(menu)
            .returning();
        return newMenu;
    }

    async updateProviderMenu(
        id: string,
        updates: Partial<InsertProviderMenu>
    ): Promise<ProviderMenu> {
        const [updatedMenu] = await db
            .update(providerMenus)
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
        return await db
            .select()
            .from(menuItems)
            .where(eq(menuItems.menuId, menuId))
            .orderBy(asc(menuItems.createdAt));
    }

    async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
        const [newItem] = await db.insert(menuItems).values(item).returning();
        return newItem;
    }

    async updateMenuItem(
        id: string,
        updates: Partial<InsertMenuItem>
    ): Promise<MenuItem> {
        const [updatedItem] = await db
            .update(menuItems)
            .set(updates)
            .where(eq(menuItems.id, id))
            .returning();
        return updatedItem;
    }

    async deleteMenuItem(id: string): Promise<void> {
        await db.delete(menuItems).where(eq(menuItems.id, id));
    }

    // Provider Configuration - Task Configs
    async getProviderTaskConfigs(
        serviceProviderId: string
    ): Promise<ProviderTaskConfig[]> {
        return await db
            .select()
            .from(providerTaskConfigs)
            .where(
                eq(providerTaskConfigs.serviceProviderId, serviceProviderId)
            );
    }

    async upsertProviderTaskConfig(
        config: InsertProviderTaskConfig
    ): Promise<ProviderTaskConfig> {
        const [result] = await db
            .insert(providerTaskConfigs)
            .values(config)
            .onConflictDoUpdate({
                target: [
                    providerTaskConfigs.serviceProviderId,
                    providerTaskConfigs.taskId,
                ],
                set: {
                    isEnabled: config.isEnabled,
                    customPrice: config.customPrice,
                },
            })
            .returning();
        return result;
    }

    async deleteProviderTaskConfig(id: string): Promise<void> {
        await db
            .delete(providerTaskConfigs)
            .where(eq(providerTaskConfigs.id, id));
    }

    // Provider Configuration - Materials
    async getProviderMaterials(
        serviceProviderId: string
    ): Promise<ProviderMaterial[]> {
        return await db
            .select()
            .from(providerMaterials)
            .where(eq(providerMaterials.serviceProviderId, serviceProviderId))
            .orderBy(asc(providerMaterials.createdAt));
    }

    async createProviderMaterial(
        material: InsertProviderMaterial
    ): Promise<ProviderMaterial> {
        const [newMaterial] = await db
            .insert(providerMaterials)
            .values(material)
            .returning();
        return newMaterial;
    }

    async updateProviderMaterial(
        id: string,
        updates: Partial<InsertProviderMaterial>
    ): Promise<ProviderMaterial> {
        const [updatedMaterial] = await db
            .update(providerMaterials)
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
        return await db
            .select()
            .from(serviceTasks)
            .where(eq(serviceTasks.categoryId, categoryId))
            .orderBy(asc(serviceTasks.taskName));
    }

    // Service Orders
    async createServiceOrder(
        order: InsertServiceOrder & { orderCode: string },
        items: InsertServiceOrderItem[]
    ): Promise<ServiceOrder> {
        const [newOrder] = await db
            .insert(serviceOrders)
            .values([order])
            .returning();

        if (items.length > 0) {
            const itemsWithOrderId = items.map((item) => ({
                ...item,
                serviceOrderId: newOrder.id,
            }));
            await db.insert(serviceOrderItems).values(itemsWithOrderId);
        }

        return newOrder;
    }

    async getServiceOrder(id: string): Promise<ServiceOrder | undefined> {
        const [order] = await db
            .select()
            .from(serviceOrders)
            .where(eq(serviceOrders.id, id));
        return order;
    }

    async getServiceOrderByCode(
        orderCode: string
    ): Promise<ServiceOrder | undefined> {
        const [order] = await db
            .select()
            .from(serviceOrders)
            .where(eq(serviceOrders.orderCode, orderCode));
        return order;
    }

    async getClientServiceOrders(clientId: string): Promise<ServiceOrder[]> {
        return await db
            .select()
            .from(serviceOrders)
            .where(eq(serviceOrders.clientId, clientId))
            .orderBy(desc(serviceOrders.createdAt));
    }

    async getProviderServiceOrders(
        providerId: string
    ): Promise<ServiceOrder[]> {
        return await db
            .select()
            .from(serviceOrders)
            .where(eq(serviceOrders.serviceProviderId, providerId))
            .orderBy(desc(serviceOrders.createdAt));
    }

    async getAllServiceOrders(): Promise<ServiceOrder[]> {
        return await db
            .select()
            .from(serviceOrders)
            .orderBy(desc(serviceOrders.createdAt));
    }

    async getFilteredServiceOrders(filters: {
        status?: string[];
        providerName?: string;
        dateFrom?: string;
        dateTo?: string;
        paymentStatus?: string;
    }): Promise<ServiceOrder[]> {
        let query = db
            .select({
                id: serviceOrders.id,
                orderCode: serviceOrders.orderCode,
                clientId: serviceOrders.clientId,
                serviceProviderId: serviceOrders.serviceProviderId,
                serviceDate: serviceOrders.serviceDate,
                startTime: serviceOrders.startTime,
                endTime: serviceOrders.endTime,
                status: serviceOrders.status,
                totalAmount: serviceOrders.totalAmount,
                platformFeeAmount: serviceOrders.platformFeeAmount,
                providerAmount: serviceOrders.providerAmount,
                paymentStatus: serviceOrders.paymentStatus,
                paymentIntentId: serviceOrders.paymentIntentId,
                specialInstructions: serviceOrders.specialInstructions,
                createdAt: serviceOrders.createdAt,
                updatedAt: serviceOrders.updatedAt,
                // Join provider details
                providerBusinessName: serviceProviders.businessName,
                // Join client details
                clientFirstName: users.firstName,
                clientLastName: users.lastName,
                clientEmail: users.email,
            })
            .from(serviceOrders)
            .leftJoin(serviceProviders, eq(serviceOrders.serviceProviderId, serviceProviders.id))
            .leftJoin(users, eq(serviceOrders.clientId, users.id))
            .$dynamic();

        const conditions = [];

        if (filters.status && filters.status.length > 0) {
            conditions.push(inArray(serviceOrders.status, filters.status as any));
        }

        if (filters.paymentStatus) {
            conditions.push(eq(serviceOrders.paymentStatus, filters.paymentStatus as any));
        }

        if (filters.dateFrom) {
            conditions.push(gte(serviceOrders.serviceDate, filters.dateFrom));
        }

        if (filters.dateTo) {
            conditions.push(lte(serviceOrders.serviceDate, filters.dateTo));
        }

        if (filters.providerName) {
            conditions.push(
                like(serviceProviders.businessName, `%${filters.providerName}%`)
            );
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions));
        }

        const results = await query.orderBy(desc(serviceOrders.createdAt));

        // Transform results to match ServiceOrder type
        return results.map(row => ({
            ...row,
            provider: row.providerBusinessName ? {
                businessName: row.providerBusinessName
            } : undefined,
            client: row.clientFirstName ? {
                firstName: row.clientFirstName,
                lastName: row.clientLastName,
                email: row.clientEmail,
            } : undefined,
        })) as any;
    }

    async updateServiceOrderStatus(
        id: string,
        status: string
    ): Promise<ServiceOrder> {
        const [updatedOrder] = await db
            .update(serviceOrders)
            .set({ status: status as any, updatedAt: new Date() })
            .where(eq(serviceOrders.id, id))
            .returning();
        return updatedOrder;
    }

    async updateServiceOrderPaymentStatus(
        id: string,
        paymentStatus: string
    ): Promise<ServiceOrder> {
        const [updatedOrder] = await db
            .update(serviceOrders)
            .set({ paymentStatus: paymentStatus as any, updatedAt: new Date() })
            .where(eq(serviceOrders.id, id))
            .returning();
        return updatedOrder;
    }

    async getServiceOrderItems(orderId: string): Promise<ServiceOrderItem[]> {
        return await db
            .select()
            .from(serviceOrderItems)
            .where(eq(serviceOrderItems.serviceOrderId, orderId))
            .orderBy(asc(serviceOrderItems.createdAt));
    }

    async updateServiceOrderItem(
        id: string,
        updates: Partial<ServiceOrderItem>
    ): Promise<ServiceOrderItem> {
        const [updatedItem] = await db
            .update(serviceOrderItems)
            .set(updates)
            .where(eq(serviceOrderItems.id, id))
            .returning();
        return updatedItem;
    }

    // Provider Availability
    async getProviderAvailability(
        providerId: string,
        startDate: string,
        endDate: string
    ): Promise<ProviderAvailability[]> {
        return await db
            .select()
            .from(providerAvailability)
            .where(
                and(
                    eq(providerAvailability.serviceProviderId, providerId),
                    gte(providerAvailability.date, startDate),
                    lte(providerAvailability.date, endDate)
                )
            )
            .orderBy(asc(providerAvailability.date));
    }

    async createProviderAvailability(
        availability: InsertProviderAvailability
    ): Promise<ProviderAvailability> {
        const [newAvailability] = await db
            .insert(providerAvailability)
            .values(availability)
            .returning();
        return newAvailability;
    }

    async updateProviderAvailability(
        id: string,
        updates: Partial<InsertProviderAvailability>
    ): Promise<ProviderAvailability> {
        const [updatedAvailability] = await db
            .update(providerAvailability)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(providerAvailability.id, id))
            .returning();
        return updatedAvailability;
    }

    async deleteProviderAvailability(id: string): Promise<void> {
        await db
            .delete(providerAvailability)
            .where(eq(providerAvailability.id, id));
    }

    // Provider Pricing
    async getProviderPricing(
        providerId: string
    ): Promise<ProviderPricing | undefined> {
        const [pricing] = await db
            .select()
            .from(providerPricing)
            .where(eq(providerPricing.serviceProviderId, providerId));
        return pricing;
    }

    async upsertProviderPricing(
        pricing: InsertProviderPricing
    ): Promise<ProviderPricing> {
        const [result] = await db
            .insert(providerPricing)
            .values(pricing)
            .onConflictDoUpdate({
                target: providerPricing.serviceProviderId,
                set: {
                    ...pricing,
                    updatedAt: new Date(),
                },
            })
            .returning();
        return result;
    }

    async calculateServicePrice(
        providerId: string,
        basePrice: number,
        options: {
            isWeekend?: boolean;
            isHoliday?: boolean;
            isLastMinute?: boolean;
            isEarlyBird?: boolean;
            isRecurring?: boolean;
            distance?: number;
            materialsCost?: number;
        }
    ): Promise<number> {
        const pricing = await this.getProviderPricing(providerId);

        if (!pricing) {
            return basePrice;
        }

        let finalPrice = basePrice;

        if (options.isWeekend && pricing.weekendSurcharge) {
            finalPrice +=
                (basePrice * parseFloat(pricing.weekendSurcharge)) / 100;
        }

        if (options.isHoliday && pricing.holidaySurcharge) {
            finalPrice +=
                (basePrice * parseFloat(pricing.holidaySurcharge)) / 100;
        }

        if (options.isLastMinute && pricing.lastMinuteFee) {
            finalPrice += parseFloat(pricing.lastMinuteFee);
        }

        if (options.isEarlyBird && pricing.earlyBirdDiscount) {
            finalPrice -=
                (basePrice * parseFloat(pricing.earlyBirdDiscount)) / 100;
        }

        if (options.isRecurring && pricing.recurringDiscount) {
            finalPrice -=
                (basePrice * parseFloat(pricing.recurringDiscount)) / 100;
        }

        if (options.distance) {
            if (pricing.travelFeeFixed) {
                finalPrice += parseFloat(pricing.travelFeeFixed);
            }
            if (pricing.travelFeePerKm) {
                finalPrice +=
                    options.distance * parseFloat(pricing.travelFeePerKm);
            }
        }

        if (options.materialsCost && pricing.materialMarkup) {
            const markup =
                (options.materialsCost * parseFloat(pricing.materialMarkup)) /
                100;
            finalPrice += options.materialsCost + markup;
        }

        return finalPrice;
    }

    // NEW FEATURES - Favorites
    async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
        const [result] = await db
            .insert(favorites)
            .values(favorite)
            .returning();
        return result;
    }

    async removeFavorite(id: string, userId: string): Promise<void> {
        await db
            .delete(favorites)
            .where(and(eq(favorites.id, id), eq(favorites.userId, userId)));
    }

    async getUserFavorites(userId: string): Promise<Favorite[]> {
        return await db
            .select()
            .from(favorites)
            .where(eq(favorites.userId, userId));
    }

    // NEW FEATURES - Promotional Codes
    async validatePromoCode(
        code: string,
        userId: string,
        bookingId?: string,
        serviceOrderId?: string
    ): Promise<{ valid: boolean; discount?: number; message?: string }> {
        const [promoCode] = await db
            .select()
            .from(promotionalCodes)
            .where(eq(promotionalCodes.code, code));

        if (!promoCode) {
            return { valid: false, message: "Invalid promo code" };
        }

        if (!promoCode.isActive) {
            return {
                valid: false,
                message: "This promo code is no longer active",
            };
        }

        const now = new Date();
        if (
            now < new Date(promoCode.validFrom) ||
            now > new Date(promoCode.validUntil)
        ) {
            return { valid: false, message: "This promo code has expired" };
        }

        if (
            promoCode.maxUses &&
            (promoCode.usedCount || 0) >= promoCode.maxUses
        ) {
            return {
                valid: false,
                message: "This promo code has reached its usage limit",
            };
        }

        const userUsage = await db
            .select()
            .from(promoCodeUsage)
            .where(
                and(
                    eq(promoCodeUsage.promoCodeId, promoCode.id),
                    eq(promoCodeUsage.userId, userId)
                )
            );

        if (userUsage.length > 0) {
            return {
                valid: false,
                message: "You have already used this promo code",
            };
        }

        return {
            valid: true,
            discount: parseFloat(promoCode.discountValue),
            message: "Promo code applied successfully",
        };
    }

    async createPromoCode(
        code: InsertPromotionalCode
    ): Promise<PromotionalCode> {
        const [result] = await db
            .insert(promotionalCodes)
            .values(code)
            .returning();
        return result;
    }

    async getAllPromoCodes(): Promise<PromotionalCode[]> {
        return await db
            .select()
            .from(promotionalCodes)
            .orderBy(desc(promotionalCodes.createdAt));
    }

    // NEW FEATURES - Loyalty Points
    async getUserLoyaltyPoints(
        userId: string
    ): Promise<LoyaltyPoints | undefined> {
        const [points] = await db
            .select()
            .from(loyaltyPoints)
            .where(eq(loyaltyPoints.userId, userId));

        if (!points) {
            const [newPoints] = await db
                .insert(loyaltyPoints)
                .values({ userId, points: 0, lifetimePoints: 0 })
                .returning();
            return newPoints;
        }

        return points;
    }

    async getLoyaltyPointsHistory(
        userId: string
    ): Promise<LoyaltyPointsTransaction[]> {
        return await db
            .select()
            .from(loyaltyPointsTransactions)
            .where(eq(loyaltyPointsTransactions.userId, userId))
            .orderBy(desc(loyaltyPointsTransactions.createdAt));
    }

    async awardLoyaltyPoints(
        userId: string,
        points: number,
        reason: string,
        bookingId?: string,
        serviceOrderId?: string
    ): Promise<void> {
        await db.insert(loyaltyPointsTransactions).values({
            userId,
            points,
            transactionType: "earned",
            reason,
            bookingId,
            serviceOrderId,
        });

        const currentPoints = await this.getUserLoyaltyPoints(userId);
        if (currentPoints) {
            await db
                .update(loyaltyPoints)
                .set({
                    points: (currentPoints.points || 0) + points,
                    lifetimePoints:
                        (currentPoints.lifetimePoints || 0) + points,
                    updatedAt: new Date(),
                })
                .where(eq(loyaltyPoints.userId, userId));
        }
    }

    async redeemLoyaltyPoints(
        userId: string,
        points: number,
        reason: string
    ): Promise<void> {
        const currentPoints = await this.getUserLoyaltyPoints(userId);

        if (!currentPoints || (currentPoints.points || 0) < points) {
            throw new Error("Insufficient loyalty points");
        }

        await db.insert(loyaltyPointsTransactions).values({
            userId,
            points: -points,
            transactionType: "redeemed",
            reason,
        });

        await db
            .update(loyaltyPoints)
            .set({
                points: (currentPoints.points || 0) - points,
                updatedAt: new Date(),
            })
            .where(eq(loyaltyPoints.userId, userId));
    }

    // NEW FEATURES - Booking Cancellations
    async requestBookingCancellation(
        bookingId: string,
        userId: string,
        reason: string
    ): Promise<BookingCancellation> {
        const booking = await this.getBooking(bookingId);

        if (!booking) {
            throw new Error("Booking not found");
        }

        const refundAmount = parseFloat(booking.totalAmount);
        const cancellationFee = refundAmount * 0.1;

        const [cancellation] = await db
            .insert(bookingCancellations)
            .values({
                bookingId,
                requestedBy: userId,
                reason,
                cancellationFee: cancellationFee.toString(),
                refundAmount: (refundAmount - cancellationFee).toString(),
                status: "pending",
            })
            .returning();

        // Notify all admins about the new cancellation request
        const allUsers = await this.getAllUsers();
        const admins = allUsers.filter((u) => u.role === "admin");

        for (const admin of admins) {
            await this.createNotification({
                userId: admin.id,
                title: "New Cancellation Request",
                message: `A new cancellation request has been submitted for booking ${booking.bookingCode}`,
                type: "cancellation",
                relatedId: cancellation.id,
            });
        }

        return cancellation;
    }

    async updateCancellationStatus(
        id: string,
        status: string,
        approvedBy: string,
        rejectionReason?: string
    ): Promise<BookingCancellation> {
        // Get the cancellation first to get booking info and user
        const [cancellation] = await db
            .select()
            .from(bookingCancellations)
            .where(eq(bookingCancellations.id, id));

        const updates: any = {
            status,
            approvedBy,
            updatedAt: new Date(),
        };

        if (rejectionReason) {
            updates.rejectionReason = rejectionReason;
        }

        if (status === "refunded") {
            updates.refundedAt = new Date();
        }

        const [result] = await db
            .update(bookingCancellations)
            .set(updates)
            .where(eq(bookingCancellations.id, id))
            .returning();

        // Notify the user who requested the cancellation
        if (cancellation && cancellation.requestedBy) {
            const booking = await this.getBooking(cancellation.bookingId);
            
            if (status === "approved") {
                await this.createNotification({
                    userId: cancellation.requestedBy,
                    title: "Cancellation Approved",
                    message: `Your cancellation request for booking ${booking?.bookingCode} has been approved. Refund will be processed soon.`,
                    type: "approval",
                    relatedId: id,
                });
            } else if (status === "rejected") {
                await this.createNotification({
                    userId: cancellation.requestedBy,
                    title: "Cancellation Rejected",
                    message: `Your cancellation request for booking ${booking?.bookingCode} has been rejected. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`,
                    type: "rejection",
                    relatedId: id,
                });
            }
        }

        return result;
    }

    async getAllCancellations(): Promise<BookingCancellation[]> {
        return await db
            .select()
            .from(bookingCancellations)
            .orderBy(desc(bookingCancellations.createdAt));
    }

    async getUserCancellations(userId: string): Promise<BookingCancellationWithBooking[]> {
        const results = await db
            .select({
                id: bookingCancellations.id,
                bookingId: bookingCancellations.bookingId,
                requestedBy: bookingCancellations.requestedBy,
                reason: bookingCancellations.reason,
                cancellationFee: bookingCancellations.cancellationFee,
                refundAmount: bookingCancellations.refundAmount,
                status: bookingCancellations.status,
                approvedBy: bookingCancellations.approvedBy,
                rejectionReason: bookingCancellations.rejectionReason,
                refundedAt: bookingCancellations.refundedAt,
                createdAt: bookingCancellations.createdAt,
                updatedAt: bookingCancellations.updatedAt,
                bookingCode: bookings.bookingCode,
            })
            .from(bookingCancellations)
            .innerJoin(bookings, eq(bookingCancellations.bookingId, bookings.id))
            .where(eq(bookings.clientId, userId))
            .orderBy(desc(bookingCancellations.createdAt));
        
        return results as BookingCancellationWithBooking[];
    }

    // NEW FEATURES - Trip Plans
    async createTripPlan(plan: InsertTripPlan): Promise<TripPlan> {
        const [result] = await db.insert(tripPlans).values(plan).returning();
        return result;
    }

    async getUserTripPlans(userId: string): Promise<TripPlan[]> {
        return await db
            .select()
            .from(tripPlans)
            .where(eq(tripPlans.userId, userId))
            .orderBy(desc(tripPlans.createdAt));
    }

    async getTripPlanWithItems(
        id: string,
        userId: string
    ): Promise<TripPlan & { items: TripPlanItem[] }> {
        const [plan] = await db
            .select()
            .from(tripPlans)
            .where(and(eq(tripPlans.id, id), eq(tripPlans.userId, userId)));

        if (!plan) {
            throw new Error("Trip plan not found");
        }

        const items = await db
            .select()
            .from(tripPlanItems)
            .where(eq(tripPlanItems.tripPlanId, id))
            .orderBy(asc(tripPlanItems.sortOrder));

        return { ...plan, items };
    }

    async addTripPlanItem(item: InsertTripPlanItem): Promise<TripPlanItem> {
        const [result] = await db
            .insert(tripPlanItems)
            .values(item)
            .returning();
        return result;
    }

    // NEW FEATURES - Service Packages
    async createServicePackage(
        package_: InsertServicePackage
    ): Promise<ServicePackage> {
        const [result] = await db
            .insert(servicePackages)
            .values(package_)
            .returning();
        return result;
    }

    async getProviderPackages(providerId: string): Promise<ServicePackage[]> {
        return await db
            .select()
            .from(servicePackages)
            .where(eq(servicePackages.serviceProviderId, providerId))
            .orderBy(desc(servicePackages.createdAt));
    }

    // NEW FEATURES - Provider Earnings & Payouts
    async getProviderByUserId(
        userId: string
    ): Promise<ServiceProvider | undefined> {
        const [provider] = await db
            .select()
            .from(serviceProviders)
            .where(eq(serviceProviders.userId, userId));
        return provider;
    }

    async getProviderEarnings(providerId: string): Promise<ProviderEarnings[]> {
        return await db
            .select()
            .from(providerEarnings)
            .where(eq(providerEarnings.serviceProviderId, providerId))
            .orderBy(desc(providerEarnings.year), desc(providerEarnings.month));
    }

    async requestPayout(payout: InsertProviderPayout): Promise<ProviderPayout> {
        const [result] = await db
            .insert(providerPayouts)
            .values(payout)
            .returning();
        return result;
    }

    // NEW FEATURES - Disputes
    async createDispute(dispute: InsertDispute): Promise<Dispute> {
        const [result] = await db.insert(disputes).values(dispute).returning();
        return result;
    }

    async getUserDisputes(userId: string): Promise<Dispute[]> {
        return await db
            .select()
            .from(disputes)
            .where(eq(disputes.raisedBy, userId))
            .orderBy(desc(disputes.createdAt));
    }

    async getAllDisputes(): Promise<Dispute[]> {
        return await db
            .select()
            .from(disputes)
            .orderBy(desc(disputes.createdAt));
    }

    async resolveDispute(
        id: string,
        resolution: string,
        resolvedBy: string
    ): Promise<Dispute> {
        const [result] = await db
            .update(disputes)
            .set({
                status: "resolved",
                resolution,
                resolvedBy,
                resolvedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(disputes.id, id))
            .returning();

        return result;
    }

    // NEW FEATURES - Platform Settings
    async getPublicSettings(): Promise<PlatformSetting[]> {
        return await db
            .select()
            .from(platformSettings)
            .where(eq(platformSettings.isPublic, true));
    }

    async getAllSettings(): Promise<PlatformSetting[]> {
        return await db
            .select()
            .from(platformSettings)
            .orderBy(asc(platformSettings.category));
    }

    async updateSetting(
        key: string,
        value: string,
        updatedBy: string
    ): Promise<PlatformSetting> {
        const [result] = await db
            .update(platformSettings)
            .set({
                settingValue: value,
                updatedBy,
                updatedAt: new Date(),
            })
            .where(eq(platformSettings.settingKey, key))
            .returning();

        return result;
    }

    // Contact Submissions
    async createContactSubmission(
        submission: InsertContactSubmission
    ): Promise<ContactSubmission> {
        const [result] = await db
            .insert(contactSubmissions)
            .values(submission)
            .returning();
        return result;
    }

    async getAllContactSubmissions(): Promise<ContactSubmission[]> {
        return await db
            .select()
            .from(contactSubmissions)
            .orderBy(desc(contactSubmissions.createdAt));
    }

    async updateContactSubmissionResponse(
        id: string,
        respondedBy: string,
        response: string
    ): Promise<ContactSubmission> {
        const [result] = await db
            .update(contactSubmissions)
            .set({
                status: "responded",
                respondedBy,
                response,
            })
            .where(eq(contactSubmissions.id, id))
            .returning();

        return result;
    }

    // Job Postings
    async getActiveJobPostings(): Promise<JobPosting[]> {
        return await db
            .select()
            .from(jobPostings)
            .where(eq(jobPostings.status, "active"))
            .orderBy(desc(jobPostings.createdAt));
    }

    async getJobPosting(id: string): Promise<JobPosting | undefined> {
        const [result] = await db
            .select()
            .from(jobPostings)
            .where(eq(jobPostings.id, id));
        return result;
    }

    async createJobPosting(posting: InsertJobPosting): Promise<JobPosting> {
        const [result] = await db
            .insert(jobPostings)
            .values(posting)
            .returning();
        return result;
    }

    async updateJobPosting(
        id: string,
        updates: Partial<InsertJobPosting>
    ): Promise<JobPosting> {
        const [result] = await db
            .update(jobPostings)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(jobPostings.id, id))
            .returning();

        return result;
    }

    async deleteJobPosting(id: string): Promise<void> {
        await db.delete(jobPostings).where(eq(jobPostings.id, id));
    }

    // Job Applications
    async createJobApplication(
        application: InsertJobApplication
    ): Promise<JobApplication> {
        const [result] = await db
            .insert(jobApplications)
            .values(application)
            .returning();
        return result;
    }

    async getAllJobApplications(): Promise<JobApplication[]> {
        return await db
            .select()
            .from(jobApplications)
            .orderBy(desc(jobApplications.createdAt));
    }

    async getJobApplicationsByJobId(jobId: string): Promise<JobApplication[]> {
        return await db
            .select()
            .from(jobApplications)
            .where(eq(jobApplications.jobPostingId, jobId))
            .orderBy(desc(jobApplications.createdAt));
    }

    async updateJobApplicationStatus(
        id: string,
        status: string,
        reviewedBy: string,
        notes?: string
    ): Promise<JobApplication> {
        const updateData: any = {
            status: status as any,
            reviewedBy,
        };

        if (notes !== undefined) {
            updateData.notes = notes;
        }

        const [result] = await db
            .update(jobApplications)
            .set(updateData)
            .where(eq(jobApplications.id, id))
            .returning();

        return result;
    }

    // Blog Posts
    async getPublishedBlogPosts(): Promise<BlogPost[]> {
        return await db
            .select()
            .from(blogPosts)
            .where(eq(blogPosts.status, "published"))
            .orderBy(desc(blogPosts.publishedAt));
    }

    async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
        const [result] = await db
            .select()
            .from(blogPosts)
            .where(
                and(eq(blogPosts.slug, slug), eq(blogPosts.status, "published"))
            );
        return result;
    }

    async getBlogPost(id: string): Promise<BlogPost | undefined> {
        const [result] = await db
            .select()
            .from(blogPosts)
            .where(eq(blogPosts.id, id));
        return result;
    }

    async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
        const [result] = await db.insert(blogPosts).values(post).returning();
        return result;
    }

    async updateBlogPost(
        id: string,
        updates: Partial<InsertBlogPost>
    ): Promise<BlogPost> {
        const [result] = await db
            .update(blogPosts)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(blogPosts.id, id))
            .returning();

        return result;
    }

    async deleteBlogPost(id: string): Promise<void> {
        await db.delete(blogPosts).where(eq(blogPosts.id, id));
    }

    // Role Change Requests
    async createRoleChangeRequest(
        userId: string,
        requestedRole: string,
        requestNote?: string
    ): Promise<RoleChangeRequest> {
        const [request] = await db
            .insert(roleChangeRequests)
            .values({
                userId,
                requestedRole: requestedRole as any,
                requestNote,
                status: "pending",
            })
            .returning();
        return request;
    }

    async getPendingRoleChangeRequest(
        userId: string
    ): Promise<RoleChangeRequest | undefined> {
        const [request] = await db
            .select()
            .from(roleChangeRequests)
            .where(
                and(
                    eq(roleChangeRequests.userId, userId),
                    eq(roleChangeRequests.status, "pending")
                )
            )
            .orderBy(desc(roleChangeRequests.requestedAt))
            .limit(1);
        return request;
    }

    async getAllRoleChangeRequests(
        status?: string
    ): Promise<RoleChangeRequest[]> {
        const conditions = [];
        if (status) {
            conditions.push(eq(roleChangeRequests.status, status as any));
        }

        const query = db
            .select()
            .from(roleChangeRequests)
            .orderBy(desc(roleChangeRequests.requestedAt));

        if (conditions.length > 0) {
            return await query.where(and(...conditions));
        }
        return await query;
    }

    async approveRoleChangeRequest(
        requestId: string,
        reviewedBy: string,
        adminNote?: string
    ): Promise<RoleChangeRequest> {
        return await db.transaction(async (tx) => {
            const [request] = await tx
                .select()
                .from(roleChangeRequests)
                .where(eq(roleChangeRequests.id, requestId));

            if (!request) {
                throw new Error("Role change request not found");
            }

            if (request.status !== "pending") {
                throw new Error(
                    "Only pending requests can be approved"
                );
            }

            await tx
                .update(users)
                .set({
                    role: request.requestedRole as any,
                    updatedAt: new Date(),
                })
                .where(eq(users.id, request.userId));

            const [updatedRequest] = await tx
                .update(roleChangeRequests)
                .set({
                    status: "approved",
                    reviewedBy,
                    reviewedAt: new Date(),
                    adminNote,
                })
                .where(eq(roleChangeRequests.id, requestId))
                .returning();

            return updatedRequest;
        });
    }

    async rejectRoleChangeRequest(
        requestId: string,
        reviewedBy: string,
        adminNote: string
    ): Promise<RoleChangeRequest> {
        const [request] = await db
            .update(roleChangeRequests)
            .set({
                status: "rejected",
                reviewedBy,
                reviewedAt: new Date(),
                adminNote,
            })
            .where(eq(roleChangeRequests.id, requestId))
            .returning();

        if (!request) {
            throw new Error("Role change request not found");
        }

        return request;
    }
}

export const storage = new DatabaseStorage();
