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
