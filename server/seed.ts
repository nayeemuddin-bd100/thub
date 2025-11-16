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
    blogPosts,
    sessions,
    roleChangeRequests,
    cmsContent,
    providerServiceCategories,
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
        await db.delete(menuItems);
        await db.delete(providerMenus);
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
        await db.delete(providerServiceCategories);
        await db.delete(serviceProviders);
        await db.delete(properties);
        await db.delete(serviceCategories);
        await db.delete(promotionalCodes);
        await db.delete(territories);
        await db.delete(platformSettings);
        await db.delete(blogPosts);
        await db.delete(cmsContent);
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

        // Create seasonal pricing for properties
        console.log("Creating seasonal pricing rules...");
        const seasonalPricingRules = [
            // Miami Beach Villa - Winter Peak Season (Dec - Mar)
            {
                id: randomUUID(),
                propertyId: prop1Id,
                name: "Winter Peak Season",
                startDate: "2025-12-15",
                endDate: "2026-03-15",
                pricePerNight: "650",
                minimumStay: 3,
                priority: 1,
                isActive: true,
            },
            // Miami Beach Villa - Summer (High demand)
            {
                id: randomUUID(),
                propertyId: prop1Id,
                name: "Summer Season",
                startDate: "2025-06-01",
                endDate: "2025-08-31",
                pricePerNight: "550",
                minimumStay: 2,
                priority: 2,
                isActive: true,
            },
            // NYC Apartment - Holiday Season
            {
                id: randomUUID(),
                propertyId: prop2Id,
                name: "Holiday Season",
                startDate: "2025-11-25",
                endDate: "2026-01-05",
                pricePerNight: "420",
                minimumStay: 3,
                priority: 1,
                isActive: true,
            },
            // NYC Apartment - Spring Events
            {
                id: randomUUID(),
                propertyId: prop2Id,
                name: "Spring Events Season",
                startDate: "2025-04-01",
                endDate: "2025-05-31",
                pricePerNight: "350",
                minimumStay: 2,
                priority: 2,
                isActive: true,
            },
            // Mountain Cabin - Winter Ski Season
            {
                id: randomUUID(),
                propertyId: prop3Id,
                name: "Ski Season Peak",
                startDate: "2025-12-20",
                endDate: "2026-02-28",
                pricePerNight: "480",
                minimumStay: 5,
                priority: 1,
                isActive: true,
            },
            // Paris Apartment - Summer Tourist Season
            {
                id: randomUUID(),
                propertyId: prop4Id,
                name: "Summer Tourist Season",
                startDate: "2025-06-15",
                endDate: "2025-09-15",
                pricePerNight: "280",
                minimumStay: 3,
                priority: 1,
                isActive: true,
            },
            // Paris Apartment - Fashion Week
            {
                id: randomUUID(),
                propertyId: prop4Id,
                name: "Fashion Week",
                startDate: "2025-09-25",
                endDate: "2025-10-05",
                pricePerNight: "350",
                minimumStay: 2,
                priority: 2,
                isActive: true,
            },
            // Tokyo Condo - Cherry Blossom Season
            {
                id: randomUUID(),
                propertyId: prop5Id,
                name: "Cherry Blossom Season",
                startDate: "2025-03-20",
                endDate: "2025-04-15",
                pricePerNight: "420",
                minimumStay: 4,
                priority: 1,
                isActive: true,
            },
            // Tokyo Condo - Golden Week
            {
                id: randomUUID(),
                propertyId: prop5Id,
                name: "Golden Week",
                startDate: "2025-04-29",
                endDate: "2025-05-06",
                pricePerNight: "450",
                minimumStay: 3,
                priority: 1,
                isActive: true,
            },
            // London Flat - Summer Season
            {
                id: randomUUID(),
                propertyId: prop6Id,
                name: "London Summer",
                startDate: "2025-06-01",
                endDate: "2025-08-31",
                pricePerNight: "320",
                minimumStay: 3,
                priority: 1,
                isActive: true,
            },
            // Barcelona Loft - La Mercè Festival
            {
                id: randomUUID(),
                propertyId: prop7Id,
                name: "La Mercè Festival",
                startDate: "2025-09-20",
                endDate: "2025-09-26",
                pricePerNight: "260",
                minimumStay: 2,
                priority: 1,
                isActive: true,
            },
            // Dubai Penthouse - Winter Season
            {
                id: randomUUID(),
                propertyId: prop8Id,
                name: "Winter Luxury Season",
                startDate: "2025-11-01",
                endDate: "2026-03-31",
                pricePerNight: "1400",
                minimumStay: 3,
                priority: 1,
                isActive: true,
            },
            // Sydney Harbor View - New Year
            {
                id: randomUUID(),
                propertyId: prop9Id,
                name: "New Year's Eve Premium",
                startDate: "2025-12-28",
                endDate: "2026-01-03",
                pricePerNight: "950",
                minimumStay: 3,
                priority: 1,
                isActive: true,
            },
            // Rome Historic Apartment - Easter Season
            {
                id: randomUUID(),
                propertyId: prop10Id,
                name: "Easter Season",
                startDate: "2025-04-10",
                endDate: "2025-04-25",
                pricePerNight: "280",
                minimumStay: 2,
                priority: 1,
                isActive: true,
            },
            // Santorini Villa - Peak Summer
            {
                id: randomUUID(),
                propertyId: prop11Id,
                name: "Peak Summer Season",
                startDate: "2025-07-01",
                endDate: "2025-08-31",
                pricePerNight: "1200",
                minimumStay: 5,
                priority: 1,
                isActive: true,
            },
            // Bali Beachfront - Off-Peak Discount
            {
                id: randomUUID(),
                propertyId: prop12Id,
                name: "Monsoon Off-Peak",
                startDate: "2025-11-01",
                endDate: "2026-02-28",
                pricePerNight: "350",
                minimumStay: 4,
                priority: 1,
                isActive: true,
            },
            // Cape Town Mansion - Summer Season
            {
                id: randomUUID(),
                propertyId: prop13Id,
                name: "Southern Summer",
                startDate: "2025-12-01",
                endDate: "2026-02-28",
                pricePerNight: "750",
                minimumStay: 5,
                priority: 1,
                isActive: true,
            },
            // Iceland Glass Igloo - Northern Lights
            {
                id: randomUUID(),
                propertyId: prop14Id,
                name: "Northern Lights Season",
                startDate: "2025-09-15",
                endDate: "2026-03-31",
                pricePerNight: "680",
                minimumStay: 2,
                priority: 1,
                isActive: true,
            },
            // Phuket Resort Villa - High Season
            {
                id: randomUUID(),
                propertyId: prop15Id,
                name: "High Season",
                startDate: "2025-11-01",
                endDate: "2026-04-30",
                pricePerNight: "900",
                minimumStay: 4,
                priority: 1,
                isActive: true,
            },
        ];

        await db
            .insert(propertySeasonalPricing)
            .values(seasonalPricingRules)
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

            // Create many-to-many provider-service category associations
            console.log("Creating provider-service category associations...");
            const providerCategories = [
                // Provider 1 offers multiple services: Maid, Transport, and Dining
                { serviceProviderId: serviceProvider1Id, categoryId: maidCategory?.id || "", isPrimary: true },
                { serviceProviderId: serviceProvider1Id, categoryId: transportCategory?.id || "", isPrimary: false },
                { serviceProviderId: serviceProvider5Id, categoryId: diningCategory?.id || "", isPrimary: true },
                
                // Provider 2 offers Maid Service and Transport
                { serviceProviderId: serviceProvider2Id, categoryId: maidCategory?.id || "", isPrimary: true },
                { serviceProviderId: serviceProvider4Id, categoryId: transportCategory?.id || "", isPrimary: true },
                
                // Provider 3 offers Concierge and Transport
                { serviceProviderId: serviceProvider6Id, categoryId: conciergeCategory?.id || "", isPrimary: true },
                { serviceProviderId: serviceProvider3Id, categoryId: transportCategory?.id || "", isPrimary: true },
            ];
            
            await db.insert(providerServiceCategories).values(providerCategories).onConflictDoNothing();

            // Create territories (regions/countries/cities)
            console.log("Creating territories...");
            const territory1Id = randomUUID();
            const territory2Id = randomUUID();
            const territory3Id = randomUUID();
            const territory4Id = randomUUID();
            const territory5Id = randomUUID();
            
            const sampleTerritories = [
                {
                    id: territory1Id,
                    name: "North America - USA East",
                    country: "United States",
                    regions: ["New York", "Miami", "Boston", "Washington DC", "Philadelphia"],
                    managerId: countryManagerId,
                    isActive: true,
                },
                {
                    id: territory2Id,
                    name: "North America - USA West",
                    country: "United States",
                    regions: ["Los Angeles", "San Francisco", "Seattle", "San Diego", "Las Vegas"],
                    managerId: countryManagerId,
                    isActive: true,
                },
                {
                    id: territory3Id,
                    name: "Europe - Western",
                    country: "Multi-Country",
                    regions: ["Paris, France", "London, UK", "Amsterdam, Netherlands", "Madrid, Spain", "Rome, Italy"],
                    managerId: cityManagerId,
                    isActive: true,
                },
                {
                    id: territory4Id,
                    name: "Asia Pacific - East",
                    country: "Multi-Country",
                    regions: ["Tokyo, Japan", "Seoul, South Korea", "Beijing, China", "Shanghai, China", "Hong Kong"],
                    managerId: null,
                    isActive: true,
                },
                {
                    id: territory5Id,
                    name: "Asia Pacific - Southeast",
                    country: "Multi-Country",
                    regions: ["Bangkok, Thailand", "Singapore", "Phuket, Thailand", "Bali, Indonesia", "Manila, Philippines"],
                    managerId: null,
                    isActive: true,
                },
            ];
            
            await db.insert(territories).values(sampleTerritories).onConflictDoNothing();
            console.log(`✓ Created ${sampleTerritories.length} territories`);

            // Create property-service associations (recommended services for properties)
            console.log("Creating property-service associations...");
            const propertyServiceAssociations = [
                // Luxury Beachfront Villa (Miami) - Premium services
                { propertyId: prop1Id, serviceProviderId: serviceProvider1Id, isRecommended: true }, // Premium Cleaning
                { propertyId: prop1Id, serviceProviderId: serviceProvider4Id, isRecommended: true }, // Luxury Transport
                { propertyId: prop1Id, serviceProviderId: serviceProvider5Id, isRecommended: false }, // Gourmet Dining
                
                // Modern Downtown Apartment (NYC) - Urban services
                { propertyId: prop2Id, serviceProviderId: serviceProvider2Id, isRecommended: true }, // Sparkle Clean
                { propertyId: prop2Id, serviceProviderId: serviceProvider3Id, isRecommended: true }, // City Transport
                { propertyId: prop2Id, serviceProviderId: serviceProvider6Id, isRecommended: false }, // Elite Concierge
                
                // Mountain Cabin Retreat - Nature focused
                { propertyId: prop3Id, serviceProviderId: serviceProvider1Id, isRecommended: true }, // Premium Cleaning
                { propertyId: prop3Id, serviceProviderId: serviceProvider3Id, isRecommended: false }, // City Transport
                
                // Urban Loft Studio - Compact urban
                { propertyId: prop4Id, serviceProviderId: serviceProvider2Id, isRecommended: true }, // Sparkle Clean
                { propertyId: prop4Id, serviceProviderId: serviceProvider4Id, isRecommended: false }, // Luxury Transport
                
                // Coastal Cottage - Seaside services
                { propertyId: prop5Id, serviceProviderId: serviceProvider1Id, isRecommended: true }, // Premium Cleaning
                { propertyId: prop5Id, serviceProviderId: serviceProvider5Id, isRecommended: true }, // Gourmet Dining
                { propertyId: prop5Id, serviceProviderId: serviceProvider3Id, isRecommended: false }, // City Transport
                
                // Historic Townhouse - Heritage focused
                { propertyId: prop6Id, serviceProviderId: serviceProvider2Id, isRecommended: true }, // Sparkle Clean
                { propertyId: prop6Id, serviceProviderId: serviceProvider6Id, isRecommended: true }, // Elite Concierge
                
                // Penthouse Suite - Ultra luxury
                { propertyId: prop7Id, serviceProviderId: serviceProvider1Id, isRecommended: true }, // Premium Cleaning
                { propertyId: prop7Id, serviceProviderId: serviceProvider4Id, isRecommended: true }, // Luxury Transport
                { propertyId: prop7Id, serviceProviderId: serviceProvider5Id, isRecommended: true }, // Gourmet Dining
                { propertyId: prop7Id, serviceProviderId: serviceProvider6Id, isRecommended: true }, // Elite Concierge
                
                // Garden Bungalow - Family friendly
                { propertyId: prop8Id, serviceProviderId: serviceProvider2Id, isRecommended: true }, // Sparkle Clean
                { propertyId: prop8Id, serviceProviderId: serviceProvider3Id, isRecommended: false }, // City Transport
                
                // Waterfront Condo - Waterfront services
                { propertyId: prop9Id, serviceProviderId: serviceProvider1Id, isRecommended: true }, // Premium Cleaning
                { propertyId: prop9Id, serviceProviderId: serviceProvider4Id, isRecommended: false }, // Luxury Transport
                
                // Desert Oasis Villa - Remote luxury
                { propertyId: prop10Id, serviceProviderId: serviceProvider1Id, isRecommended: true }, // Premium Cleaning
                { propertyId: prop10Id, serviceProviderId: serviceProvider4Id, isRecommended: true }, // Luxury Transport
                { propertyId: prop10Id, serviceProviderId: serviceProvider5Id, isRecommended: false }, // Gourmet Dining
                
                // Riverside Retreat - Nature retreat
                { propertyId: prop11Id, serviceProviderId: serviceProvider2Id, isRecommended: true }, // Sparkle Clean
                { propertyId: prop11Id, serviceProviderId: serviceProvider3Id, isRecommended: false }, // City Transport
                
                // City Center Studio - Budget urban
                { propertyId: prop12Id, serviceProviderId: serviceProvider2Id, isRecommended: true }, // Sparkle Clean
                { propertyId: prop12Id, serviceProviderId: serviceProvider3Id, isRecommended: true }, // City Transport
                
                // Lakeside Cabin - Lakefront services
                { propertyId: prop13Id, serviceProviderId: serviceProvider1Id, isRecommended: true }, // Premium Cleaning
                { propertyId: prop13Id, serviceProviderId: serviceProvider5Id, isRecommended: false }, // Gourmet Dining
                
                // Suburban Family Home - Family services
                { propertyId: prop14Id, serviceProviderId: serviceProvider2Id, isRecommended: true }, // Sparkle Clean
                { propertyId: prop14Id, serviceProviderId: serviceProvider3Id, isRecommended: false }, // City Transport
                
                // Ski Chalet - Mountain services
                { propertyId: prop15Id, serviceProviderId: serviceProvider1Id, isRecommended: true }, // Premium Cleaning
                { propertyId: prop15Id, serviceProviderId: serviceProvider4Id, isRecommended: false }, // Luxury Transport
            ];
            
            await db.insert(propertyServices).values(propertyServiceAssociations).onConflictDoNothing();
            console.log(`✓ Created ${propertyServiceAssociations.length} property-service associations`);

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
                const taskConfigs: any[] = [];
                
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

        // Insert CMS Content for informational pages
        console.log("Creating CMS content pages...");
        const cmsPages = [
            {
                pageKey: "about",
                pageName: "About Us",
                title: "About TravelHub - Your Global Travel Companion",
                content: `<div class="prose max-w-none">
                    <h2>Welcome to TravelHub</h2>
                    <p>TravelHub is your comprehensive platform for discovering and booking unique accommodations and services around the world. We connect travelers with property owners, service providers, and local experiences to create unforgettable journeys.</p>
                    
                    <h3>Our Mission</h3>
                    <p>We believe travel should be accessible, authentic, and enriching. Our mission is to empower travelers to explore the world with confidence while supporting local communities and businesses.</p>
                    
                    <h3>What We Offer</h3>
                    <ul>
                        <li><strong>Unique Accommodations:</strong> From cozy apartments to luxurious villas, find the perfect place to stay</li>
                        <li><strong>Local Services:</strong> Connect with trusted service providers for cleaning, maintenance, tours, and more</li>
                        <li><strong>Secure Booking:</strong> Safe and secure payment processing with Stripe integration</li>
                        <li><strong>24/7 Support:</strong> Our dedicated support team is always here to help</li>
                        <li><strong>Global Reach:</strong> Properties and services in major cities worldwide</li>
                    </ul>
                    
                    <h3>Our Community</h3>
                    <p>TravelHub is built on trust and community. We carefully vet all property owners and service providers to ensure quality and reliability. Our platform supports multiple languages and currencies, making it easy for anyone to join our global community.</p>
                    
                    <h3>Sustainability & Responsibility</h3>
                    <p>We are committed to sustainable travel practices and supporting local economies. When you book through TravelHub, you're not just finding a place to stay—you're contributing to local communities and helping preserve unique cultural experiences.</p>
                </div>`,
                metaDescription: "Learn about TravelHub - your trusted platform for global accommodations and local services. Connecting travelers with unique experiences worldwide.",
                metaKeywords: "about travelhub, travel platform, accommodation booking, local services, global travel",
                footerSection: "company" as const,
                isPublished: true,
                updatedBy: adminId,
            },
            {
                pageKey: "careers",
                pageName: "Careers",
                title: "Join the TravelHub Team",
                content: `<div class="prose max-w-none">
                    <h2>Build Your Career with TravelHub</h2>
                    <p>We're always looking for passionate, talented individuals to join our growing team. At TravelHub, you'll have the opportunity to shape the future of travel while working with a diverse, global team.</p>
                    
                    <h3>Why Work at TravelHub?</h3>
                    <ul>
                        <li><strong>Global Impact:</strong> Your work affects travelers and hosts around the world</li>
                        <li><strong>Innovation:</strong> We encourage creative thinking and new ideas</li>
                        <li><strong>Growth:</strong> Professional development and learning opportunities</li>
                        <li><strong>Culture:</strong> Inclusive, collaborative work environment</li>
                        <li><strong>Benefits:</strong> Competitive salary, health insurance, travel perks</li>
                        <li><strong>Flexibility:</strong> Remote work options available</li>
                    </ul>
                    
                    <h3>Current Openings</h3>
                    <p>We have positions available in various departments including engineering, customer support, marketing, and operations. Check our job board for current openings that match your skills and interests.</p>
                    
                    <h3>Our Values</h3>
                    <ul>
                        <li>Customer First - We prioritize user experience in everything we do</li>
                        <li>Innovation - We embrace change and continuous improvement</li>
                        <li>Integrity - We build trust through transparency and honesty</li>
                        <li>Collaboration - We work together to achieve great things</li>
                        <li>Diversity - We celebrate different perspectives and backgrounds</li>
                    </ul>
                    
                    <h3>Application Process</h3>
                    <p>Browse our current job openings, submit your application with your resume and cover letter, and our hiring team will review your qualifications. Qualified candidates will be contacted for interviews.</p>
                    
                    <p><strong>Ready to join us?</strong> Visit our careers page to view and apply for open positions.</p>
                </div>`,
                metaDescription: "Join TravelHub's team! Explore career opportunities in a global travel platform. Remote positions available.",
                metaKeywords: "travelhub careers, jobs, employment, travel industry jobs, remote work",
                footerSection: "company" as const,
                isPublished: true,
                updatedBy: adminId,
            },
            {
                pageKey: "press",
                pageName: "Press & Media",
                title: "TravelHub Press & Media Center",
                content: `<div class="prose max-w-none">
                    <h2>Press & Media Resources</h2>
                    <p>Welcome to TravelHub's press center. Here you'll find the latest news, press releases, media kits, and contact information for media inquiries.</p>
                    
                    <h3>Latest News</h3>
                    <p>TravelHub continues to expand globally, connecting travelers with unique accommodations and local services in over 50 countries. Our platform has facilitated thousands of successful bookings and helped local service providers grow their businesses.</p>
                    
                    <h3>Key Milestones</h3>
                    <ul>
                        <li>50+ countries with active listings</li>
                        <li>100,000+ successful bookings</li>
                        <li>5,000+ verified service providers</li>
                        <li>4.8/5 average customer rating</li>
                        <li>24/7 multilingual customer support</li>
                    </ul>
                    
                    <h3>Press Kit</h3>
                    <p>Our press kit includes:</p>
                    <ul>
                        <li>Company logos and brand assets</li>
                        <li>Executive bios and photos</li>
                        <li>Product screenshots</li>
                        <li>Company fact sheet</li>
                        <li>Recent press releases</li>
                    </ul>
                    
                    <h3>Media Contact</h3>
                    <p>For press inquiries, interviews, or additional information:</p>
                    <ul>
                        <li><strong>Email:</strong> press@travelhub.com</li>
                        <li><strong>Phone:</strong> +1 (555) 123-4567</li>
                        <li><strong>Response Time:</strong> Within 24 hours</li>
                    </ul>
                    
                    <h3>Featured Coverage</h3>
                    <p>TravelHub has been featured in leading travel and technology publications. We're always happy to share our insights on the future of travel, marketplace technology, and the sharing economy.</p>
                </div>`,
                metaDescription: "TravelHub press center with latest news, media resources, and contact information for journalists and media professionals.",
                metaKeywords: "travelhub press, media center, press releases, travel news, media kit",
                footerSection: "company" as const,
                isPublished: true,
                updatedBy: adminId,
            },
            {
                pageKey: "help",
                pageName: "Help Center",
                title: "TravelHub Help Center - Get Support",
                content: `<div class="prose max-w-none">
                    <h2>How Can We Help You?</h2>
                    <p>Welcome to the TravelHub Help Center. Find answers to common questions or contact our support team for assistance.</p>
                    
                    <h3>Getting Started</h3>
                    <h4>For Travelers</h4>
                    <ul>
                        <li>How to search and book properties</li>
                        <li>Understanding pricing and fees</li>
                        <li>Managing your bookings</li>
                        <li>Cancellation and refund policies</li>
                        <li>Leaving reviews</li>
                    </ul>
                    
                    <h4>For Property Owners</h4>
                    <ul>
                        <li>How to list your property</li>
                        <li>Setting seasonal pricing</li>
                        <li>Managing bookings and availability</li>
                        <li>Understanding payouts</li>
                        <li>Property requirements and standards</li>
                    </ul>
                    
                    <h4>For Service Providers</h4>
                    <ul>
                        <li>Registering as a service provider</li>
                        <li>Managing service categories</li>
                        <li>Pricing and packages</li>
                        <li>Order management</li>
                        <li>Earnings and payouts</li>
                    </ul>
                    
                    <h3>Account & Settings</h3>
                    <ul>
                        <li>Creating and verifying your account</li>
                        <li>Updating profile information</li>
                        <li>Password and security settings</li>
                        <li>Payment methods</li>
                        <li>Notification preferences</li>
                    </ul>
                    
                    <h3>Payments & Billing</h3>
                    <ul>
                        <li>Accepted payment methods</li>
                        <li>Understanding charges and fees</li>
                        <li>Refunds and disputes</li>
                        <li>Payment security</li>
                        <li>Invoices and receipts</li>
                    </ul>
                    
                    <h3>Safety & Trust</h3>
                    <ul>
                        <li>Verified properties and providers</li>
                        <li>Safety tips for travelers</li>
                        <li>Reporting concerns</li>
                        <li>Privacy protection</li>
                        <li>Dispute resolution</li>
                    </ul>
                    
                    <h3>Contact Support</h3>
                    <p>Can't find what you're looking for? Our support team is available 24/7:</p>
                    <ul>
                        <li><strong>Live Chat:</strong> Available in your dashboard</li>
                        <li><strong>Email:</strong> support@travelhub.com</li>
                        <li><strong>Phone:</strong> +1 (555) 987-6543</li>
                    </ul>
                </div>`,
                metaDescription: "TravelHub Help Center - Find answers to common questions about bookings, properties, services, and more. 24/7 support available.",
                metaKeywords: "travelhub help, support center, customer service, faq, how to book",
                footerSection: "support" as const,
                isPublished: true,
                updatedBy: adminId,
            },
            {
                pageKey: "safety",
                pageName: "Safety Center",
                title: "Your Safety is Our Priority",
                content: `<div class="prose max-w-none">
                    <h2>TravelHub Safety Center</h2>
                    <p>Your safety and security are our top priorities. We've implemented comprehensive measures to ensure safe experiences for all users.</p>
                    
                    <h3>Verified Properties & Providers</h3>
                    <p>All properties and service providers on TravelHub undergo verification:</p>
                    <ul>
                        <li>Identity verification for all hosts and providers</li>
                        <li>Property inspection and quality checks</li>
                        <li>Background checks for service providers</li>
                        <li>Review and rating system</li>
                        <li>Ongoing monitoring and compliance</li>
                    </ul>
                    
                    <h3>Secure Payments</h3>
                    <p>All transactions are processed securely through Stripe:</p>
                    <ul>
                        <li>PCI-compliant payment processing</li>
                        <li>Encrypted data transmission</li>
                        <li>Fraud detection and prevention</li>
                        <li>Secure refund process</li>
                        <li>No stored credit card details</li>
                    </ul>
                    
                    <h3>Privacy Protection</h3>
                    <p>We protect your personal information:</p>
                    <ul>
                        <li>GDPR and data protection compliance</li>
                        <li>Secure data storage and encryption</li>
                        <li>Limited information sharing</li>
                        <li>Privacy-first communication</li>
                        <li>Right to data access and deletion</li>
                    </ul>
                    
                    <h3>Travel Safety Tips</h3>
                    <h4>Before Booking</h4>
                    <ul>
                        <li>Read property reviews and ratings</li>
                        <li>Verify property photos and descriptions</li>
                        <li>Check host/provider response time</li>
                        <li>Review cancellation policies</li>
                        <li>Communicate through our platform</li>
                    </ul>
                    
                    <h4>During Your Stay</h4>
                    <ul>
                        <li>Keep emergency contact information handy</li>
                        <li>Know local emergency services numbers</li>
                        <li>Document property condition upon arrival</li>
                        <li>Report any safety concerns immediately</li>
                        <li>Keep communication on platform</li>
                    </ul>
                    
                    <h3>24/7 Safety Support</h3>
                    <p>Our trust and safety team is available around the clock:</p>
                    <ul>
                        <li><strong>Emergency Line:</strong> +1 (555) 911-SAFE</li>
                        <li><strong>Safety Email:</strong> safety@travelhub.com</li>
                        <li><strong>Report Issues:</strong> Use in-app reporting</li>
                    </ul>
                    
                    <h3>COVID-19 Safety</h3>
                    <p>Enhanced cleaning protocols and safety guidelines are in place to protect guests and hosts during the pandemic.</p>
                    
                    <h3>Report a Safety Concern</h3>
                    <p>If you experience or witness anything that makes you feel unsafe, please report it immediately. We take all reports seriously and investigate promptly.</p>
                </div>`,
                metaDescription: "TravelHub Safety Center - Learn about our safety measures, verified properties, secure payments, and 24/7 support to ensure your protection.",
                metaKeywords: "travelhub safety, secure booking, verified properties, travel safety tips, payment security",
                footerSection: "support" as const,
                isPublished: true,
                updatedBy: adminId,
            },
            {
                pageKey: "cancellation",
                pageName: "Cancellation Policy",
                title: "Cancellation Policy - Flexible Options",
                content: `<div class="prose max-w-none">
                    <h2>Cancellation Policy</h2>
                    <p>We understand plans change. TravelHub offers flexible cancellation options to accommodate your needs while protecting property owners and service providers.</p>
                    
                    <h3>Property Booking Cancellations</h3>
                    
                    <h4>Flexible Cancellation</h4>
                    <ul>
                        <li><strong>Full refund:</strong> Cancel up to 24 hours before check-in</li>
                        <li><strong>50% refund:</strong> Cancel within 24 hours of check-in</li>
                        <li><strong>No refund:</strong> Cancel after check-in</li>
                        <li><strong>Service fee:</strong> Non-refundable service fees apply</li>
                    </ul>
                    
                    <h4>Moderate Cancellation</h4>
                    <ul>
                        <li><strong>Full refund:</strong> Cancel up to 5 days before check-in</li>
                        <li><strong>50% refund:</strong> Cancel within 5 days of check-in</li>
                        <li><strong>No refund:</strong> Cancel within 48 hours or after check-in</li>
                        <li><strong>Service fee:</strong> Non-refundable in all cases</li>
                    </ul>
                    
                    <h4>Strict Cancellation</h4>
                    <ul>
                        <li><strong>Full refund:</strong> Cancel up to 14 days before check-in</li>
                        <li><strong>50% refund:</strong> Cancel 7-14 days before check-in</li>
                        <li><strong>No refund:</strong> Cancel within 7 days or after check-in</li>
                        <li><strong>Service fee:</strong> Non-refundable in all cases</li>
                    </ul>
                    
                    <h3>Service Order Cancellations</h3>
                    
                    <h4>Client Cancellations</h4>
                    <ul>
                        <li><strong>Full refund:</strong> Cancel 24+ hours before service</li>
                        <li><strong>50% refund:</strong> Cancel 12-24 hours before service</li>
                        <li><strong>No refund:</strong> Cancel within 12 hours or after start</li>
                    </ul>
                    
                    <h4>Provider Cancellations</h4>
                    <ul>
                        <li>Providers who cancel receive penalties</li>
                        <li>Clients receive full refunds for provider cancellations</li>
                        <li>Emergency cancellations may be exempt from penalties</li>
                    </ul>
                    
                    <h3>How to Cancel</h3>
                    <ol>
                        <li>Log in to your TravelHub account</li>
                        <li>Go to "My Bookings" or "My Orders"</li>
                        <li>Select the booking/order to cancel</li>
                        <li>Click "Cancel" and follow the prompts</li>
                        <li>Review refund amount and confirm</li>
                    </ol>
                    
                    <h3>Refund Processing</h3>
                    <ul>
                        <li>Refunds processed within 5-10 business days</li>
                        <li>Original payment method receives refund</li>
                        <li>Email confirmation sent upon processing</li>
                        <li>Service fees are non-refundable</li>
                    </ul>
                    
                    <h3>Extenuating Circumstances</h3>
                    <p>In cases of unforeseen events (natural disasters, serious illness, travel restrictions), we may provide exceptions to our standard policy. Contact support with documentation for review.</p>
                    
                    <h3>Dispute Resolution</h3>
                    <p>If you disagree with a cancellation decision, you can file a dispute through your account. Our team will review and respond within 48 hours.</p>
                    
                    <h3>Questions?</h3>
                    <p>Contact our support team at support@travelhub.com or call +1 (555) 987-6543 for assistance with cancellations.</p>
                </div>`,
                metaDescription: "TravelHub cancellation policy - Flexible options for property bookings and service orders with clear refund guidelines.",
                metaKeywords: "cancellation policy, refund policy, booking cancellation, flexible cancellation, travelhub terms",
                footerSection: "legal" as const,
                isPublished: true,
                updatedBy: adminId,
            },
            {
                pageKey: "contact",
                pageName: "Contact Us",
                title: "Get in Touch with TravelHub",
                content: `<div class="prose max-w-none">
                    <h2>Contact TravelHub</h2>
                    <p>We're here to help! Reach out to us through any of the following channels.</p>
                    
                    <h3>Customer Support</h3>
                    <p><strong>Available 24/7</strong></p>
                    <ul>
                        <li><strong>Live Chat:</strong> Click the chat icon in your dashboard</li>
                        <li><strong>Email:</strong> support@travelhub.com</li>
                        <li><strong>Phone:</strong> +1 (555) 987-6543</li>
                        <li><strong>Response Time:</strong> Within 2 hours</li>
                    </ul>
                    
                    <h3>Department Contacts</h3>
                    
                    <h4>General Inquiries</h4>
                    <p>Email: info@travelhub.com<br/>Phone: +1 (555) 123-4567</p>
                    
                    <h4>Press & Media</h4>
                    <p>Email: press@travelhub.com<br/>Phone: +1 (555) 123-4567</p>
                    
                    <h4>Partnerships</h4>
                    <p>Email: partnerships@travelhub.com<br/>Phone: +1 (555) 234-5678</p>
                    
                    <h4>Safety & Trust</h4>
                    <p>Email: safety@travelhub.com<br/>Emergency: +1 (555) 911-SAFE</p>
                    
                    <h4>Legal & Compliance</h4>
                    <p>Email: legal@travelhub.com<br/>Phone: +1 (555) 345-6789</p>
                    
                    <h3>Office Locations</h3>
                    
                    <h4>Headquarters</h4>
                    <p>
                        TravelHub Inc.<br/>
                        123 Travel Plaza, Suite 500<br/>
                        San Francisco, CA 94102<br/>
                        United States
                    </p>
                    
                    <h4>European Office</h4>
                    <p>
                        TravelHub Europe<br/>
                        456 Tourism Boulevard<br/>
                        London EC1A 1BB<br/>
                        United Kingdom
                    </p>
                    
                    <h4>Asia-Pacific Office</h4>
                    <p>
                        TravelHub APAC<br/>
                        789 Hospitality Street<br/>
                        Singapore 018956<br/>
                        Singapore
                    </p>
                    
                    <h3>Social Media</h3>
                    <ul>
                        <li>Facebook: /travelhub</li>
                        <li>Twitter: @travelhub</li>
                        <li>Instagram: @travelhub</li>
                        <li>LinkedIn: /company/travelhub</li>
                    </ul>
                    
                    <h3>For Urgent Issues</h3>
                    <p>If you have an urgent safety concern or emergency:</p>
                    <ul>
                        <li>Call our 24/7 emergency line: +1 (555) 911-SAFE</li>
                        <li>Use the in-app emergency reporting feature</li>
                        <li>Contact local authorities if necessary</li>
                    </ul>
                    
                    <h3>Feedback & Suggestions</h3>
                    <p>We value your feedback! Share your ideas and suggestions at feedback@travelhub.com</p>
                </div>`,
                metaDescription: "Contact TravelHub - 24/7 customer support, office locations, and department contacts. We're here to help!",
                metaKeywords: "contact travelhub, customer support, help desk, phone number, email support",
                footerSection: "support" as const,
                isPublished: true,
                updatedBy: adminId,
            },
            {
                pageKey: "resources",
                pageName: "Resources",
                title: "TravelHub Resources for Travelers and Hosts",
                content: `<div class="prose max-w-none">
                    <h2>Resources & Guides</h2>
                    <p>Helpful resources to make the most of your TravelHub experience.</p>
                    
                    <h3>For Travelers</h3>
                    <h4>Travel Guides</h4>
                    <ul>
                        <li>Destination guides and local insights</li>
                        <li>Packing tips and travel essentials</li>
                        <li>Cultural etiquette and customs</li>
                        <li>Transportation and getting around</li>
                        <li>Budget travel tips</li>
                    </ul>
                    
                    <h4>Booking Resources</h4>
                    <ul>
                        <li>How to find the perfect property</li>
                        <li>Reading reviews effectively</li>
                        <li>Understanding pricing and fees</li>
                        <li>Communicating with hosts</li>
                        <li>Making special requests</li>
                    </ul>
                    
                    <h3>For Property Owners</h3>
                    <h4>Hosting Guides</h4>
                    <ul>
                        <li>Creating an attractive listing</li>
                        <li>Professional photography tips</li>
                        <li>Pricing strategies and optimization</li>
                        <li>Seasonal pricing best practices</li>
                        <li>Managing bookings efficiently</li>
                    </ul>
                    
                    <h4>Property Management</h4>
                    <ul>
                        <li>Maintenance and upkeep</li>
                        <li>Guest communication templates</li>
                        <li>House rules and guidelines</li>
                        <li>Emergency preparedness</li>
                        <li>Insurance and protection</li>
                    </ul>
                    
                    <h3>For Service Providers</h3>
                    <h4>Provider Success</h4>
                    <ul>
                        <li>Building your service profile</li>
                        <li>Setting competitive pricing</li>
                        <li>Managing service categories</li>
                        <li>Creating service packages</li>
                        <li>Maximizing bookings</li>
                    </ul>
                    
                    <h4>Service Excellence</h4>
                    <ul>
                        <li>Quality standards and requirements</li>
                        <li>Customer service best practices</li>
                        <li>Handling special requests</li>
                        <li>Building positive reviews</li>
                        <li>Growing your business</li>
                    </ul>
                    
                    <h3>Downloads & Templates</h3>
                    <ul>
                        <li>Guest welcome letter template</li>
                        <li>House rules template</li>
                        <li>Cleaning checklist</li>
                        <li>Property inspection form</li>
                        <li>Service agreement template</li>
                    </ul>
                    
                    <h3>Video Tutorials</h3>
                    <ul>
                        <li>Getting started with TravelHub</li>
                        <li>Creating your first listing</li>
                        <li>Managing bookings and calendar</li>
                        <li>Using the messaging system</li>
                        <li>Understanding analytics</li>
                    </ul>
                    
                    <h3>Community Forum</h3>
                    <p>Connect with other hosts and providers, share experiences, and get advice from the TravelHub community.</p>
                    
                    <h3>Blog & Updates</h3>
                    <p>Stay informed with our latest blog posts featuring travel tips, industry insights, and platform updates.</p>
                </div>`,
                metaDescription: "TravelHub resources - Guides, templates, and tutorials for travelers, property owners, and service providers.",
                metaKeywords: "travelhub resources, travel guides, hosting tips, service provider guides, tutorials",
                footerSection: "resources" as const,
                isPublished: true,
                updatedBy: adminId,
            },
            {
                pageKey: "community",
                pageName: "Community",
                title: "TravelHub Community - Connect and Share",
                content: `<div class="prose max-w-none">
                    <h2>Join the TravelHub Community</h2>
                    <p>TravelHub is more than a platform—it's a global community of travelers, hosts, and service providers sharing experiences and creating connections.</p>
                    
                    <h3>Community Guidelines</h3>
                    <p>Our community thrives on mutual respect, trust, and kindness. All members are expected to:</p>
                    <ul>
                        <li>Treat others with respect and courtesy</li>
                        <li>Communicate honestly and transparently</li>
                        <li>Respect property and privacy</li>
                        <li>Follow local laws and regulations</li>
                        <li>Report concerns promptly</li>
                    </ul>
                    
                    <h3>Community Events</h3>
                    <h4>Host Meetups</h4>
                    <p>Connect with fellow hosts in your area to share tips, experiences, and best practices. Regular meetups are organized in major cities worldwide.</p>
                    
                    <h4>Provider Workshops</h4>
                    <p>Educational workshops and training sessions help service providers improve their skills and grow their businesses.</p>
                    
                    <h4>Travel Experiences</h4>
                    <p>Join group travel experiences and events organized by community members around the world.</p>
                    
                    <h3>Community Programs</h3>
                    
                    <h4>Superhosts Program</h4>
                    <p>Recognition for hosts who consistently provide exceptional experiences. Benefits include:</p>
                    <ul>
                        <li>Special badge on your listing</li>
                        <li>Priority customer support</li>
                        <li>Exclusive resources and tips</li>
                        <li>Networking opportunities</li>
                        <li>Annual recognition events</li>
                    </ul>
                    
                    <h4>Community Champions</h4>
                    <p>Active community members who help others and contribute to platform improvement. Champions receive:</p>
                    <ul>
                        <li>Early access to new features</li>
                        <li>Direct communication with TravelHub team</li>
                        <li>Exclusive community events</li>
                        <li>Recognition and rewards</li>
                    </ul>
                    
                    <h3>Success Stories</h3>
                    <p>Read inspiring stories from our community members who have built successful hosting businesses, traveled the world, and created lasting connections.</p>
                    
                    <h3>Forum & Discussions</h3>
                    <p>Participate in community discussions on topics including:</p>
                    <ul>
                        <li>Hosting tips and tricks</li>
                        <li>Travel recommendations</li>
                        <li>Service provider best practices</li>
                        <li>Platform feedback and suggestions</li>
                        <li>Local insights and guides</li>
                    </ul>
                    
                    <h3>Give Back</h3>
                    <h4>Social Impact</h4>
                    <p>TravelHub partners with local organizations to support communities through:</p>
                    <ul>
                        <li>Sustainable tourism initiatives</li>
                        <li>Local business support programs</li>
                        <li>Cultural preservation projects</li>
                        <li>Educational opportunities</li>
                        <li>Environmental protection</li>
                    </ul>
                    
                    <h4>Volunteer Opportunities</h4>
                    <p>Join community service projects and volunteer programs in destinations around the world.</p>
                    
                    <h3>Connect with Us</h3>
                    <ul>
                        <li>Join our community forum</li>
                        <li>Follow us on social media</li>
                        <li>Attend local events</li>
                        <li>Share your story</li>
                        <li>Provide feedback</li>
                    </ul>
                </div>`,
                metaDescription: "Join the TravelHub community - Connect with travelers, hosts, and providers worldwide. Participate in events, programs, and discussions.",
                metaKeywords: "travelhub community, host meetups, travel community, superhosts, community events",
                footerSection: "resources" as const,
                isPublished: true,
                updatedBy: adminId,
            },
            {
                pageKey: "sitemap",
                pageName: "Sitemap",
                title: "TravelHub Sitemap - Navigate Our Platform",
                content: `<div class="prose max-w-none">
                    <h2>Site Navigation</h2>
                    <p>Complete guide to all pages and features on TravelHub.</p>
                    
                    <h3>Main Pages</h3>
                    <ul>
                        <li><a href="/">Home</a> - Explore destinations and search properties</li>
                        <li><a href="/about">About Us</a> - Learn about TravelHub</li>
                        <li><a href="/contact">Contact</a> - Get in touch with us</li>
                    </ul>
                    
                    <h3>For Travelers</h3>
                    <ul>
                        <li><a href="/properties">Browse Properties</a> - Search accommodations</li>
                        <li><a href="/services">Services</a> - Find local service providers</li>
                        <li><a href="/my-bookings">My Bookings</a> - Manage your reservations</li>
                        <li><a href="/favorites">Favorites</a> - Saved properties and services</li>
                        <li><a href="/trip-planner">Trip Planner</a> - Plan your journey</li>
                    </ul>
                    
                    <h3>For Property Owners</h3>
                    <ul>
                        <li><a href="/host-dashboard">Host Dashboard</a> - Manage your listings</li>
                        <li><a href="/add-property">List Property</a> - Create new listing</li>
                        <li><a href="/seasonal-pricing">Seasonal Pricing</a> - Manage pricing</li>
                        <li><a href="/host-bookings">Bookings</a> - View reservations</li>
                    </ul>
                    
                    <h3>For Service Providers</h3>
                    <ul>
                        <li><a href="/provider-dashboard">Provider Dashboard</a> - Manage services</li>
                        <li><a href="/service-orders">Service Orders</a> - View and manage orders</li>
                        <li><a href="/provider-earnings">Earnings</a> - Track your income</li>
                        <li><a href="/provider-schedule">Schedule</a> - Manage availability</li>
                    </ul>
                    
                    <h3>Account & Settings</h3>
                    <ul>
                        <li><a href="/login">Login</a> - Access your account</li>
                        <li><a href="/register">Register</a> - Create new account</li>
                        <li><a href="/profile">Profile</a> - Update your information</li>
                        <li><a href="/settings">Settings</a> - Account preferences</li>
                        <li><a href="/messages">Messages</a> - Communication center</li>
                        <li><a href="/notifications">Notifications</a> - View alerts</li>
                    </ul>
                    
                    <h3>Information & Support</h3>
                    <ul>
                        <li><a href="/help">Help Center</a> - FAQs and support</li>
                        <li><a href="/safety">Safety</a> - Safety guidelines</li>
                        <li><a href="/cancellation">Cancellation Policy</a> - Refund information</li>
                        <li><a href="/resources">Resources</a> - Guides and tutorials</li>
                        <li><a href="/community">Community</a> - Connect with others</li>
                    </ul>
                    
                    <h3>Company</h3>
                    <ul>
                        <li><a href="/about">About Us</a> - Company information</li>
                        <li><a href="/careers">Careers</a> - Job opportunities</li>
                        <li><a href="/press">Press</a> - Media resources</li>
                        <li><a href="/blog">Blog</a> - News and updates</li>
                    </ul>
                    
                    <h3>Legal</h3>
                    <ul>
                        <li><a href="/terms">Terms of Service</a> - User agreement</li>
                        <li><a href="/privacy">Privacy Policy</a> - Data protection</li>
                        <li><a href="/cookie-policy">Cookie Policy</a> - Cookie usage</li>
                    </ul>
                    
                    <h3>Admin (Restricted)</h3>
                    <ul>
                        <li>Admin Dashboard - Platform management</li>
                        <li>User Management - Approve and manage users</li>
                        <li>Content Management - CMS settings</li>
                        <li>Analytics - Platform statistics</li>
                    </ul>
                </div>`,
                metaDescription: "TravelHub sitemap - Complete navigation guide to all pages, features, and sections of our platform.",
                metaKeywords: "travelhub sitemap, site navigation, page directory, platform guide",
                footerSection: "none" as const,
                isPublished: true,
                updatedBy: adminId,
            },
        ];

        await db.insert(cmsContent).values(cmsPages).onConflictDoNothing();
        console.log(`✓ Created ${cmsPages.length} CMS content pages`);

        // Create blog posts
        console.log("Creating blog posts...");
        const blogPostsData = [
            {
                title: "Top 10 Hidden Gems for Your Next Beach Vacation",
                slug: "top-10-hidden-gems-beach-vacation",
                excerpt: "Discover breathtaking beaches away from the crowds. From secluded coves to pristine coastlines, we've curated a list of the world's best-kept beach secrets that will make your next vacation unforgettable.",
                content: `<h2>Introduction</h2>
                <p>Are you tired of overcrowded beaches and tourist traps? We've scoured the globe to find the most stunning, lesser-known beach destinations that offer crystal-clear waters, pristine sands, and the peaceful escape you've been dreaming of.</p>
                
                <h3>1. Navagio Beach, Zakynthos, Greece</h3>
                <p>Also known as Shipwreck Beach, this stunning cove is only accessible by boat. The dramatic limestone cliffs and the famous shipwreck create an unforgettable backdrop for your beach day.</p>
                
                <h3>2. Anse Source d'Argent, Seychelles</h3>
                <p>With its unique granite boulders and shallow turquoise waters, this beach is a photographer's paradise. The calm lagoons make it perfect for families with children.</p>
                
                <h3>3. Whitehaven Beach, Australia</h3>
                <p>Located in the Whitsunday Islands, this 7km stretch of pristine silica sand is consistently rated as one of the world's best beaches. The sand is so pure it doesn't retain heat!</p>
                
                <h3>4. Pink Sands Beach, Bahamas</h3>
                <p>This three-mile stretch of pink sand gets its unique color from tiny coral insects. The calm waters and gentle surf make it ideal for swimming and snorkeling.</p>
                
                <h3>5. El Nido, Palawan, Philippines</h3>
                <p>Hidden lagoons, secret beaches, and towering limestone cliffs create a dramatic landscape. Island hopping tours reveal one stunning beach after another.</p>
                
                <h2>Planning Your Trip</h2>
                <p>When planning your visit to these hidden gems, consider traveling during shoulder seasons (April-May or September-October) to avoid crowds while still enjoying great weather. Book accommodations well in advance, especially for remote locations.</p>
                
                <h2>Essential Tips</h2>
                <ul>
                    <li>Research local regulations and protected areas</li>
                    <li>Pack reef-safe sunscreen to protect marine ecosystems</li>
                    <li>Bring a waterproof camera for unforgettable memories</li>
                    <li>Respect local communities and their customs</li>
                    <li>Leave no trace - take all trash with you</li>
                </ul>
                
                <p>Ready to explore these hidden paradise beaches? Start planning your dream vacation today and experience the magic of uncrowded, pristine coastlines that few travelers get to see.</p>`,
                featuredImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800&fit=crop",
                authorId: marketingId,
                category: "Destinations",
                tags: ["beaches", "travel tips", "hidden gems", "vacation planning", "tropical destinations"],
                status: "published" as const,
                publishedAt: new Date("2024-11-01T10:00:00Z"),
            },
            {
                title: "How to Travel on a Budget: 15 Money-Saving Tips",
                slug: "travel-on-budget-money-saving-tips",
                excerpt: "Travel doesn't have to break the bank. Learn practical strategies to explore the world without emptying your wallet, from finding cheap flights to scoring free accommodations.",
                content: `<h2>Travel More, Spend Less</h2>
                <p>Traveling on a budget doesn't mean sacrificing experiences. With smart planning and insider knowledge, you can explore amazing destinations while keeping your expenses low. Here are our top 15 money-saving tips for budget-conscious travelers.</p>
                
                <h3>1. Be Flexible with Your Dates</h3>
                <p>Flying mid-week (Tuesday or Wednesday) is often significantly cheaper than weekend travel. Use flight comparison tools to see price differences across multiple days.</p>
                
                <h3>2. Book in Advance (But Not Too Early)</h3>
                <p>The sweet spot for booking flights is typically 6-8 weeks before departure for domestic trips and 2-3 months for international travel.</p>
                
                <h3>3. Use Budget Accommodations</h3>
                <p>Consider hostels, vacation rentals, or home exchanges instead of hotels. Platforms like TravelHub offer great deals on unique properties that cost less than traditional hotels.</p>
                
                <h3>4. Eat Like a Local</h3>
                <p>Skip touristy restaurants and eat where locals eat. Street food, local markets, and neighborhood cafes offer authentic experiences at fraction of the cost.</p>
                
                <h3>5. Walk or Use Public Transportation</h3>
                <p>Explore cities on foot or use public transit instead of taxis. You'll save money while getting a more authentic feel for the destination.</p>
                
                <h3>6. Travel During Shoulder Season</h3>
                <p>Visit popular destinations during their shoulder seasons (just before or after peak season) for better prices and fewer crowds.</p>
                
                <h3>7. Take Advantage of Free Activities</h3>
                <p>Most cities offer free walking tours, museums with free admission days, parks, beaches, and cultural events.</p>
                
                <h3>8. Pack Light to Avoid Baggage Fees</h3>
                <p>Travel with carry-on only to save on checked bag fees. This also saves time at the airport and reduces the risk of lost luggage.</p>
                
                <h2>Additional Money-Saving Strategies</h2>
                <ul>
                    <li>Sign up for airline newsletters for exclusive deals</li>
                    <li>Use credit card rewards and points strategically</li>
                    <li>Cook some meals if your accommodation has a kitchen</li>
                    <li>Buy tickets and tours locally rather than online</li>
                    <li>Stay connected with free WiFi instead of buying data plans</li>
                    <li>Bring a reusable water bottle to avoid buying bottled water</li>
                    <li>Research free entertainment options before you go</li>
                </ul>
                
                <h2>Conclusion</h2>
                <p>Budget travel is about making smart choices, not missing out on experiences. With these tips, you can explore more destinations, stay longer, and create unforgettable memories without financial stress. Start planning your next adventure today!</p>`,
                featuredImage: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=800&fit=crop",
                authorId: adminId,
                category: "Travel Tips",
                tags: ["budget travel", "money saving", "travel hacks", "planning", "backpacking"],
                status: "published" as const,
                publishedAt: new Date("2024-11-10T14:30:00Z"),
            },
            {
                title: "The Ultimate Guide to Sustainable Tourism",
                slug: "ultimate-guide-sustainable-tourism",
                excerpt: "Learn how to travel responsibly and minimize your environmental impact. Discover eco-friendly accommodations, sustainable activities, and ways to give back to local communities.",
                content: `<h2>Why Sustainable Tourism Matters</h2>
                <p>As global tourism continues to grow, so does its impact on the environment and local communities. Sustainable tourism isn't just a trend—it's a necessity. Here's how you can make a positive difference while exploring the world.</p>
                
                <h3>Choose Eco-Friendly Accommodations</h3>
                <p>Look for properties with green certifications, solar power, water conservation systems, and waste reduction programs. Many accommodations on TravelHub are committed to sustainable practices.</p>
                
                <h3>Support Local Businesses</h3>
                <p>Shop at local markets, eat at family-owned restaurants, and book tours with local guides. Your spending directly benefits the community and provides authentic cultural experiences.</p>
                
                <h3>Reduce Your Carbon Footprint</h3>
                <p>Consider train travel over flights when possible, offset your carbon emissions, pack light to reduce fuel consumption, and choose direct flights to minimize emissions.</p>
                
                <h3>Respect Wildlife and Nature</h3>
                <p>Never touch or feed wildlife, stay on designated trails, avoid attractions that exploit animals, and choose responsible wildlife tours that prioritize animal welfare.</p>
                
                <h3>Minimize Plastic Waste</h3>
                <p>Bring reusable water bottles, shopping bags, and utensils. Refuse single-use plastics and properly dispose of or recycle waste according to local guidelines.</p>
                
                <h3>Learn About Local Culture</h3>
                <p>Research cultural norms and etiquette before visiting. Show respect for local traditions, dress codes, and customs. Learn a few phrases in the local language.</p>
                
                <h2>Sustainable Activities to Consider</h2>
                <ul>
                    <li>Volunteer with local conservation projects</li>
                    <li>Participate in beach or trail cleanups</li>
                    <li>Visit community-based tourism initiatives</li>
                    <li>Take cooking classes with local families</li>
                    <li>Support artisan cooperatives and fair trade shops</li>
                    <li>Choose eco-tours and nature education programs</li>
                </ul>
                
                <h2>Making a Long-Term Impact</h2>
                <p>Sustainable tourism is about making conscious choices that benefit destinations for generations to come. By traveling responsibly, you help preserve natural wonders, support local economies, and ensure that these incredible places remain accessible for future travelers.</p>`,
                featuredImage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop",
                authorId: marketingId,
                category: "Sustainable Travel",
                tags: ["sustainable tourism", "eco-friendly", "responsible travel", "environment", "conservation"],
                status: "published" as const,
                publishedAt: new Date("2024-11-15T09:00:00Z"),
            },
            {
                title: "Digital Nomad Destinations 2025: Where to Work Remotely",
                slug: "digital-nomad-destinations-2025",
                excerpt: "Discover the best cities for remote workers with great WiFi, affordable living costs, thriving communities, and amazing lifestyles. Your guide to working while traveling in 2025.",
                content: `<h2>The Rise of Digital Nomadism</h2>
                <p>With remote work becoming the norm, more professionals are choosing to work from anywhere. Here are the top destinations for digital nomads in 2025, combining excellent infrastructure, affordable living, and vibrant communities.</p>
                
                <h3>1. Lisbon, Portugal</h3>
                <p><strong>Why it's great:</strong> Affordable cost of living, excellent coworking spaces, strong digital nomad community, year-round sunshine, and a special digital nomad visa program.</p>
                <p><strong>Average monthly cost:</strong> $2,000-$3,000</p>
                <p><strong>Best neighborhoods:</strong> Principe Real, Santos, Chiado</p>
                
                <h3>2. Bali, Indonesia</h3>
                <p><strong>Why it's great:</strong> Ultra-affordable, stunning beaches, yoga and wellness culture, massive expat community, and countless coworking spaces.</p>
                <p><strong>Average monthly cost:</strong> $1,200-$2,000</p>
                <p><strong>Best areas:</strong> Canggu, Ubud, Seminyak</p>
                
                <h3>3. Medellín, Colombia</h3>
                <p><strong>Why it's great:</strong> Perfect climate (City of Eternal Spring), low cost of living, growing tech scene, friendly locals, and improving safety.</p>
                <p><strong>Average monthly cost:</strong> $1,500-$2,500</p>
                <p><strong>Best neighborhoods:</strong> El Poblado, Laureles, Envigado</p>
                
                <h3>4. Chiang Mai, Thailand</h3>
                <p><strong>Why it's great:</strong> Very affordable, incredible food scene, beautiful temples, mountain scenery, and one of the world's oldest digital nomad hubs.</p>
                <p><strong>Average monthly cost:</strong> $1,000-$1,800</p>
                <p><strong>Best areas:</strong> Nimman, Old City, Riverside</p>
                
                <h3>5. Mexico City, Mexico</h3>
                <p><strong>Why it's great:</strong> World-class cuisine, rich culture, excellent coworking spaces, favorable time zone for US clients, and affordable living.</p>
                <p><strong>Average monthly cost:</strong> $1,800-$2,800</p>
                <p><strong>Best neighborhoods:</strong> Roma, Condesa, Polanco</p>
                
                <h2>Essential Considerations</h2>
                <h3>Internet Speed</h3>
                <p>All recommended destinations offer reliable high-speed internet (50+ Mbps) in coworking spaces and many accommodations.</p>
                
                <h3>Visa Requirements</h3>
                <p>Research visa options carefully. Many countries now offer specific digital nomad visas with extended stays and tax benefits.</p>
                
                <h3>Time Zones</h3>
                <p>Consider your work hours and client locations when choosing a destination. Time zone differences can be challenging.</p>
                
                <h2>Tips for Success</h2>
                <ul>
                    <li>Join coworking spaces to network and stay productive</li>
                    <li>Maintain a routine despite location changes</li>
                    <li>Invest in travel insurance with health coverage</li>
                    <li>Set up reliable banking and payment systems</li>
                    <li>Stay longer (3+ months) to reduce travel fatigue</li>
                    <li>Build emergency funds for unexpected situations</li>
                </ul>`,
                featuredImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=800&fit=crop",
                authorId: adminId,
                category: "Digital Nomad",
                tags: ["digital nomad", "remote work", "coworking", "expat life", "work from anywhere"],
                status: "published" as const,
                publishedAt: new Date("2024-11-20T11:00:00Z"),
            },
            {
                title: "Family Travel Made Easy: Tips for Stress-Free Vacations",
                slug: "family-travel-tips-stress-free-vacations",
                excerpt: "Planning a family vacation can be overwhelming. From packing hacks to keeping kids entertained, here's everything you need to know for a smooth and memorable family trip.",
                content: `<h2>Making Family Travel Enjoyable for Everyone</h2>
                <p>Traveling with children doesn't have to be stressful. With proper planning and the right mindset, family vacations can create lifelong memories. Here's your comprehensive guide to stress-free family travel.</p>
                
                <h3>Pre-Trip Planning</h3>
                <h4>Choose Family-Friendly Destinations</h4>
                <p>Look for destinations with activities suitable for all ages, good healthcare facilities, safe neighborhoods, and family-friendly accommodations with kitchen facilities and separate bedrooms.</p>
                
                <h4>Involve Kids in Planning</h4>
                <p>Let children help choose activities and destinations. This builds excitement and gives them ownership of the trip, reducing complaints later.</p>
                
                <h4>Book Kid-Friendly Accommodations</h4>
                <p>Look for properties on TravelHub that offer:</p>
                <ul>
                    <li>Multiple bedrooms for privacy</li>
                    <li>Kitchen or kitchenette for preparing meals</li>
                    <li>Pool or playground facilities</li>
                    <li>Cribs and high chairs available</li>
                    <li>Washer/dryer for longer stays</li>
                </ul>
                
                <h3>Packing Smart</h3>
                <h4>Create a Packing List</h4>
                <p>Start your list two weeks before departure. Include essentials like:</p>
                <ul>
                    <li>Medications and first-aid supplies</li>
                    <li>Comfort items (favorite blanket, stuffed animal)</li>
                    <li>Snacks and sippy cups</li>
                    <li>Entertainment (books, tablets, games)</li>
                    <li>Extra clothes and diapers</li>
                </ul>
                
                <h4>Pack a Day Bag</h4>
                <p>Always have a bag with snacks, water, sunscreen, hand sanitizer, wipes, change of clothes, and entertainment for unexpected delays.</p>
                
                <h3>During the Trip</h3>
                <h4>Maintain Routines</h4>
                <p>Try to keep regular meal and sleep times. Tired, hungry kids are unhappy kids. Build in rest time during busy days.</p>
                
                <h4>Be Flexible</h4>
                <p>Don't over-schedule. Allow for spontaneity and downtime. It's okay to skip an activity if everyone's tired.</p>
                
                <h4>Take Breaks</h4>
                <p>Schedule downtime between activities. Let kids run around at parks or playgrounds to burn energy.</p>
                
                <h3>Entertainment Strategies</h3>
                <ul>
                    <li>Create travel journals or scrapbooks</li>
                    <li>Play travel games (I Spy, license plate bingo)</li>
                    <li>Download offline content before trips</li>
                    <li>Bring new small toys or activities for surprises</li>
                    <li>Use travel time for audiobooks or podcasts</li>
                </ul>
                
                <h2>Safety First</h2>
                <p>Always have emergency contacts, copies of important documents, and travel insurance. Teach kids your phone number and hotel name. Use GPS tracking devices for young children in crowded places.</p>
                
                <h2>Creating Memories</h2>
                <p>Take lots of photos, collect souvenirs, and talk about experiences during and after the trip. Remember, the best family vacations aren't perfect—they're the ones where you're together making memories.</p>`,
                featuredImage: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&h=800&fit=crop",
                authorId: marketingId,
                category: "Family Travel",
                tags: ["family travel", "kids", "vacation planning", "parenting", "travel with children"],
                status: "published" as const,
                publishedAt: new Date("2024-11-25T08:30:00Z"),
            },
            {
                title: "Adventure Travel: Thrilling Experiences Around the World",
                slug: "adventure-travel-thrilling-experiences",
                excerpt: "From bungee jumping to shark diving, discover the world's most exhilarating adventure activities. Push your limits and create unforgettable adrenaline-pumping memories.",
                content: `<h2>For the Thrill-Seekers</h2>
                <p>If you crave adventure and excitement, these experiences will get your heart racing. From sky-high thrills to underwater adventures, here are the world's most exciting activities for adventure travelers.</p>
                
                <h3>Sky Adventures</h3>
                <h4>Skydiving in Dubai, UAE</h4>
                <p>Jump from 13,000 feet with views of the Palm Jumeirah and Dubai skyline. This is one of the world's most scenic skydiving experiences.</p>
                
                <h4>Paragliding in Interlaken, Switzerland</h4>
                <p>Soar over stunning Swiss Alps with crystal-clear lakes below. Tandem flights available for beginners.</p>
                
                <h4>Hot Air Ballooning in Cappadocia, Turkey</h4>
                <p>Float over fairy chimneys and ancient rock formations at sunrise. A surreal and magical experience.</p>
                
                <h3>Water Adventures</h3>
                <h4>Shark Cage Diving in South Africa</h4>
                <p>Come face-to-face with great white sharks off the coast of Cape Town. Safe, thrilling, and unforgettable.</p>
                
                <h4>White Water Rafting in Costa Rica</h4>
                <p>Navigate Class III and IV rapids through lush rainforest on the Pacuare River.</p>
                
                <h4>Surfing in Hawaii</h4>
                <p>Learn to surf on legendary waves at Waikiki or challenge yourself with the North Shore's big waves.</p>
                
                <h3>Land Adventures</h3>
                <h4>Hiking to Machu Picchu, Peru</h4>
                <p>Trek the famous Inca Trail through cloud forests and mountain passes to reach the ancient citadel.</p>
                
                <h4>Safari in Tanzania</h4>
                <p>Witness the Great Migration in Serengeti or track the Big Five in Ngorongoro Crater.</p>
                
                <h4>Rock Climbing in Yosemite, USA</h4>
                <p>Scale granite walls in one of the world's premier climbing destinations. Routes for all skill levels.</p>
                
                <h3>Extreme Adventures</h3>
                <h4>Bungee Jumping in New Zealand</h4>
                <p>Leap from the Kawarau Bridge where commercial bungee jumping began, or try the 134m Nevis Bungy.</p>
                
                <h4>Ice Climbing in Iceland</h4>
                <p>Climb frozen waterfalls and glacial walls in one of the world's most dramatic landscapes.</p>
                
                <h4>Volcano Boarding in Nicaragua</h4>
                <p>Speed down the active Cerro Negro volcano on a wooden board reaching speeds up to 50 mph.</p>
                
                <h2>Safety Considerations</h2>
                <ul>
                    <li>Always use licensed, reputable operators</li>
                    <li>Check safety records and equipment</li>
                    <li>Get proper travel insurance covering adventure activities</li>
                    <li>Be honest about your fitness level and experience</li>
                    <li>Follow all safety instructions carefully</li>
                    <li>Know your limits and don't be pressured into anything</li>
                </ul>
                
                <h2>Preparation Tips</h2>
                <p>Research activities thoroughly, build up fitness gradually, practice skills beforehand if possible, and pack appropriate gear. Most importantly, embrace the challenge and enjoy the adrenaline rush!</p>`,
                featuredImage: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&h=800&fit=crop",
                authorId: adminId,
                category: "Adventure",
                tags: ["adventure travel", "extreme sports", "adrenaline", "outdoor activities", "bucket list"],
                status: "published" as const,
                publishedAt: new Date("2024-12-01T10:00:00Z"),
            },
            {
                title: "Cultural Immersion: Authentic Local Experiences",
                slug: "cultural-immersion-authentic-local-experiences",
                excerpt: "Move beyond tourist attractions and truly connect with local culture. Learn how to find authentic experiences, meet locals, and gain deeper understanding of the places you visit.",
                content: `<h2>Travel Deeper, Not Just Wider</h2>
                <p>The most memorable travel experiences come from genuine cultural connections. Here's how to move beyond tourist traps and immerse yourself in authentic local culture.</p>
                
                <h3>Stay with Locals</h3>
                <p>Choose homestays, farm stays, or local guesthouses over chain hotels. Living with local families provides insights into daily life, traditions, and customs you'd never experience otherwise.</p>
                
                <h3>Learn the Language</h3>
                <p>Even basic phrases show respect and open doors to conversations. Use language apps before your trip and practice with locals. Most people appreciate the effort, even if your pronunciation isn't perfect.</p>
                
                <h3>Take Cooking Classes</h3>
                <p>Food is at the heart of culture. Take classes with local cooks, visit markets together, and learn family recipes passed down through generations.</p>
                
                <h3>Participate in Local Festivals</h3>
                <p>Time your visit with traditional celebrations, religious festivals, or cultural events. These provide incredible insights into local traditions and community values.</p>
                
                <h3>Shop at Local Markets</h3>
                <p>Skip the tourist souvenir shops. Visit neighborhood markets where locals shop. Interact with vendors, try street food, and observe daily commerce.</p>
                
                <h3>Use Public Transportation</h3>
                <p>Buses, trains, and shared taxis offer opportunities to interact with locals and see neighborhoods tourists rarely visit.</p>
                
                <h2>Authentic Experiences by Region</h2>
                
                <h3>Asia</h3>
                <ul>
                    <li>Stay in a Buddhist monastery in Thailand</li>
                    <li>Learn calligraphy in Japan</li>
                    <li>Take a yoga retreat in India</li>
                    <li>Participate in a tea ceremony in China</li>
                </ul>
                
                <h3>Europe</h3>
                <ul>
                    <li>Work on a vineyard in France</li>
                    <li>Learn flamenco in Spain</li>
                    <li>Take a pasta-making class in Italy</li>
                    <li>Visit a local sauna in Finland</li>
                </ul>
                
                <h3>Latin America</h3>
                <ul>
                    <li>Learn salsa in Cuba</li>
                    <li>Participate in a traditional temazcal ceremony in Mexico</li>
                    <li>Work on a coffee farm in Colombia</li>
                    <li>Learn tango in Argentina</li>
                </ul>
                
                <h3>Africa</h3>
                <ul>
                    <li>Visit a Maasai village in Kenya</li>
                    <li>Learn traditional drumming in Ghana</li>
                    <li>Participate in a township tour in South Africa</li>
                    <li>Stay in a Berber village in Morocco</li>
                </ul>
                
                <h2>Cultural Etiquette</h2>
                <p>Research customs before visiting. Dress appropriately for religious sites, learn greeting customs, understand tipping practices, and be mindful of photography restrictions. When in doubt, observe locals and ask permission.</p>
                
                <h2>Building Connections</h2>
                <p>Be open, curious, and respectful. Ask questions, share about your culture, and truly listen to people's stories. The relationships you build will be the most valuable souvenirs you take home.</p>`,
                featuredImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=800&fit=crop",
                authorId: marketingId,
                category: "Culture",
                tags: ["cultural travel", "local experiences", "authentic travel", "cultural immersion", "traditions"],
                status: "published" as const,
                publishedAt: new Date("2024-12-05T09:30:00Z"),
            },
            {
                title: "Photography Tips for Travel: Capture Stunning Memories",
                slug: "travel-photography-tips-stunning-memories",
                excerpt: "Transform your vacation photos from snapshots to stunning images. Learn composition, lighting, and editing techniques to capture your travels beautifully.",
                content: `<h2>Elevate Your Travel Photography</h2>
                <p>You don't need expensive equipment to take amazing travel photos. With these techniques, you can capture professional-quality images with just your smartphone or basic camera.</p>
                
                <h3>Essential Composition Techniques</h3>
                
                <h4>Rule of Thirds</h4>
                <p>Divide your frame into a 3x3 grid. Place key elements along these lines or at their intersections for more dynamic compositions.</p>
                
                <h4>Leading Lines</h4>
                <p>Use roads, rivers, fences, or architectural elements to draw viewers' eyes into your image and create depth.</p>
                
                <h4>Framing</h4>
                <p>Use natural frames like doorways, windows, or tree branches to focus attention on your subject and add context.</p>
                
                <h4>Negative Space</h4>
                <p>Don't fill every inch of your frame. Empty space can create dramatic impact and emphasize your subject.</p>
                
                <h3>Lighting is Everything</h3>
                
                <h4>Golden Hour Magic</h4>
                <p>Shoot during the hour after sunrise or before sunset for warm, soft, flattering light. This is the secret to professional-looking photos.</p>
                
                <h4>Blue Hour Drama</h4>
                <p>The 20-30 minutes after sunset create moody, atmospheric images with rich blue tones and city lights.</p>
                
                <h4>Avoid Harsh Midday Sun</h4>
                <p>Strong overhead sun creates harsh shadows and washed-out colors. If you must shoot at midday, find shade or use it for dramatic shadows.</p>
                
                <h3>Subject and Storytelling</h3>
                
                <h4>Include People</h4>
                <p>Photos with people tell better stories and create scale. Ask permission respectfully before photographing locals.</p>
                
                <h4>Capture Details</h4>
                <p>Don't just photograph landmarks. Close-ups of food, textures, street signs, and small moments tell richer stories.</p>
                
                <h4>Show Scale</h4>
                <p>Include people or familiar objects to show the size of landscapes or architecture.</p>
                
                <h3>Camera Settings for Beginners</h3>
                
                <h4>For Smartphones</h4>
                <ul>
                    <li>Clean your lens regularly</li>
                    <li>Use HDR mode for high-contrast scenes</li>
                    <li>Enable gridlines for composition</li>
                    <li>Avoid digital zoom - move closer instead</li>
                    <li>Lock focus and exposure before shooting</li>
                </ul>
                
                <h4>For DSLR/Mirrorless</h4>
                <ul>
                    <li>Shoot in RAW format for maximum editing flexibility</li>
                    <li>Use Aperture Priority mode (A/Av) for control over depth of field</li>
                    <li>Keep ISO as low as possible for cleaner images</li>
                    <li>Use a tripod for low-light and long exposures</li>
                </ul>
                
                <h3>Essential Gear</h3>
                
                <h4>Minimal Setup</h4>
                <ul>
                    <li>Phone or camera</li>
                    <li>Extra batteries and memory cards</li>
                    <li>Portable charger</li>
                    <li>Lens cleaning cloth</li>
                    <li>Simple phone tripod</li>
                </ul>
                
                <h4>Advanced Kit</h4>
                <ul>
                    <li>Camera body</li>
                    <li>Versatile zoom lens (24-70mm or 18-55mm)</li>
                    <li>Wide-angle lens for landscapes</li>
                    <li>Sturdy travel tripod</li>
                    <li>Polarizing filter for outdoor shots</li>
                </ul>
                
                <h3>Editing Tips</h3>
                
                <h4>Smartphone Apps</h4>
                <p>Snapseed, VSCO, and Adobe Lightroom Mobile offer powerful editing tools. Adjust exposure, contrast, vibrance, and sharpness subtly.</p>
                
                <h4>Desktop Software</h4>
                <p>Adobe Lightroom is industry standard. Learn basic adjustments: white balance, exposure, highlights/shadows, and clarity.</p>
                
                <h4>Editing Philosophy</h4>
                <p>Less is more. Subtle adjustments look professional. Over-editing looks amateur. Aim to enhance, not transform.</p>
                
                <h2>Photography Etiquette</h2>
                <ul>
                    <li>Always ask permission before photographing people</li>
                    <li>Respect no-photography signs and sacred spaces</li>
                    <li>Don't obstruct others or dangerous locations for photos</li>
                    <li>Be mindful of local sensitivities</li>
                    <li>Share photos with subjects when possible</li>
                </ul>
                
                <h2>Practice Makes Perfect</h2>
                <p>The best camera is the one you have with you. Practice these techniques regularly, experiment with different angles and lighting, and most importantly, don't let photography distract you from experiencing the moment. Sometimes the best memories aren't captured—they're lived.</p>`,
                featuredImage: "https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=1200&h=800&fit=crop",
                authorId: adminId,
                category: "Photography",
                tags: ["travel photography", "photography tips", "camera techniques", "photo editing", "visual storytelling"],
                status: "published" as const,
                publishedAt: new Date("2024-12-10T13:00:00Z"),
            },
        ];

        await db.insert(blogPosts).values(blogPostsData).onConflictDoNothing();
        console.log(`✓ Created ${blogPostsData.length} blog posts`);

        // Create user activity logs
        console.log("Creating user activity logs...");
        const sampleActivityLogs = [
            // Admin activities
            {
                userId: adminId,
                activityType: "login",
                description: "Admin logged in to the dashboard",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
                metadata: { success: true, method: "password" },
            },
            {
                userId: adminId,
                activityType: "user_management",
                description: "Approved property owner application for owner1@test.com",
                ipAddress: "192.168.1.1",
                metadata: { action: "approve", targetUserId: owner1Id },
            },
            {
                userId: adminId,
                activityType: "cms_update",
                description: "Updated CMS content for About Us page",
                ipAddress: "192.168.1.1",
                metadata: { pageKey: "about", action: "update" },
            },
            // Property owner activities
            {
                userId: owner1Id,
                activityType: "login",
                description: "Property owner logged in",
                ipAddress: "10.0.1.25",
                userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15",
                metadata: { success: true },
            },
            {
                userId: owner1Id,
                activityType: "property_created",
                description: "Created new property listing: Miami Beach Villa",
                ipAddress: "10.0.1.25",
                metadata: { propertyTitle: "Miami Beach Villa", propertyId: prop1Id },
            },
            {
                userId: owner1Id,
                activityType: "pricing_update",
                description: "Updated seasonal pricing for property",
                ipAddress: "10.0.1.25",
                metadata: { propertyId: prop1Id, seasonName: "Winter Peak Season" },
            },
            {
                userId: owner1Id,
                activityType: "dashboard_view",
                description: "Viewed property dashboard and analytics",
                ipAddress: "10.0.1.25",
                metadata: { section: "overview", totalProperties: 5 },
            },
            // Service provider activities
            {
                userId: provider1Id,
                activityType: "login",
                description: "Service provider logged in",
                ipAddress: "172.16.0.42",
                userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) Mobile Safari/604.1",
                metadata: { success: true },
            },
            {
                userId: provider1Id,
                activityType: "service_update",
                description: "Updated service pricing and availability",
                ipAddress: "172.16.0.42",
                metadata: { serviceName: "Premium Cleaning", hourlyRate: 65 },
            },
            {
                userId: provider1Id,
                activityType: "order_accepted",
                description: "Accepted service order #SVC-12345",
                ipAddress: "172.16.0.42",
                metadata: { orderId: "SVC-12345", serviceType: "housekeeping" },
            },
            // Client activities
            {
                userId: client1Id,
                activityType: "login",
                description: "Client logged in to account",
                ipAddress: "203.0.113.45",
                userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0",
                metadata: { success: true },
            },
            {
                userId: client1Id,
                activityType: "search",
                description: "Searched for properties in Miami, Florida",
                ipAddress: "203.0.113.45",
                metadata: { location: "Miami, FL", checkIn: "2025-01-15", guests: 4 },
            },
            {
                userId: client1Id,
                activityType: "booking_created",
                description: "Created booking for Miami Beach Villa",
                ipAddress: "203.0.113.45",
                metadata: { propertyId: prop1Id, bookingCode: "BK-001", totalAmount: 1800 },
            },
            {
                userId: client1Id,
                activityType: "favorite_added",
                description: "Added property to favorites",
                ipAddress: "203.0.113.45",
                metadata: { propertyId: prop2Id, propertyTitle: "NYC Modern Apartment" },
            },
            {
                userId: client2Id,
                activityType: "review_posted",
                description: "Posted review for completed booking",
                ipAddress: "198.51.100.10",
                metadata: { rating: 5, propertyId: prop1Id },
            },
            // Manager activities
            {
                userId: countryManagerId,
                activityType: "login",
                description: "Country manager logged in",
                ipAddress: "192.168.10.100",
                metadata: { success: true, territory: "North America" },
            },
            {
                userId: countryManagerId,
                activityType: "approval_review",
                description: "Reviewed and approved city manager application",
                ipAddress: "192.168.10.100",
                metadata: { action: "approve", managerId: cityManagerId },
            },
            {
                userId: cityManagerId,
                activityType: "report_view",
                description: "Viewed regional analytics report",
                ipAddress: "192.168.10.50",
                metadata: { territory: "Europe - Western", period: "Q4 2024" },
            },
            // System activities
            {
                userId: provider2Id,
                activityType: "profile_update",
                description: "Updated service provider profile information",
                ipAddress: "172.16.0.88",
                metadata: { fields: ["businessName", "certifications", "portfolio"] },
            },
            {
                userId: owner2Id,
                activityType: "payout_requested",
                description: "Requested payout for earnings",
                ipAddress: "10.0.1.78",
                metadata: { amount: 2500, method: "bank_transfer" },
            },
        ];

        await db.insert(userActivityLogs).values(sampleActivityLogs).onConflictDoNothing();
        console.log(`✓ Created ${sampleActivityLogs.length} activity log entries`);

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
