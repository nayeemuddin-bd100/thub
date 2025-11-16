# Overview

TravelHub is a comprehensive travel ecosystem platform for booking accommodations and curated travel services. It supports role-based access for various user types (travelers, property owners, service providers, administrators) and aims to offer a seamless user experience, integrated service management, and secure transactions. The platform's ambition is to unify traditional accommodation booking with a broader range of travel services.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Core Technologies
- **Frontend**: React with TypeScript, TailwindCSS (for styling), Radix UI/shadcn/ui (for components), TanStack Query (state management), Wouter (routing), Vite (build tool).
- **Backend**: Node.js with Express.js and TypeScript.
- **Database**: PostgreSQL (Neon serverless) with Drizzle ORM.

## Authentication & Authorization
- Custom email/password authentication using bcrypt for hashing and Express sessions with PostgreSQL store.
- **Role-Based Access Control (RBAC)**: Ten distinct roles (Admin, Billing, Operation, Marketing, Property Owner, Service Provider, Client, Country Manager, City Manager, Operation Support) with specialized dashboards and granular permissions.
- Public browsing is allowed; authentication is required for transactional operations.

### Approval System (November 16, 2025)
- **User Status**: All users have a status field: `approved`, `pending`, or `rejected`
- **Admin Staff Creation**: Admin can create internal role accounts (Billing, Operation, Marketing, Accounts, Country Manager) with auto-generated credentials sent via Twilio SendGrid
- **Work With Us Registration**: City Managers, Hosts, and Service Providers register via `/work-with-us` page with status=pending
- **Approval Workflow**:
  - Country Managers approve City Managers
  - City Managers approve Hosts (Property Owners) and Service Providers
  - Regular clients register with auto-approved status
- **Security Enforcement**:
  - `requireApprovedUser` middleware protects all approval and admin endpoints
  - Pending users can log in but see "Awaiting Approval" screen in dashboard
  - Rejected users cannot log in (403 error)
  - Work-with-us registration does NOT auto-login users (they must wait for approval, then login manually)
  - Only approved users with proper roles can approve others or create staff accounts

## Key Features
- **Multi-role Dashboards**: Specialized dashboards for each user role (e.g., Billing, Operation, Marketing, City Manager).
- **Enhanced Dashboard Analytics**: Comprehensive admin dashboard with interactive charts, revenue trends, booking analytics, and real-time activity monitoring using Recharts (November 16, 2025).
- **Two-Tier Approval System**: Workflow for provider onboarding and service approval by managers/admins.
- **Real-time Notifications**: System-wide notifications for job assignments, approvals, and task completions.
- **Live Chat System**: WebSocket-powered real-time messaging between users with conversation management and unread message tracking.
- **WhatsApp Integration**: Direct WhatsApp contact for service providers and system notifications via Twilio.
- **Stripe Payment Integration**: Secure payment flow with server-side price validation and a payment-first confirmation process for orders and bookings.
- **Operation Support System**: Dedicated support contact feature with a protected dashboard for the `operation_support` role, ensuring a single support user.
- **CMS Content Management**: Admin-only content management system for managing informational pages with SEO support (November 16, 2025).
- **Seasonal Pricing System**: Property owners can manage seasonal pricing for their properties with comprehensive date range and pricing controls (November 16, 2025).
- **Activity Logging System**: Comprehensive user activity tracking for audit trails and system monitoring (November 16, 2025).
- **Territory Management**: Hierarchical territory system with regions, countries, and cities for geographic organization (November 16, 2025).

## CMS Content Management System (November 16, 2025)
- **Admin-Only Access**: CMS content management is restricted to administrators via the Admin Dashboard
- **Managed Pages**: 10 informational pages (About, Careers, Press, Help, Safety, Cancellation Policy, Contact, Resources, Community, Sitemap)
- **Features**:
  - Full CRUD operations (Create, Read, Update, Delete)
  - Rich content editing with title and body content
  - SEO metadata support (metaDescription, metaKeywords, metaTitle)
  - Publish/unpublish toggle for content visibility
  - Preview functionality before publishing
  - Page key system for unique page identification
- **API Routes**: `/api/cms-content` endpoints (GET all, GET by pageKey, POST create, PATCH update, DELETE)
- **Access**: Available via Admin Dashboard at `/admin` as a navigation menu item "CMS Content"
- **Navigation Structure**: All settings and management features (CMS Content, Platform Settings, Associations, Promo Codes, Cancellations, Territories, Email Templates, Activity Logs, Staff Management) are accessible as menu items in the Admin Dashboard sidebar
- **Security**: All API endpoints protected with `requireApprovedUser` middleware and admin role checks

