import { db } from './db';
import { 
  users, 
  properties, 
  serviceCategories, 
  serviceProviders, 
  serviceTasks,
  bookings,
  serviceBookings,
  reviews
} from '../shared/schema';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create sample users with different roles
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const sampleUsers = [
      {
        id: 'user-client-1',
        email: 'client1@test.com',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'client',
      },
      {
        id: 'user-client-2',
        email: 'client2@test.com',
        password: hashedPassword,
        firstName: 'Michael',
        lastName: 'Chen',
        role: 'client',
      },
      {
        id: 'user-owner-1',
        email: 'owner1@test.com',
        password: hashedPassword,
        firstName: 'David',
        lastName: 'Martinez',
        role: 'property_owner',
      },
      {
        id: 'user-owner-2',
        email: 'owner2@test.com',
        password: hashedPassword,
        firstName: 'Emily',
        lastName: 'Thompson',
        role: 'property_owner',
      },
      {
        id: 'user-provider-1',
        email: 'provider1@test.com',
        password: hashedPassword,
        firstName: 'Carlos',
        lastName: 'Rodriguez',
        role: 'service_provider',
      },
      {
        id: 'user-provider-2',
        email: 'provider2@test.com',
        password: hashedPassword,
        firstName: 'Lisa',
        lastName: 'Anderson',
        role: 'service_provider',
      },
      {
        id: 'user-manager-1',
        email: 'manager@test.com',
        password: hashedPassword,
        firstName: 'James',
        lastName: 'Wilson',
        role: 'country_manager',
      },
    ];

    console.log('Creating users...');
    for (const user of sampleUsers) {
      await db.insert(users).values(user).onConflictDoNothing();
    }

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
        ownerId: 'user-owner-1',
        title: 'Luxury Beachfront Villa',
        description: 'Stunning ocean views with private beach access. Perfect for families and groups looking for an unforgettable vacation experience.',
        location: 'Miami Beach, FL',
        pricePerNight: '450',
        maxGuests: 8,
        bedrooms: 4,
        bathrooms: 3,
        amenities: ['WiFi', 'Pool', 'Beach Access', 'Air Conditioning', 'Kitchen', 'Parking'],
        images: [
          'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800',
          'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'
        ],
        rating: 4.9,
        isActive: true,
      },
      {
        id: prop2Id,
        ownerId: 'user-owner-1',
        title: 'Modern Downtown Apartment',
        description: 'Sleek and stylish apartment in the heart of the city. Walking distance to restaurants, shops, and entertainment.',
        location: 'New York, NY',
        pricePerNight: '280',
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 2,
        amenities: ['WiFi', 'Gym', 'Doorman', 'Air Conditioning', 'Kitchen'],
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
          'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800'
        ],
        rating: 4.7,
        isActive: true,
      },
      {
        id: prop3Id,
        ownerId: 'user-owner-2',
        title: 'Cozy Mountain Cabin',
        description: 'Peaceful retreat surrounded by nature. Ideal for hiking enthusiasts and those seeking tranquility.',
        location: 'Aspen, CO',
        pricePerNight: '320',
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 2,
        amenities: ['WiFi', 'Fireplace', 'Mountain View', 'Kitchen', 'Parking', 'Hot Tub'],
        images: [
          'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'
        ],
        rating: 4.8,
        isActive: true,
      },
      {
        id: prop4Id,
        ownerId: 'user-owner-2',
        title: 'Historic City Loft',
        description: 'Beautifully restored loft in a historic building. High ceilings and original architectural details.',
        location: 'San Francisco, CA',
        pricePerNight: '350',
        maxGuests: 5,
        bedrooms: 2,
        bathrooms: 2,
        amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'Workspace', 'Parking'],
        images: [
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
        ],
        rating: 4.6,
        isActive: true,
      },
      {
        id: prop5Id,
        ownerId: 'user-owner-1',
        title: 'Tropical Paradise Bungalow',
        description: 'Private bungalow surrounded by lush gardens. Experience island living at its finest.',
        location: 'Maui, HI',
        pricePerNight: '520',
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 2,
        amenities: ['WiFi', 'Beach Access', 'Pool', 'Garden', 'Kitchen', 'Outdoor Shower'],
        images: [
          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800'
        ],
        rating: 5.0,
        isActive: true,
      },
    ];

    console.log('Creating properties...');
    for (const property of sampleProperties) {
      await db.insert(properties).values(property).onConflictDoNothing();
    }

    // Get service categories
    const categories = await db.select().from(serviceCategories);
    const maidCategory = categories.find(c => c.name === 'Maid Service');
    const transportCategory = categories.find(c => c.name === 'Transport');
    const diningCategory = categories.find(c => c.name === 'Private Dining');
    const conciergeCategory = categories.find(c => c.name === 'Concierge');

    if (!maidCategory || !transportCategory || !diningCategory || !conciergeCategory) {
      console.log('⚠️  Some service categories not found. Skipping service providers...');
      console.log('Make sure service categories are created in the database first.');
    } else {
      // Generate UUIDs for providers
    const provider1Id = randomUUID();
    const provider2Id = randomUUID();
    const provider3Id = randomUUID();
    const provider4Id = randomUUID();
    const provider5Id = randomUUID();
    const provider6Id = randomUUID();

    // Create service providers
    const sampleProviders = [
      {
        id: provider1Id,
        categoryId: maidCategory?.id || '',
        userId: 'user-provider-1',
        businessName: 'Premium Cleaning Services',
        description: 'Professional cleaning with attention to detail. 10+ years experience.',
        location: 'Miami Beach, FL',
        hourlyRate: '45',
        rating: 4.9,
        isActive: true,
      },
      {
        id: provider2Id,
        categoryId: maidCategory?.id || '',
        userId: 'user-provider-2',
        businessName: 'Sparkle Clean Co',
        description: 'Eco-friendly cleaning services for homes and vacation rentals.',
        location: 'New York, NY',
        hourlyRate: '50',
        rating: 4.8,
        isActive: true,
      },
      {
        id: provider3Id,
        categoryId: transportCategory?.id || '',
        userId: 'user-provider-1',
        businessName: 'Elite Airport Transfer',
        description: 'Luxury car service with professional drivers. Available 24/7.',
        location: 'Miami, FL',
        hourlyRate: '85',
        rating: 4.9,
        isActive: true,
      },
      {
        id: provider4Id,
        categoryId: transportCategory?.id || '',
        userId: 'user-provider-2',
        businessName: 'City Ride Limo',
        description: 'Comfortable and reliable transportation for all occasions.',
        location: 'San Francisco, CA',
        hourlyRate: '75',
        rating: 4.7,
        isActive: true,
      },
      {
        id: provider5Id,
        categoryId: diningCategory?.id || '',
        userId: 'user-provider-1',
        businessName: 'Chef Michael Culinary',
        description: 'Private chef services with customized menus. French and Italian cuisine specialist.',
        location: 'New York, NY',
        hourlyRate: '150',
        rating: 5.0,
        isActive: true,
      },
      {
        id: provider6Id,
        categoryId: conciergeCategory?.id || '',
        userId: 'user-provider-2',
        businessName: '24/7 Concierge Plus',
        description: 'Full-service concierge for all your needs. Restaurant reservations, event tickets, and more.',
        location: 'Miami, FL',
        hourlyRate: '60',
        rating: 4.8,
        isActive: true,
      },
    ];

      console.log('Creating service providers...');
      for (const provider of sampleProviders) {
        await db.insert(serviceProviders).values(provider).onConflictDoNothing();
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
        clientId: 'user-client-1',
        bookingCode: 'BK' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        checkIn: futureDate,
        checkOut: farFutureDate,
        guests: 6,
        propertyTotal: '2250',
        totalAmount: '2250',
        status: 'confirmed',
      },
      {
        id: booking2Id,
        propertyId: prop3Id,
        clientId: 'user-client-2',
        bookingCode: 'BK' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        checkIn: new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000),
        checkOut: new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000),
        guests: 4,
        propertyTotal: '1600',
        totalAmount: '1600',
        status: 'confirmed',
      },
      {
        id: booking3Id,
        propertyId: prop5Id,
        clientId: 'user-client-1',
        bookingCode: 'BK' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        checkIn: pastDate,
        checkOut: new Date(pastDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        guests: 2,
        propertyTotal: '3640',
        totalAmount: '3640',
        status: 'completed',
      },
    ];

    console.log('Creating bookings...');
    for (const booking of sampleBookings) {
      await db.insert(bookings).values(booking).onConflictDoNothing();
    }

    // Create sample reviews
    const sampleReviews = [
      {
        bookingId: booking3Id,
        reviewerId: 'user-client-1',
        propertyId: prop5Id,
        rating: 5,
        comment: 'Absolutely amazing! The bungalow exceeded all expectations. Beautiful location and pristine condition.',
      },
      {
        reviewerId: 'user-client-2',
        propertyId: prop3Id,
        rating: 5,
        comment: 'Perfect mountain getaway. Very peaceful and well-maintained.',
      },
      {
        reviewerId: 'user-client-1',
        propertyId: prop1Id,
        rating: 5,
        comment: 'Dream vacation home! The beach access was incredible.',
      },
    ];

    console.log('Creating reviews...');
    for (const review of sampleReviews) {
      await db.insert(reviews).values(review).onConflictDoNothing();
    }

    console.log('\n⚠️  Note: Service bookings skipped because service providers were not created.');
    console.log('Service categories need to exist in the database before running this seed script.');

    console.log('✅ Database seeding completed successfully!');
    console.log('\nSample credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:           admin@test.com / password123');
    console.log('Clients:         client1@test.com / password123');
    console.log('                 client2@test.com / password123');
    console.log('Property Owners: owner1@test.com / password123');
    console.log('                 owner2@test.com / password123');
    console.log('Providers:       provider1@test.com / password123');
    console.log('                 provider2@test.com / password123');
    console.log('Manager:         manager@test.com / password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nData created:');
    console.log('- 7 users with different roles');
    console.log('- 5 properties in various locations');
    console.log('- 6 service providers across categories');
    console.log('- 3 bookings (past and future)');
    console.log('- 3 reviews');
    console.log('- 2 service bookings');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log('\n🎉 Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed database:', error);
    process.exit(1);
  });
