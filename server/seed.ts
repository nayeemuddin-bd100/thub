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
    cmsContent,
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
        await db.delete(serviceProviders);
        await db.delete(properties);
        await db.delete(serviceCategories);
        await db.delete(promotionalCodes);
        await db.delete(territories);
        await db.delete(platformSettings);
        await db.delete(emailTemplates);
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
                isPublished: true,
                updatedBy: adminId,
            },
        ];

        await db.insert(cmsContent).values(cmsPages).onConflictDoNothing();
        console.log(`✓ Created ${cmsPages.length} CMS content pages`);

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