## Payment Flow
- Services and bookings are initially created with `status='pending_payment'` and `paymentStatus='pending'`.
- Confirmation (`status='confirmed'`) only occurs after successful Stripe payment verification, preventing orphaned orders.
- Server-side payment intent creation and validation are crucial for security.

### Stripe Webhook Integration
- **Location**: `server/index.ts` (BEFORE express.json() middleware)
- **Endpoint**: POST `/api/webhooks/stripe`
- **Security**: Requires STRIPE_WEBHOOK_SECRET for signature verification; rejects unauthenticated webhooks
- **Events Handled**:
  - `payment_intent.succeeded`: Updates payment status to "paid", order status to "confirmed", sends notifications to client and provider
  - `payment_intent.payment_failed`: Sends failure notification to client
  - `charge.refunded`: Updates payment status to "refunded", sends refund notification
- **Critical Implementation**: Uses `express.raw()` middleware for raw body access (required for signature verification)

## Enhanced Dashboard Analytics (November 16, 2025)

### Overview
The Admin Dashboard now features comprehensive analytics and data visualization using Recharts library to provide insights into platform performance and user activity.

### Components
1. **EnhancedOverview Component** (`client/src/components/admin/EnhancedOverview.tsx`)
   - Main analytics dashboard component
   - Displays real-time statistics and trends
   - Fully responsive design with loading states

2. **Stats Cards** (4 gradient cards)
   - **Total Users**: Shows user count with growth trend
   - **Properties**: Displays property listings with trend
   - **Service Providers**: Provider count with growth indicator
   - **Total Revenue**: Aggregated revenue with currency formatting

3. **Data Visualizations**
   - **Monthly Revenue Trend** (Area Chart): 6-month revenue history with gradient fill
   - **Booking Trends** (Line Chart): Booking patterns over 6 months
   - **User Role Distribution** (Pie Chart): Visual breakdown of user roles across platform
   - **Top Performing Properties**: Ranked list showing top 5 properties by revenue and bookings
   - **Recent Activity**: Timeline of last 15 user activities with timestamps

### API Endpoints
- **GET `/api/admin/stats`**: Basic statistics (totalUsers, totalProperties, totalServiceProviders, totalBookings)
- **GET `/api/admin/dashboard-stats`**: Enhanced statistics including:
  - All basic stats
  - totalRevenue (from completed bookings)
  - monthlyRevenue[] (last 6 months with month/revenue)
  - bookingTrends[] (last 6 months with month/bookings)
  - userRoleDistribution[] (role/count for all roles)
  - recentActivities[] (last 15 activities with user info)
  - topProperties[] (top 5 by revenue with booking counts)

### Technical Implementation
- Uses PostgreSQL aggregate queries with TO_CHAR for month formatting
- Joins userActivityLogs with users table for activity details
- Calculates revenue using CAST to DECIMAL for precision
- All queries optimized with proper WHERE clauses and ORDER BY
- Protected with requireAuth and admin role verification

### Access
- Navigate to Admin Dashboard at `/admin`
- Select "Overview" section (default view)
- All charts and data load automatically via react-query

## Activity Logging System (November 16, 2025)

### Purpose
Tracks all significant user actions for audit trails, security monitoring, and analytics.

### Schema
Table: `user_activity_logs`
- `id`: UUID primary key
- `userId`: Reference to users table (varchar to match production)
- `activityType`: Categorized action type (login, logout, create, update, delete, view, etc.)
- `description`: Human-readable description of the action
- `metadata`: JSON object for additional context (optional)
- `ipAddress`: User's IP address (optional)
- `userAgent`: Browser/device information (optional)
- `createdAt`: Timestamp of activity

### Activity Types
- `login`: User authentication events
- `property_creation`: New property listings
- `booking`: Reservation activities
- `service_order`: Service order placements
- `message`: Communication events
- `profile_update`: User profile modifications
- `role_change`: Role updates and approvals

### Seeded Data
- 20 realistic activity log entries demonstrating various user actions
- Activities span across multiple users and roles
- Includes timestamps, IP addresses, and user agents for authenticity

### Integration
- Displayed in Admin Dashboard's "Recent Activity" section
- Shows last 15 activities with user information
- Real-time updates via dashboard-stats API

## Territory Management System (November 16, 2025)

### Purpose
Hierarchical geographic organization for properties, services, and user management.

