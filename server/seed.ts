import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import "dotenv/config";
import {
    bookings,
    properties,
    reviews,
    serviceBookings,
    serviceCategories,
    serviceProviders,
    users,
    serviceOrderItems,
    serviceTaskAssignments,
    jobAssignments,
    providerTaskConfigs,
    providerMaterials,
    providerAvailability,
    providerPricing,
    providerMenus,
    menuItems,
    providerEarnings,
    providerPayouts,
    servicePackages,
    propertyServices,
    tripPlanItems,
    promoCodeUsage,
    loyaltyPointsTransactions,
    bookingCancellations,
    disputeMessages,
    disputes,
    jobApplications,
    regionalAnalytics,
    userActivityLogs,
    favorites,
    payments,
    messages,
    notifications,
    serviceOrders,
    tripPlans,
    loyaltyPoints,
    jobPostings,
    propertySeasonalPricing,
    contactSubmissions,
    serviceTasks,
    promotionalCodes,
    territories,
    platformSettings,
    emailTemplates,
    blogPosts,
    sessions,
    roleChangeRequests,
} from "../shared/schema";
import { db } from "./db";

async function seed() {
    console.log("🌱 Starting database seeding...");

    try {
        // Delete existing data in reverse order of dependencies (child-first → root)
        console.log("Cleaning existing data...");
        await db.delete(serviceOrderItems);
        await db.delete(serviceTaskAssignments);
        await db.delete(jobAssignments);
        await db.delete(providerTaskConfigs);
        await db.delete(providerMaterials);
        await db.delete(providerAvailability);
        await db.delete(providerPricing);
        await db.delete(providerMenus);
        await db.delete(menuItems);
        await db.delete(providerEarnings);
        await db.delete(providerPayouts);
        await db.delete(servicePackages);
        await db.delete(propertyServices);
        await db.delete(tripPlanItems);
        await db.delete(promoCodeUsage);
        await db.delete(loyaltyPointsTransactions);
        await db.delete(bookingCancellations);
        await db.delete(disputeMessages);
        await db.delete(disputes);
        await db.delete(jobApplications);
        await db.delete(regionalAnalytics);
        await db.delete(userActivityLogs);
        await db.delete(favorites);
        await db.delete(payments);
        await db.delete(messages);
        await db.delete(reviews);
        await db.delete(notifications);
        await db.delete(serviceBookings);
        await db.delete(serviceOrders);
        await db.delete(tripPlans);
        await db.delete(loyaltyPoints);
        await db.delete(jobPostings);
        await db.delete(propertySeasonalPricing);
        await db.delete(contactSubmissions);
        await db.delete(bookings);
        await db.delete(serviceTasks);
        await db.delete(serviceProviders);
        await db.delete(properties);
        await db.delete(serviceCategories);
        await db.delete(promotionalCodes);
        await db.delete(territories);
        await db.delete(platformSettings);
        await db.delete(emailTemplates);
        await db.delete(blogPosts);
        await db.delete(sessions);
        await db.delete(roleChangeRequests);
        await db.delete(users);
        console.log("✓ Existing data cleaned");

        // Create sample users with different roles
        const hashedPassword = await bcrypt.hash("password123", 10);

        // Generate UUIDs for users
        const adminId = randomUUID();
        const billingId = randomUUID();
        const operationId = randomUUID();
        const marketingId = randomUUID();
        const client1Id = randomUUID();
        const client2Id = randomUUID();
        const client3Id = randomUUID();
        const owner1Id = randomUUID();
        const owner2Id = randomUUID();
        const owner3Id = randomUUID();
        const provider1Id = randomUUID();
        const provider2Id = randomUUID();
        const provider3Id = randomUUID();
        const countryManagerId = randomUUID();
        const cityManagerId = randomUUID();
        const operationSupportId = randomUUID();

        const sampleUsers = [
            {
                id: adminId,
                email: "admin@test.com",
                password: hashedPassword,
                firstName: "Admin",
                lastName: "User",
                role: "admin" as const,
            },
            {
                id: billingId,
                email: "billing@test.com",
                password: hashedPassword,
                firstName: "Bill",
                lastName: "Finance",
                role: "billing" as const,
            },
            {
                id: operationId,
                email: "operation@test.com",
                password: hashedPassword,
                firstName: "Ops",
                lastName: "Manager",
                role: "operation" as const,
            },
            {
                id: marketingId,
                email: "marketing@test.com",
                password: hashedPassword,
                firstName: "Mark",
                lastName: "Campaign",
                role: "marketing" as const,
            },
            {
                id: client1Id,
                email: "client1@test.com",
                password: hashedPassword,
                firstName: "Sarah",
                lastName: "Johnson",
                role: "client" as const,
            },
            {
                id: client2Id,
                email: "client2@test.com",
                password: hashedPassword,
                firstName: "Michael",
                lastName: "Chen",
                role: "client" as const,
            },
            {
                id: client3Id,
                email: "client3@test.com",
                password: hashedPassword,
                firstName: "Emma",
                lastName: "Davis",
                role: "client" as const,
            },
            {
                id: owner1Id,
                email: "owner1@test.com",
                password: hashedPassword,
                firstName: "David",
                lastName: "Martinez",
                role: "property_owner" as const,
            },
            {
                id: owner2Id,
                email: "owner2@test.com",
                password: hashedPassword,
                firstName: "Emily",
                lastName: "Thompson",
                role: "property_owner" as const,
            },
            {
                id: owner3Id,
                email: "owner3@test.com",
                password: hashedPassword,
                firstName: "Robert",
                lastName: "Brown",
                role: "property_owner" as const,
            },
            {
                id: provider1Id,
                email: "provider1@test.com",
                password: hashedPassword,
                firstName: "Carlos",
                lastName: "Rodriguez",
                role: "service_provider" as const,
            },
            {
                id: provider2Id,
                email: "provider2@test.com",
                password: hashedPassword,
                firstName: "Lisa",
                lastName: "Anderson",
                role: "service_provider" as const,
            },
            {
                id: provider3Id,
                email: "provider3@test.com",
                password: hashedPassword,
                firstName: "Tom",
                lastName: "Miller",
                role: "service_provider" as const,
            },
            {
                id: countryManagerId,
                email: "country_manager@test.com",
                password: hashedPassword,
                firstName: "James",
                lastName: "Wilson",
                role: "country_manager" as const,
            },
            {
                id: cityManagerId,
                email: "city_manager@test.com",
                password: hashedPassword,
                firstName: "City",
                lastName: "Chief",
                role: "city_manager" as const,
            },
            {
                id: operationSupportId,
                email: "operation_support@test.com",
                password: hashedPassword,
                firstName: "Support",
                lastName: "Team",
                role: "operation_support" as const,
            },
        ];

        console.log("Creating users...");
        await db.insert(users).values(sampleUsers).onConflictDoNothing();

        // Generate UUIDs for properties
        const prop1Id = randomUUID();
        const prop2Id = randomUUID();
        const prop3Id = randomUUID();
        const prop4Id = randomUUID();
        const prop5Id = randomUUID();
        const prop6Id = randomUUID();
        const prop7Id = randomUUID();
        const prop8Id = randomUUID();
        const prop9Id = randomUUID();
        const prop10Id = randomUUID();
        const prop11Id = randomUUID();
        const prop12Id = randomUUID();
        const prop13Id = randomUUID();
        const prop14Id = randomUUID();
        const prop15Id = randomUUID();

        // Create sample properties
        const sampleProperties = [
            {
                id: prop1Id,
                ownerId: owner1Id,
                title: "Luxury Beachfront Villa",
                description:
                    "Stunning ocean views with private beach access. Perfect for families and groups looking for an unforgettable vacation experience.",
                location: "Miami Beach, FL",
                pricePerNight: "450",
                maxGuests: 8,
                bedrooms: 4,
                bathrooms: 3,
                amenities: [
                    "WiFi",
                    "Pool",
                    "Beach Access",
                    "Air Conditioning",
                    "Kitchen",
                    "Parking",
                ],
                images: [
                    "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800",
                    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
                ],
                rating: "4.9",
                isActive: true,
            },
            {
                id: prop2Id,
                ownerId: owner1Id,
                title: "Modern Downtown Apartment",
                description:
                    "Sleek and stylish apartment in the heart of the city. Walking distance to restaurants, shops, and entertainment.",
                location: "New York, NY",
                pricePerNight: "280",
                maxGuests: 4,
                bedrooms: 2,
                bathrooms: 2,
                amenities: [
                    "WiFi",
                    "Gym",
                    "Doorman",
                    "Air Conditioning",
                    "Kitchen",
                ],
                images: [
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
                    "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800",
                ],
                rating: "4.7",
                isActive: true,
            },
            {
                id: prop3Id,
                ownerId: owner2Id,
                title: "Cozy Mountain Cabin",
                description:
                    "Peaceful retreat surrounded by nature. Ideal for hiking enthusiasts and those seeking tranquility.",
                location: "Aspen, CO",
                pricePerNight: "320",
                maxGuests: 6,
                bedrooms: 3,
                bathrooms: 2,
                amenities: [
                    "WiFi",
                    "Fireplace",
                    "Mountain View",
                    "Kitchen",
                    "Parking",
                    "Hot Tub",
                ],
                images: [
                    "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800",
                    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
                ],
                rating: "4.8",
                isActive: true,
            },
            {
                id: prop4Id,
                ownerId: owner2Id,
                title: "Historic City Loft",
                description:
                    "Beautifully restored loft in a historic building. High ceilings and original architectural details.",
                location: "San Francisco, CA",
                pricePerNight: "350",
                maxGuests: 5,
                bedrooms: 2,
                bathrooms: 2,
                amenities: [
                    "WiFi",
                    "Air Conditioning",
                    "Kitchen",
                    "Workspace",
                    "Parking",
                ],
                images: [
                    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
                    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
                ],
                rating: "4.6",
                isActive: true,
            },
            {
                id: prop5Id,
                ownerId: owner1Id,
                title: "Tropical Paradise Bungalow",
                description:
                    "Private bungalow surrounded by lush gardens. Experience island living at its finest.",
                location: "Maui, HI",
                pricePerNight: "520",
                maxGuests: 4,
                bedrooms: 2,
                bathrooms: 2,
                amenities: [
                    "WiFi",
                    "Beach Access",
                    "Pool",
                    "Garden",
                    "Kitchen",
                    "Outdoor Shower",
                ],
                images: [
                    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800",
                    "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
                ],
                rating: "5.0",
                isActive: true,
            },
            {
                id: prop6Id,
                ownerId: owner2Id,
                title: "Parisian Luxury Penthouse",
                description:
                    "Stunning penthouse overlooking the Eiffel Tower. Elegant French design with modern amenities.",
                location: "Paris, France",
                pricePerNight: "850",
                maxGuests: 6,
                bedrooms: 3,
                bathrooms: 2,
                amenities: ["WiFi", "Balcony", "Eiffel Tower View", "Air Conditioning", "Kitchen", "Wine Cellar"],
                images: [
                    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
                    "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800",
                ],
                rating: "4.9",
                isActive: true,
            },
            {
                id: prop7Id,
                ownerId: owner3Id,
                title: "Tokyo Modern Studio",
                description:
                    "Minimalist studio in Shibuya district. Perfect location for exploring Tokyo's vibrant culture.",
                location: "Tokyo, Japan",
                pricePerNight: "180",
                maxGuests: 2,
                bedrooms: 1,
                bathrooms: 1,
                amenities: ["WiFi", "Metro Access", "Air Conditioning", "Mini Kitchen", "Washer"],
                images: [
                    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
                    "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800",
                ],
                rating: "4.7",
                isActive: true,
            },
            {
                id: prop8Id,
                ownerId: owner2Id,
                title: "Dubai Marina Skyscraper",
                description:
                    "Luxurious high-rise apartment with breathtaking marina views. World-class amenities and service.",
                location: "Dubai, UAE",
                pricePerNight: "650",
                maxGuests: 8,
                bedrooms: 4,
                bathrooms: 3,
                amenities: ["WiFi", "Pool", "Gym", "Concierge", "Parking", "Marina View", "Smart Home"],
                images: [
                    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
                    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
                ],
                rating: "4.8",
                isActive: true,
            },
            {
                id: prop9Id,
                ownerId: owner3Id,
                title: "Barcelona Gothic Quarter Apartment",
                description:
                    "Charming apartment in the heart of Barcelona's historic quarter. Walking distance to major attractions.",
                location: "Barcelona, Spain",
                pricePerNight: "220",
                maxGuests: 4,
                bedrooms: 2,
                bathrooms: 1,
                amenities: ["WiFi", "Air Conditioning", "Balcony", "Kitchen", "Historic Building"],
                images: [
                    "https://images.unsplash.com/photo-1562883676-8c7feb83f09b?w=800",
                    "https://images.unsplash.com/photo-1583066292338-91e1dca6cffc?w=800",
                ],
                rating: "4.6",
                isActive: true,
            },
            {
                id: prop10Id,
                ownerId: owner1Id,
                title: "Bali Infinity Pool Villa",
                description:
                    "Private villa with infinity pool overlooking rice terraces. Ultimate tropical relaxation.",
                location: "Ubud, Bali",
                pricePerNight: "380",
                maxGuests: 6,
                bedrooms: 3,
                bathrooms: 2,
                amenities: ["WiFi", "Infinity Pool", "Rice Terrace View", "Kitchen", "Garden", "Yoga Deck"],
                images: [
                    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
                ],
                rating: "5.0",
                isActive: true,
            },
            {
                id: prop11Id,
                ownerId: owner2Id,
                title: "London Thames Loft",
                description:
                    "Industrial-chic loft along the River Thames. Contemporary design meets historic charm.",
                location: "London, UK",
                pricePerNight: "420",
                maxGuests: 5,
                bedrooms: 2,
                bathrooms: 2,
                amenities: ["WiFi", "River View", "Exposed Brick", "Kitchen", "Workspace", "Parking"],
                images: [
                    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800",
                    "https://images.unsplash.com/photo-1567428485548-95eaa89258c5?w=800",
                ],
                rating: "4.7",
                isActive: true,
            },
            {
                id: prop12Id,
                ownerId: owner3Id,
                title: "Swiss Alps Chalet",
                description:
                    "Cozy mountain chalet with spectacular alpine views. Perfect for skiing and hiking enthusiasts.",
                location: "Zermatt, Switzerland",
                pricePerNight: "580",
                maxGuests: 8,
                bedrooms: 4,
                bathrooms: 3,
                amenities: ["WiFi", "Fireplace", "Mountain View", "Ski Storage", "Kitchen", "Sauna", "Balcony"],
                images: [
                    "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800",
                    "https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=800",
                ],
                rating: "4.9",
                isActive: true,
            },
            {
                id: prop13Id,
                ownerId: owner1Id,
                title: "Santorini Cave House",
                description:
                    "Traditional cave house with iconic white-washed walls and caldera views. Authentic Greek island experience.",
                location: "Santorini, Greece",
                pricePerNight: "480",
                maxGuests: 4,
                bedrooms: 2,
                bathrooms: 2,
                amenities: ["WiFi", "Caldera View", "Private Terrace", "Kitchen", "Outdoor Jacuzzi"],
                images: [
                    "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800",
                    "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800",
                ],
                rating: "5.0",
                isActive: true,
            },
            {
                id: prop14Id,
                ownerId: owner2Id,
                title: "Rome Colosseum View Apartment",
                description:
                    "Historic apartment with direct views of the Colosseum. Immerse yourself in ancient Roman history.",
                location: "Rome, Italy",
                pricePerNight: "390",
                maxGuests: 5,
                bedrooms: 2,
                bathrooms: 2,
                amenities: ["WiFi", "Colosseum View", "Air Conditioning", "Kitchen", "Historic Building", "Balcony"],
                images: [
                    "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800",
                    "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800",
                ],
                rating: "4.8",
                isActive: true,
            },
            {
                id: prop15Id,
                ownerId: owner3Id,
                title: "Phuket Beachfront Resort Villa",
                description:
                    "Luxurious resort villa with direct beach access. Private pool and stunning Andaman Sea views.",
                location: "Phuket, Thailand",
                pricePerNight: "720",
                maxGuests: 10,
                bedrooms: 5,
                bathrooms: 4,
                amenities: ["WiFi", "Beach Access", "Private Pool", "Garden", "Kitchen", "Staff Service", "BBQ Area"],
                images: [
                    "https://images.unsplash.com/photo-1573790387438-4da905039392?w=800",
                    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
                ],
                rating: "5.0",
                isActive: true,
            },
        ];

        console.log("Creating properties...");
        await db
            .insert(properties)
            .values(sampleProperties)
            .onConflictDoNothing();

        // Create service categories
        console.log("Creating service categories...");
        const serviceCategoryIds = {
            maid: randomUUID(),
            transport: randomUUID(),
            dining: randomUUID(),
            concierge: randomUUID(),
            tour: randomUUID(),
            spa: randomUUID(),
            photography: randomUUID(),
            chef: randomUUID(),
            massage: randomUUID(),
            laundry: randomUUID(),
        };

        await db
            .insert(serviceCategories)
            .values([
                {
                    id: serviceCategoryIds.maid,
                    name: "Maid Service",
                    description: "Professional cleaning and housekeeping services",
                },
                {
                    id: serviceCategoryIds.transport,
                    name: "Transport",
                    description: "Airport transfers, car rentals, and transportation",
                },
                {
                    id: serviceCategoryIds.dining,
                    name: "Private Dining",
                    description: "Private chef and catering services",
                },
                {
                    id: serviceCategoryIds.concierge,
                    name: "Concierge",
                    description: "Personal assistant and concierge services",
                },
                {
                    id: serviceCategoryIds.tour,
                    name: "Tour Guide",
                    description: "Local tour guides and travel experiences",
                },
                {
                    id: serviceCategoryIds.spa,
                    name: "Spa & Wellness",
                    description: "Spa treatments and wellness services",
                },
                {
                    id: serviceCategoryIds.photography,
                    name: "Photography",
                    description: "Professional photography and videography",
                },
                {
                    id: serviceCategoryIds.chef,
                    name: "Personal Chef",
                    description: "In-home chef and meal preparation",
                },
                {
                    id: serviceCategoryIds.massage,
                    name: "Massage Therapy",
                    description: "Professional massage and therapeutic services",
                },
                {
                    id: serviceCategoryIds.laundry,
                    name: "Laundry Service",
                    description: "Laundry and dry cleaning services",
                },
            ])
            .onConflictDoNothing();

        // Get service categories
        const categories = await db.select().from(serviceCategories);
        const maidCategory = categories.find((c) => c.name === "Maid Service");
        const transportCategory = categories.find(
            (c) => c.name === "Transport"
        );
        const diningCategory = categories.find(
            (c) => c.name === "Private Dining"
        );
        const conciergeCategory = categories.find(
            (c) => c.name === "Concierge"
        );

        if (
            !maidCategory ||
            !transportCategory ||
            !diningCategory ||
            !conciergeCategory
        ) {
            console.log(
                "⚠️  Some service categories not found. Skipping service providers..."
            );
            console.log(
                "Make sure service categories are created in the database first."
            );
        } else {
            // Generate UUIDs for providers
            const serviceProvider1Id = randomUUID();
            const serviceProvider2Id = randomUUID();
            const serviceProvider3Id = randomUUID();
            const serviceProvider4Id = randomUUID();
            const serviceProvider5Id = randomUUID();
            const serviceProvider6Id = randomUUID();

            // Create service providers
            const sampleProviders = [
                {
                    id: serviceProvider1Id,
                    categoryId: maidCategory?.id || "",
                    userId: provider1Id,
                    businessName: "Premium Cleaning Services",
                    description:
                        "Professional cleaning with attention to detail. 10+ years experience.",
                    location: "Miami Beach, FL",
                    hourlyRate: "45",
                    rating: "4.9",
                    isActive: true,
                    approvalStatus: "approved" as const,
                },
                {
                    id: serviceProvider2Id,
                    categoryId: maidCategory?.id || "",
                    userId: provider2Id,
                    businessName: "Sparkle Clean Co",
                    description:
                        "Eco-friendly cleaning services for homes and vacation rentals.",
                    location: "New York, NY",
                    hourlyRate: "50",
                    rating: "4.8",
                    isActive: true,
                    approvalStatus: "approved" as const,
                },
                {
                    id: serviceProvider3Id,
                    categoryId: transportCategory?.id || "",
                    userId: provider1Id,
                    businessName: "Elite Airport Transfer",
                    description:
                        "Luxury car service with professional drivers. Available 24/7.",
                    location: "Miami, FL",
                    hourlyRate: "85",
                    rating: "4.9",
                    isActive: true,
                    approvalStatus: "approved" as const,
                },
                {
                    id: serviceProvider4Id,
                    categoryId: transportCategory?.id || "",
                    userId: provider2Id,
                    businessName: "City Ride Limo",
                    description:
                        "Comfortable and reliable transportation for all occasions.",
                    location: "San Francisco, CA",
                    hourlyRate: "75",
                    rating: "4.7",
                    isActive: true,
                    approvalStatus: "approved" as const,
                },
                {
                    id: serviceProvider5Id,
                    categoryId: diningCategory?.id || "",
                    userId: provider1Id,
                    businessName: "Chef Michael Culinary",
                    description:
                        "Private chef services with customized menus. French and Italian cuisine specialist.",
                    location: "New York, NY",
                    hourlyRate: "150",
                    rating: "5.0",
                    isActive: true,
                    approvalStatus: "approved" as const,
                },
                {
                    id: serviceProvider6Id,
                    categoryId: conciergeCategory?.id || "",
                    userId: provider3Id,
                    businessName: "24/7 Concierge Plus",
                    description:
                        "Full-service concierge for all your needs. Restaurant reservations, event tickets, and more.",
                    location: "Miami, FL",
                    hourlyRate: "60",
                    rating: "4.8",
                    isActive: true,
                    approvalStatus: "approved" as const,
                },
            ];

            console.log("Creating service providers...");
            await db
                .insert(serviceProviders)
                .values(sampleProviders)
                .onConflictDoNothing();

            // Create service tasks for each category
            console.log("Creating service tasks...");
            const sampleServiceTasks = [
                // Housekeeping/Maid tasks
                {
                    id: randomUUID(),
                    categoryId: maidCategory?.id || "",
                    taskCode: "CLEAN_KITCHEN",
                    taskName: "Deep Clean Kitchen",
                    description: "Complete kitchen deep cleaning including appliances, cabinets, and floors",
                    defaultDuration: 90,
                    sortOrder: 1,
                },
                {
                    id: randomUUID(),
                    categoryId: maidCategory?.id || "",
                    taskCode: "CLEAN_BATHROOM",
                    taskName: "Bathroom Cleaning",
                    description: "Full bathroom sanitization including tiles, fixtures, and mirrors",
                    defaultDuration: 60,
                    sortOrder: 2,
                },
                {
                    id: randomUUID(),
                    categoryId: maidCategory?.id || "",
                    taskCode: "CLEAN_LIVING",
                    taskName: "Bedroom & Living Room",
                    description: "Dusting, vacuuming, and organizing living spaces",
                    defaultDuration: 75,
                    sortOrder: 3,
                },
                {
                    id: randomUUID(),
                    categoryId: maidCategory?.id || "",
                    taskCode: "LAUNDRY",
                    taskName: "Laundry Service",
                    description: "Washing, drying, and folding laundry",
                    defaultDuration: 120,
                    sortOrder: 4,
                },
                {
                    id: randomUUID(),
                    categoryId: maidCategory?.id || "",
                    taskCode: "CLEAN_WINDOWS",
                    taskName: "Window Cleaning",
                    description: "Interior and exterior window cleaning",
                    defaultDuration: 60,
                    sortOrder: 5,
                },
            ];

            await db.insert(serviceTasks).values(sampleServiceTasks).onConflictDoNothing();

            // Enable tasks for maid providers with pricing
            console.log("Configuring provider tasks...");
            const maidProvider1Id = sampleProviders.find(p => p.businessName.includes("Premium Cleaning"))?.id;
            const maidProvider2Id = sampleProviders.find(p => p.businessName.includes("Sparkle Clean"))?.id;

            if (maidProvider1Id || maidProvider2Id) {
                const taskConfigs = [];
                
                // Configure tasks for first maid provider
                if (maidProvider1Id) {
                    sampleServiceTasks.forEach((task, index) => {
                        taskConfigs.push({
                            serviceProviderId: maidProvider1Id,
                            taskId: task.id,
                            isEnabled: true,
                            customPrice: (45 + index * 10).toFixed(2), // $45, $55, $65, $75, $85
                            estimatedDuration: task.defaultDuration,
                            notes: "Professional grade cleaning",
                        });
                    });
                }

                // Configure tasks for second maid provider with slightly different prices
                if (maidProvider2Id) {
                    sampleServiceTasks.forEach((task, index) => {
                        taskConfigs.push({
                            serviceProviderId: maidProvider2Id,
                            taskId: task.id,
                            isEnabled: true,
                            customPrice: (40 + index * 10).toFixed(2), // $40, $50, $60, $70, $80
                            estimatedDuration: task.defaultDuration,
                            notes: "Eco-friendly products available",
                        });
                    });
                }

                await db.insert(providerTaskConfigs).values(taskConfigs).onConflictDoNothing();
            }

            // Create menus and menu items for chef provider
            console.log("Creating chef menus...");
            const chefProviderId = sampleProviders.find(p => p.businessName.includes("Chef Michael"))?.id;
            
            if (chefProviderId) {
                const dinnerMenuId = randomUUID();
                const lunchMenuId = randomUUID();

                const menus = [
                    {
                        id: dinnerMenuId,
                        serviceProviderId: chefProviderId,
                        categoryName: "Gourmet Dinner",
                        description: "Fine dining experience with French and Italian cuisine",
                        isActive: true,
                        sortOrder: 1,
                    },
                    {
                        id: lunchMenuId,
                        serviceProviderId: chefProviderId,
                        categoryName: "Executive Lunch",
                        description: "Professional business lunch options",
                        isActive: true,
                        sortOrder: 2,
                    },
                ];

                await db.insert(providerMenus).values(menus).onConflictDoNothing();

                // Add menu items
                console.log("Creating menu items...");
                const menuItemsList = [
                    // Dinner menu items
                    {
                        menuId: dinnerMenuId,
                        dishName: "Filet Mignon with Truffle Sauce",
                        description: "Prime beef tenderloin with black truffle sauce, roasted vegetables",
                        cuisineType: "French",
                        preparationTime: 45,
                        servings: 1,
                        price: "85.00",
                    },
                    {
                        menuId: dinnerMenuId,
                        dishName: "Lobster Risotto",
                        description: "Creamy arborio rice with fresh lobster, saffron, and parmesan",
                        cuisineType: "Italian",
                        preparationTime: 40,
                        servings: 1,
                        price: "75.00",
                    },
                    {
                        menuId: dinnerMenuId,
                        dishName: "Duck Confit",
                        description: "Slow-cooked duck leg with crispy skin, served with potato gratin",
                        cuisineType: "French",
                        preparationTime: 50,
                        servings: 1,
                        price: "68.00",
                    },
                    // Lunch menu items
                    {
                        menuId: lunchMenuId,
                        dishName: "Grilled Salmon Salad",
                        description: "Fresh Atlantic salmon over mixed greens with citrus vinaigrette",
                        cuisineType: "Mediterranean",
                        preparationTime: 25,
                        servings: 1,
                        price: "38.00",
                    },
                    {
                        menuId: lunchMenuId,
                        dishName: "Chicken Caesar Wrap",
                        description: "Grilled chicken, romaine, parmesan in a spinach tortilla",
                        cuisineType: "American",
                        preparationTime: 20,
                        servings: 1,
                        price: "28.00",
                    },
                    {
                        menuId: lunchMenuId,
                        dishName: "Vegetarian Pasta Primavera",
                        description: "Fresh seasonal vegetables tossed with penne in light cream sauce",
                        cuisineType: "Italian",
                        preparationTime: 30,
                        servings: 1,
                        price: "32.00",
                    },
                ];

                await db.insert(menuItems).values(menuItemsList).onConflictDoNothing();
            }

            // Create concierge service packages for "24/7 Concierge Plus"
            console.log("Creating concierge service packages...");
            const conciergeProviderId = sampleProviders.find(p => p.businessName.includes("24/7 Concierge Plus"))?.id;
            
            if (conciergeProviderId) {
                const conciergePackages = [
                    {
                        serviceProviderId: conciergeProviderId,
                        packageName: "Restaurant Reservation Assistance",
                        description: "We'll secure reservations at top restaurants, handle special requests, and arrange transportation",
                        duration: 60,
                        price: "50.00",
                        maxGuests: 8,
                        isActive: true,
                        sortOrder: 1,
                    },
                    {
                        serviceProviderId: conciergeProviderId,
                        packageName: "Event & Entertainment Booking",
                        description: "VIP tickets to concerts, shows, sports events, and exclusive experiences",
                        duration: 90,
                        price: "75.00",
                        maxGuests: 6,
                        isActive: true,
                        sortOrder: 2,
                    },
                    {
                        serviceProviderId: conciergeProviderId,
                        packageName: "Travel Planning & Itinerary",
                        description: "Complete travel itinerary planning including flights, hotels, activities, and dining",
                        duration: 120,
                        price: "150.00",
                        maxGuests: 4,
                        isActive: true,
                        sortOrder: 3,
                    },
                    {
                        serviceProviderId: conciergeProviderId,
                        packageName: "Personal Shopping Service",
                        description: "Personal shopper for gifts, fashion, or special occasion items with delivery coordination",
                        duration: 90,
                        price: "85.00",
                        maxGuests: 2,
                        isActive: true,
                        sortOrder: 4,
                    },
                    {
                        serviceProviderId: conciergeProviderId,
                        packageName: "VIP Experience Package",
                        description: "Full-day premium concierge service including all arrangements, reservations, and on-call assistance",
                        duration: 480,
                        price: "400.00",
                        maxGuests: 4,
                        isActive: true,
                        sortOrder: 5,
                    },
                ];

                await db.insert(servicePackages).values(conciergePackages).onConflictDoNothing();
            }

            // Create transport service packages for transport providers
            console.log("Creating transport service packages...");
            const transportProvider1Id = sampleProviders.find(p => p.businessName.includes("Elite Airport Transfer"))?.id;
            const transportProvider2Id = sampleProviders.find(p => p.businessName.includes("City Ride Limo"))?.id;
            
            const transportPackages = [];
            
            if (transportProvider1Id) {
                transportPackages.push(
                    {
                        serviceProviderId: transportProvider1Id,
                        packageName: "Airport Transfer - Luxury Sedan",
                        description: "One-way airport transfer in luxury sedan with meet & greet service",
                        duration: 60,
                        price: "85.00",
                        maxGuests: 3,
                        isActive: true,
                        sortOrder: 1,
                    },
                    {
                        serviceProviderId: transportProvider1Id,
                        packageName: "Airport Transfer - SUV",
                        description: "One-way airport transfer in luxury SUV, perfect for families or groups",
                        duration: 60,
                        price: "120.00",
                        maxGuests: 6,
                        isActive: true,
                        sortOrder: 2,
                    },
                    {
                        serviceProviderId: transportProvider1Id,
                        packageName: "Hourly Chauffeur Service",
                        description: "Professional chauffeur service with luxury vehicle, minimum 3 hours",
                        duration: 180,
                        price: "250.00",
                        maxGuests: 3,
                        isActive: true,
                        sortOrder: 3,
                    }
                );
            }
            
            if (transportProvider2Id) {
                transportPackages.push(
                    {
                        serviceProviderId: transportProvider2Id,
                        packageName: "City Tour - Half Day",
                        description: "4-hour city sightseeing tour with professional driver and commentary",
                        duration: 240,
                        price: "180.00",
                        maxGuests: 4,
                        isActive: true,
                        sortOrder: 1,
                    },
                    {
                        serviceProviderId: transportProvider2Id,
                        packageName: "Point-to-Point Transfer",
                        description: "Comfortable transfer service within city limits",
                        duration: 45,
                        price: "60.00",
                        maxGuests: 4,
                        isActive: true,
                        sortOrder: 2,
                    },
                    {
                        serviceProviderId: transportProvider2Id,
                        packageName: "Wedding Transportation Package",
                        description: "Premium limousine service for wedding day, includes 6 hours of service",
                        duration: 360,
                        price: "450.00",
                        maxGuests: 6,
                        isActive: true,
                        sortOrder: 3,
                    }
                );
            }
            
            if (transportPackages.length > 0) {
                await db.insert(servicePackages).values(transportPackages).onConflictDoNothing();
            }
        }

        // Create sample bookings
        const today = new Date();
        const pastDate = new Date(today);
        pastDate.setDate(pastDate.getDate() - 15);
        const futureDate = new Date(today);
        futureDate.setDate(futureDate.getDate() + 10);
        const farFutureDate = new Date(futureDate);
        farFutureDate.setDate(farFutureDate.getDate() + 5);

        // Generate UUIDs for bookings
        const booking1Id = randomUUID();
        const booking2Id = randomUUID();
        const booking3Id = randomUUID();

        const sampleBookings = [
            {
                id: booking1Id,
                propertyId: prop1Id,
                clientId: client1Id,
                bookingCode:
                    "BK" +
                    Math.random().toString(36).substring(2, 10).toUpperCase(),
                checkIn: futureDate,
                checkOut: farFutureDate,
                guests: 6,
                propertyTotal: "2250",
                totalAmount: "2250",
                status: "confirmed" as const,
                paymentStatus: "paid" as const,
            },
            {
                id: booking2Id,
                propertyId: prop3Id,
                clientId: client2Id,
                bookingCode:
                    "BK" +
                    Math.random().toString(36).substring(2, 10).toUpperCase(),
                checkIn: new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000),
                checkOut: new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000),
                guests: 4,
                propertyTotal: "1600",
                totalAmount: "1600",
                status: "confirmed" as const,
                paymentStatus: "paid" as const,
            },
            {
                id: booking3Id,
                propertyId: prop5Id,
                clientId: client1Id,
                bookingCode:
                    "BK" +
                    Math.random().toString(36).substring(2, 10).toUpperCase(),
                checkIn: pastDate,
                checkOut: new Date(
                    pastDate.getTime() + 7 * 24 * 60 * 60 * 1000
                ),
                guests: 2,
                propertyTotal: "3640",
                totalAmount: "3640",
                status: "completed" as const,
                paymentStatus: "paid" as const,
            },
        ];

        console.log("Creating bookings...");
        await db.insert(bookings).values(sampleBookings).onConflictDoNothing();

        // Create sample reviews
        const sampleReviews = [
            {
                bookingId: booking3Id,
                reviewerId: client1Id,
                propertyId: prop5Id,
                rating: 5,
                comment:
                    "Absolutely amazing! The bungalow exceeded all expectations. Beautiful location and pristine condition.",
            },
            {
                reviewerId: client2Id,
                propertyId: prop3Id,
                rating: 5,
                comment:
                    "Perfect mountain getaway. Very peaceful and well-maintained.",
            },
            {
                reviewerId: client1Id,
                propertyId: prop1Id,
                rating: 5,
                comment:
                    "Dream vacation home! The beach access was incredible.",
            },
        ];

        console.log("Creating reviews...");
        await db.insert(reviews).values(sampleReviews).onConflictDoNothing();

        // Create promotional codes for marketing dashboard testing
        const promoCode1Id = randomUUID();
        const promoCode2Id = randomUUID();
        const promoCode3Id = randomUUID();

        const samplePromoCodes = [
            {
                id: promoCode1Id,
                code: "SUMMER2024",
                discountType: "percentage" as const,
                discountValue: "20",
                maxUses: 100,
                usedCount: 15,
                validFrom: new Date(),
                validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                isActive: true,
            },
            {
                id: promoCode2Id,
                code: "WELCOME50",
                discountType: "fixed_amount" as const,
                discountValue: "50",
                maxUses: 500,
                usedCount: 87,
                validFrom: new Date(),
                validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
                isActive: true,
            },
            {
                id: promoCode3Id,
                code: "WEEKEND15",
                discountType: "percentage" as const,
                discountValue: "15",
                maxUses: 200,
                usedCount: 42,
                validFrom: new Date(),
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                isActive: true,
            },
        ];

        console.log("Creating promotional codes...");
        await db.insert(promotionalCodes).values(samplePromoCodes).onConflictDoNothing();

        // Create sample messages for testing role-based messaging
        const sampleMessages = [
            {
                senderId: client1Id,
                receiverId: owner1Id,
                content: "Hi! I'm interested in booking your Luxury Beachfront Villa. Is it available for next month?",
                isRead: true,
            },
            {
                senderId: owner1Id,
                receiverId: client1Id,
                content: "Hello Sarah! Yes, the villa is available. I'd be happy to help with your booking.",
                isRead: true,
            },
            {
                senderId: billingId,
                receiverId: client2Id,
                content: "Hello Michael, I noticed your recent payment was processed successfully. Thank you!",
                isRead: false,
            },
            {
                senderId: operationId,
                receiverId: provider1Id,
                content: "Carlos, please update your service availability for the upcoming month.",
                isRead: true,
            },
            {
                senderId: provider1Id,
                receiverId: operationId,
                content: "Sure, I'll update it today. Thanks for the reminder!",
                isRead: false,
            },
            {
                senderId: marketingId,
                receiverId: owner2Id,
                content: "Emily, we'd love to feature your Mountain Cabin in our summer campaign. Are you interested?",
                isRead: false,
            },
            {
                senderId: cityManagerId,
                receiverId: client3Id,
                content: "Welcome to TravelHub! If you need any assistance finding properties in your area, let me know.",
                isRead: false,
            },
            {
                senderId: countryManagerId,
                receiverId: provider2Id,
                content: "Lisa, we have a new job assignment for you in the Miami area. Please check your dashboard.",
                isRead: true,
            },
        ];

        console.log("Creating sample messages...");
        await db.insert(messages).values(sampleMessages).onConflictDoNothing();

        // Create sample payments for billing dashboard testing
        const payment1Id = randomUUID();
        const payment2Id = randomUUID();
        const payment3Id = randomUUID();

        const samplePayments = [
            {
                id: payment1Id,
                bookingId: booking1Id,
                userId: client1Id,
                amount: "2250",
                paymentMethod: "card" as const,
                status: "succeeded" as const,
                stripePaymentIntentId: "pi_test_" + randomUUID(),
            },
            {
                id: payment2Id,
                bookingId: booking2Id,
                userId: client2Id,
                amount: "1600",
                paymentMethod: "card" as const,
                status: "succeeded" as const,
                stripePaymentIntentId: "pi_test_" + randomUUID(),
            },
            {
                id: payment3Id,
                bookingId: booking3Id,
                userId: client1Id,
                amount: "3640",
                paymentMethod: "card" as const,
                status: "succeeded" as const,
                stripePaymentIntentId: "pi_test_" + randomUUID(),
            },
        ];

        console.log("Creating sample payments...");
        await db.insert(payments).values(samplePayments).onConflictDoNothing();

        // Create notifications for users
        const sampleNotifications = [
            {
                userId: client1Id,
                type: "booking" as const,
                title: "Booking Confirmed",
                message: "Your booking for Luxury Beachfront Villa has been confirmed!",
                isRead: true,
            },
            {
                userId: client2Id,
                type: "payment" as const,
                title: "Payment Successful",
                message: "Your payment of $1,600 has been processed successfully.",
                isRead: false,
            },
            {
                userId: owner1Id,
                type: "booking" as const,
                title: "New Booking",
                message: "You have a new booking for your Luxury Beachfront Villa.",
                isRead: false,
            },
            {
                userId: provider1Id,
                type: "message" as const,
                title: "New Message",
                message: "Ops Manager sent you a message",
                isRead: true,
            },
        ];

        console.log("Creating notifications...");
        await db.insert(notifications).values(sampleNotifications).onConflictDoNothing();

        // Create comprehensive service orders for all dashboards
        console.log("Creating service orders with realistic data...");
        
        // Get providers for service orders
        const allProviders = await db.select().from(serviceProviders);
        const maidProvider = allProviders.find(p => p.businessName.includes("Clean"));
        const chefProvider = allProviders.find(p => p.businessName.includes("Chef"));
        const transportProvider = allProviders.find(p => p.businessName.includes("Transfer") || p.businessName.includes("Ride"));
        
        if (!maidProvider || !chefProvider || !transportProvider) {
            console.log("⚠️  Service providers not found for orders");
        } else {
            // Date helpers
            const now = new Date();
            const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
            const lastWeek = new Date(now); lastWeek.setDate(lastWeek.getDate() - 7);
            const lastMonth = new Date(now); lastMonth.setMonth(lastMonth.getMonth() - 1);
            const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
            const nextWeek = new Date(now); nextWeek.setDate(nextWeek.getDate() + 7);
            const nextMonth = new Date(now); nextMonth.setMonth(nextMonth.getMonth() + 1);
            
            const sampleServiceOrders = [
                // COMPLETED orders (with provider notes and payments)
                {
                    id: randomUUID(),
                    clientId: client1Id,
                    serviceProviderId: maidProvider.id,
                    orderCode: "SO" + Math.random().toString(36).substring(2, 10).toUpperCase(),
                    serviceDate: lastWeek.toISOString().split('T')[0],
                    startTime: "09:00",
                    endTime: "12:00",
                    duration: 3,
                    status: "completed" as const,
                    subtotal: "135.00",
                    taxAmount: "13.50",
                    totalAmount: "148.50",
                    platformFeePercentage: "15.00",
                    platformFeeAmount: "22.28",
                    providerAmount: "126.22",
                    paymentStatus: "paid" as const,
                    paymentIntentId: "pi_" + Math.random().toString(36).substring(2),
                    providerNotes: "All cleaning tasks completed successfully. Client was very satisfied with the deep cleaning. Kitchen and bathrooms sparkle!",
                    serviceLocation: "New York",
                    serviceCountry: "USA",
                    acceptedAt: new Date(lastWeek.getTime() - 2*24*60*60*1000),
                    completedAt: lastWeek,
                },
                {
                    id: randomUUID(),
                    clientId: client2Id,
                    serviceProviderId: chefProvider.id,
                    orderCode: "SO" + Math.random().toString(36).substring(2, 10).toUpperCase(),
                    serviceDate: lastMonth.toISOString().split('T')[0],
                    startTime: "18:00",
                    endTime: "21:00",
                    duration: 3,
                    status: "completed" as const,
                    subtotal: "450.00",
                    taxAmount: "45.00",
                    totalAmount: "495.00",
                    platformFeePercentage: "15.00",
                    platformFeeAmount: "74.25",
                    providerAmount: "420.75",
                    paymentStatus: "paid" as const,
                    paymentIntentId: "pi_" + Math.random().toString(36).substring(2),
                    providerNotes: "Prepared a 5-course French dinner for 6 guests. Menu included foie gras appetizer, lobster bisque, duck confit, cheese course, and crème brûlée. Guests loved everything!",
                    serviceLocation: "New York",
                    serviceCountry: "USA",
                    acceptedAt: new Date(lastMonth.getTime() - 3*24*60*60*1000),
                    completedAt: lastMonth,
                },
                {
                    id: randomUUID(),
                    clientId: client3Id,
                    serviceProviderId: transportProvider.id,
                    orderCode: "SO" + Math.random().toString(36).substring(2, 10).toUpperCase(),
                    serviceDate: lastWeek.toISOString().split('T')[0],
                    startTime: "14:00",
                    endTime: "16:00",
                    duration: 2,
                    status: "completed" as const,
                    subtotal: "170.00",
                    taxAmount: "17.00",
                    totalAmount: "187.00",
                    platformFeePercentage: "15.00",
                    platformFeeAmount: "28.05",
                    providerAmount: "158.95",
                    paymentStatus: "paid" as const,
                    paymentIntentId: "pi_" + Math.random().toString(36).substring(2),
                    providerNotes: "Airport pickup completed on time. Client flight arrived early but we were ready. Smooth ride to hotel in Miami Beach.",
                    serviceLocation: "Miami",
                    serviceCountry: "USA",
                    acceptedAt: new Date(lastWeek.getTime() - 1*24*60*60*1000),
                    completedAt: lastWeek,
                },
                
                // IN PROGRESS orders (currently being serviced)
                {
                    id: randomUUID(),
                    clientId: client1Id,
                    serviceProviderId: maidProvider.id,
                    orderCode: "SO" + Math.random().toString(36).substring(2, 10).toUpperCase(),
                    serviceDate: now.toISOString().split('T')[0],
                    startTime: "10:00",
                    endTime: "13:00",
                    duration: 3,
                    status: "in_progress" as const,
                    subtotal: "135.00",
                    taxAmount: "13.50",
                    totalAmount: "148.50",
                    platformFeePercentage: "15.00",
                    platformFeeAmount: "22.28",
                    providerAmount: "126.22",
                    paymentStatus: "paid" as const,
                    paymentIntentId: "pi_" + Math.random().toString(36).substring(2),
                    specialInstructions: "Please focus on kitchen and living room. Bathroom doesn't need deep cleaning.",
                    serviceLocation: "New York",
                    serviceCountry: "USA",
                    acceptedAt: yesterday,
                },
                {
                    id: randomUUID(),
                    clientId: client2Id,
                    serviceProviderId: chefProvider.id,
                    orderCode: "SO" + Math.random().toString(36).substring(2, 10).toUpperCase(),
                    serviceDate: now.toISOString().split('T')[0],
                    startTime: "17:00",
                    endTime: "20:00",
                    duration: 3,
                    status: "in_progress" as const,
                    subtotal: "450.00",
                    taxAmount: "45.00",
                    totalAmount: "495.00",
                    platformFeePercentage: "15.00",
                    platformFeeAmount: "74.25",
                    providerAmount: "420.75",
                    paymentStatus: "paid" as const,
                    paymentIntentId: "pi_" + Math.random().toString(36).substring(2),
                    specialInstructions: "Guest has shellfish allergy. Please avoid all seafood.",
                    serviceLocation: "New York",
                    serviceCountry: "USA",
                    acceptedAt: new Date(now.getTime() - 2*24*60*60*1000),
                },
                
                // ACCEPTED orders (confirmed but not started yet)
                {
                    id: randomUUID(),
                    clientId: client3Id,
                    serviceProviderId: transportProvider.id,
                    orderCode: "SO" + Math.random().toString(36).substring(2, 10).toUpperCase(),
                    serviceDate: tomorrow.toISOString().split('T')[0],
                    startTime: "08:00",
                    endTime: "09:00",
                    duration: 1,
                    status: "accepted" as const,
                    subtotal: "85.00",
                    taxAmount: "8.50",
                    totalAmount: "93.50",
                    platformFeePercentage: "15.00",
                    platformFeeAmount: "14.03",
                    providerAmount: "79.47",
                    paymentStatus: "paid" as const,
                    paymentIntentId: "pi_" + Math.random().toString(36).substring(2),
                    specialInstructions: "Pick up from Hilton Downtown Miami at 8 AM sharp. Flight at 10:30 AM.",
                    serviceLocation: "Miami",
                    serviceCountry: "USA",
                    acceptedAt: yesterday,
                },
                {
                    id: randomUUID(),
                    clientId: client1Id,
                    serviceProviderId: maidProvider.id,
                    orderCode: "SO" + Math.random().toString(36).substring(2, 10).toUpperCase(),
                    serviceDate: nextWeek.toISOString().split('T')[0],
                    startTime: "14:00",
                    endTime: "17:00",
                    duration: 3,
                    status: "accepted" as const,
                    subtotal: "135.00",
                    taxAmount: "13.50",
                    totalAmount: "148.50",
                    platformFeePercentage: "15.00",
                    platformFeeAmount: "22.28",
                    providerAmount: "126.22",
                    paymentStatus: "paid" as const,
                    paymentIntentId: "pi_" + Math.random().toString(36).substring(2),
                    specialInstructions: "Post-party cleanup. There will be confetti and decorations to remove.",
                    serviceLocation: "New York",
                    serviceCountry: "USA",
                    acceptedAt: now,
                },
                
                // PENDING ACCEPTANCE orders (waiting for provider to accept)
                {
                    id: randomUUID(),
                    clientId: client2Id,
                    serviceProviderId: chefProvider.id,
                    orderCode: "SO" + Math.random().toString(36).substring(2, 10).toUpperCase(),
                    serviceDate: nextWeek.toISOString().split('T')[0],
                    startTime: "19:00",
                    endTime: "22:00",
                    duration: 3,
                    status: "pending_acceptance" as const,
                    subtotal: "450.00",
                    taxAmount: "45.00",
                    totalAmount: "495.00",
                    platformFeePercentage: "15.00",
                    platformFeeAmount: "74.25",
                    providerAmount: "420.75",
                    paymentStatus: "paid" as const,
                    paymentIntentId: "pi_" + Math.random().toString(36).substring(2),
                    specialInstructions: "Anniversary dinner for 2. Romantic Italian menu preferred. Tiramisu for dessert a must!",
                    serviceLocation: "New York",
                    serviceCountry: "USA",
                },
                {
                    id: randomUUID(),
                    clientId: client3Id,
                    serviceProviderId: maidProvider.id,
                    orderCode: "SO" + Math.random().toString(36).substring(2, 10).toUpperCase(),
                    serviceDate: nextWeek.toISOString().split('T')[0],
                    startTime: "11:00",
                    endTime: "14:00",
                    duration: 3,
                    status: "pending_acceptance" as const,
                    subtotal: "135.00",
                    taxAmount: "13.50",
                    totalAmount: "148.50",
                    platformFeePercentage: "15.00",
                    platformFeeAmount: "22.28",
                    providerAmount: "126.22",
                    paymentStatus: "paid" as const,
                    paymentIntentId: "pi_" + Math.random().toString(36).substring(2),
                    specialInstructions: "Move-out cleaning. Apartment needs to be spotless for inspection.",
                    serviceLocation: "New York",
                    serviceCountry: "USA",
                },
                
                // CONFIRMED orders (payment received, waiting for service date)
                {
                    id: randomUUID(),
                    clientId: client1Id,
                    serviceProviderId: chefProvider.id,
                    orderCode: "SO" + Math.random().toString(36).substring(2, 10).toUpperCase(),
                    serviceDate: nextMonth.toISOString().split('T')[0],
                    startTime: "19:00",
                    endTime: "22:00",
                    duration: 3,
                    status: "confirmed" as const,
                    subtotal: "450.00",
                    taxAmount: "45.00",
                    totalAmount: "495.00",
                    platformFeePercentage: "15.00",
                    platformFeeAmount: "74.25",
                    providerAmount: "420.75",
                    paymentStatus: "paid" as const,
                    paymentIntentId: "pi_" + Math.random().toString(36).substring(2),
                    specialInstructions: "Corporate dinner for 8 executives. Professional presentation required.",
                    serviceLocation: "New York",
                    serviceCountry: "USA",
                    acceptedAt: now,
                },
                
                // PENDING PAYMENT orders (not yet paid)
                {
                    id: randomUUID(),
                    clientId: client2Id,
                    serviceProviderId: maidProvider.id,
                    orderCode: "SO" + Math.random().toString(36).substring(2, 10).toUpperCase(),
                    serviceDate: nextWeek.toISOString().split('T')[0],
                    startTime: "09:00",
                    endTime: "12:00",
                    duration: 3,
                    status: "pending_payment" as const,
                    subtotal: "135.00",
                    taxAmount: "13.50",
                    totalAmount: "148.50",
                    platformFeePercentage: "15.00",
                    platformFeeAmount: "22.28",
                    providerAmount: "126.22",
                    paymentStatus: "pending" as const,
                    specialInstructions: "Regular weekly cleaning service.",
                    serviceLocation: "New York",
                    serviceCountry: "USA",
                },
                
                // CANCELLED orders (with reasons)
                {
                    id: randomUUID(),
                    clientId: client3Id,
                    serviceProviderId: chefProvider.id,
                    orderCode: "SO" + Math.random().toString(36).substring(2, 10).toUpperCase(),
                    serviceDate: yesterday.toISOString().split('T')[0],
                    startTime: "18:00",
                    endTime: "21:00",
                    duration: 3,
                    status: "cancelled" as const,
                    subtotal: "450.00",
                    taxAmount: "45.00",
                    totalAmount: "495.00",
                    platformFeePercentage: "15.00",
                    platformFeeAmount: "74.25",
                    providerAmount: "420.75",
                    paymentStatus: "refunded" as const,
                    paymentIntentId: "pi_" + Math.random().toString(36).substring(2),
                    stripeRefundId: "re_" + Math.random().toString(36).substring(2),
                    cancellationReason: "Client had to cancel dinner party due to family emergency. Refund issued.",
                    serviceLocation: "New York",
                    serviceCountry: "USA",
                    cancelledAt: new Date(yesterday.getTime() - 1*24*60*60*1000),
                },
                {
                    id: randomUUID(),
                    clientId: client1Id,
                    serviceProviderId: transportProvider.id,
                    orderCode: "SO" + Math.random().toString(36).substring(2, 10).toUpperCase(),
                    serviceDate: lastWeek.toISOString().split('T')[0],
                    startTime: "06:00",
                    endTime: "07:00",
                    duration: 1,
                    status: "cancelled" as const,
                    subtotal: "85.00",
                    taxAmount: "8.50",
                    totalAmount: "93.50",
                    platformFeePercentage: "15.00",
                    platformFeeAmount: "14.03",
                    providerAmount: "79.47",
                    paymentStatus: "refunded" as const,
                    paymentIntentId: "pi_" + Math.random().toString(36).substring(2),
                    stripeRefundId: "re_" + Math.random().toString(36).substring(2),
                    cancellationReason: "Flight was cancelled by airline. No longer need airport transfer.",
                    serviceLocation: "Miami",
                    serviceCountry: "USA",
                    cancelledAt: new Date(lastWeek.getTime() - 2*24*60*60*1000),
                },
                
                // REJECTED orders (provider couldn't accept)
                {
                    id: randomUUID(),
                    clientId: client2Id,
                    serviceProviderId: maidProvider.id,
                    orderCode: "SO" + Math.random().toString(36).substring(2, 10).toUpperCase(),
                    serviceDate: tomorrow.toISOString().split('T')[0],
                    startTime: "07:00",
                    endTime: "10:00",
                    duration: 3,
                    status: "rejected" as const,
                    subtotal: "135.00",
                    taxAmount: "13.50",
                    totalAmount: "148.50",
                    platformFeePercentage: "15.00",
                    platformFeeAmount: "22.28",
                    providerAmount: "126.22",
                    paymentStatus: "refunded" as const,
                    paymentIntentId: "pi_" + Math.random().toString(36).substring(2),
                    stripeRefundId: "re_" + Math.random().toString(36).substring(2),
                    rejectionReason: "Already booked for that time slot. Unable to accommodate.",
                    serviceLocation: "New York",
                    serviceCountry: "USA",
                },
            ];
            
            await db.insert(serviceOrders).values(sampleServiceOrders).onConflictDoNothing();
            console.log(`✓ Created ${sampleServiceOrders.length} service orders with diverse statuses and locations`);
        }

        console.log("✅ Database seeding completed successfully!");
        console.log("\n🔐 Sample Credentials:");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("ADMIN ROLES:");
        console.log("  Admin:           admin@test.com / password123");
        console.log("  Billing:         billing@test.com / password123");
        console.log("  Operation:       operation@test.com / password123");
        console.log("  Marketing:       marketing@test.com / password123");
        console.log("\nMANAGERS:");
        console.log("  Country Manager: country_manager@test.com / password123");
        console.log("  City Manager:    city_manager@test.com / password123");
        console.log("\nUSERS:");
        console.log("  Clients:         client1@test.com / password123");
        console.log("                   client2@test.com / password123");
        console.log("                   client3@test.com / password123");
        console.log("  Property Owners: host1@test.com / password123");
        console.log("                   host2@test.com / password123");
        console.log("                   host3@test.com / password123");
        console.log("  Providers:       provider1@test.com / password123");
        console.log("                   provider2@test.com / password123");
        console.log("                   provider3@test.com / password123");
        console.log("\nSUPPORT:");
        console.log("  Operation Support: operation_support@test.com / password123");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("\n📊 Data Created:");
        console.log("  ✓ 16 users with different roles");
        console.log("  ✓ 15 properties across international locations");
        console.log("  ✓ 10 service categories");
        console.log("  ✓ Multiple bookings and reviews");
        console.log("  ✓ 3 promotional codes");
        console.log("  ✓ Messages between users");
        console.log("  ✓ Payment records");
        console.log("  ✓ Notifications");
        console.log("\n💬 Role-Based Messaging:");
        console.log("  - Login with any account and go to /messages");
        console.log("  - Click 'New Message' to see role-based recipient options");
        console.log("  - Admin can message ALL 10 roles");
        console.log("\n📱 Test Dashboards:");
        console.log("  - Admin:          /admin");
        console.log("  - Billing:        /billing-dashboard");
        console.log("  - Operation:      /operation-dashboard");
        console.log("  - Marketing:      /marketing-dashboard");
        console.log("  - City Manager:   /city-manager-dashboard");
        console.log("  - Country Manager: /country-manager-dashboard");
        console.log("  - Support:        /support-dashboard");
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        throw error;
    }
}

// Run the seed function
seed()
    .then(() => {
        console.log("\n🎉 Seeding complete!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Failed to seed database:", error);
        process.exit(1);
    });
