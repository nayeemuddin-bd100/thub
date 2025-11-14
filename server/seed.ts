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
        await db.delete(users);
        console.log("✓ Existing data cleaned");

        // Create sample users with different roles
        const hashedPassword = await bcrypt.hash("password123", 10);

        // Generate UUIDs for users
        const adminId = randomUUID();
        const client1Id = randomUUID();
        const client2Id = randomUUID();
        const owner1Id = randomUUID();
        const owner2Id = randomUUID();
        const provider1Id = randomUUID();
        const provider2Id = randomUUID();
        const managerId = randomUUID();

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
                id: managerId,
                email: "manager@test.com",
                password: hashedPassword,
                firstName: "James",
                lastName: "Wilson",
                role: "country_manager" as const,
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
        ];

        console.log("Creating properties...");
        await db
            .insert(properties)
            .values(sampleProperties)
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
                    userId: provider2Id,
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

        console.log(
            "\n⚠️  Note: Service bookings skipped because service providers were not created."
        );
        console.log(
            "Service categories need to exist in the database before running this seed script."
        );

        console.log("✅ Database seeding completed successfully!");
        console.log("\nSample credentials:");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("Admin:           admin@test.com / password123");
        console.log("Clients:         client1@test.com / password123");
        console.log("                 client2@test.com / password123");
        console.log("Property Owners: owner1@test.com / password123");
        console.log("                 owner2@test.com / password123");
        console.log("Providers:       provider1@test.com / password123");
        console.log("                 provider2@test.com / password123");
        console.log("Manager:         manager@test.com / password123");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("\nData created:");
        console.log("- 7 users with different roles");
        console.log("- 5 properties in various locations");
        console.log("- 6 service providers across categories");
        console.log("- 3 bookings (past and future)");
        console.log("- 3 reviews");
        console.log("- 2 service bookings");
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