### Schema
Table: `territories`
- Three-tier hierarchy: Region → Country → City
- Each level can have a manager (countryManagerId, cityManagerId)
- Properties and services associated with specific territories
- Enables region-based filtering and management

### Seeded Territories
1. **USA East Coast Region**
   - Country: United States
   - Cities: New York City, Boston, Miami
   
2. **USA West Coast Region**
   - Country: United States
   - Cities: Los Angeles, San Francisco, Seattle

3. **Europe Western Region**
   - Country: United Kingdom
   - Cities: London
   - Country: France
   - Cities: Paris

4. **Asia Pacific Region**
   - Country: Japan
   - Cities: Tokyo
   - Country: Australia
   - Cities: Sydney

5. **Latin America Region**
   - Country: Mexico
   - Cities: Cancun, Mexico City

### Features
- Hierarchical territory structure for geographic organization
- Manager assignment at country and city levels
- Integration with properties and service providers
- Regional filtering and reporting capabilities

## Provider-Service Category Associations (November 16, 2025)

### Purpose
Many-to-many relationship allowing service providers to offer multiple service categories.

### Schema
Junction Table: `providerServiceCategories`
- `serviceProviderId`: Reference to service provider
- `categoryId`: Reference to service category
- `isPrimary`: Boolean flag indicating primary service (true for main service, false for additional)

### Implementation
- Single provider can offer multiple services (e.g., Maid Service + Transport)
- isPrimary flag highlights provider's main expertise
- Enables better search filtering and provider recommendations
- Improves service discovery for users

### Seeded Associations
Multiple providers configured with diverse service offerings:
- Provider 1: Maid Service (primary) + Transport (secondary)
- Provider 2: Maid Service (primary)
- Provider 3: Transport (primary)
- Provider 4: Transport (primary)
- Provider 5: Private Dining (primary)
- Provider 6: Concierge (primary)

## Comprehensive Seed Data (November 16, 2025)

### Database State
The development database is fully seeded with realistic test data for all major features:

#### Users (16 total)
- **Admin Roles**: admin, billing, operation, marketing (4 users)
- **Managers**: country_manager, city_manager (2 users)
- **Clients**: 3 test clients with bookings
- **Property Owners**: 3 hosts with properties
- **Service Providers**: 3 providers with multiple services
- **Support**: 1 operation_support user

#### Properties (15 total)
- International locations across USA, Europe, Asia, Latin America
- Various property types (villas, apartments, hotels, resorts)
- Different price ranges and capacities
- Seasonal pricing configured
- Multiple images and amenities

#### Service Infrastructure
- 10 service categories (Maid, Transport, Dining, Concierge, etc.)
- 6 service providers with diverse offerings
- Provider-service associations via junction table
- Service tasks and packages configured

#### Bookings and Transactions
- Multiple bookings in various statuses (pending, confirmed, completed, cancelled)
- Realistic check-in/check-out dates
- Payment records linked to bookings
- Service orders with confirmed status

#### Communications
- Sample messages between users demonstrating role-based messaging
- Notifications for various events
- Activity logs showing user interactions

#### Content and Settings
- 10 CMS pages (About, Careers, Help, Contact, etc.)
- 3 promotional codes (WELCOME10, SUMMER25, LOYAL50)
- Platform settings configured

### Test Credentials
All accounts use password: `password123`

**Admin Access:**
- admin@test.com
- billing@test.com
- operation@test.com
- marketing@test.com

**Manager Access:**
- country_manager@test.com
- city_manager@test.com

**User Access:**
- client1@test.com, client2@test.com, client3@test.com (clients)
- host1@test.com, host2@test.com, host3@test.com (property owners)
- provider1@test.com, provider2@test.com, provider3@test.com (service providers)

**Support Access:**
- operation_support@test.com

### Reseeding
To reset the database with fresh seed data:
```bash
npm run db:seed
```

This will:
1. Clean all existing data
2. Create users across all roles
3. Generate properties with realistic details
4. Set up service infrastructure
5. Create bookings and transactions
6. Add messages and notifications
7. Populate CMS content
8. Add activity logs

# External Dependencies

- **Database**: Neon (PostgreSQL serverless).
- **Payment Processing**: Stripe.
- **Communication**: Twilio (for WhatsApp integration).
- **File Management**: Uppy (file uploads), AWS S3 (media storage).
- **Development Tools**: TypeScript, Drizzle Kit, ESBuild.
- **UI/UX Libraries**: Radix UI, Lucide React, TailwindCSS.