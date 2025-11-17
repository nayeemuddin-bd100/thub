# Overview

TravelHub is a comprehensive travel ecosystem platform for booking accommodations and curated travel services. It supports role-based access for various user types (travelers, property owners, service providers, administrators) and aims to offer a seamless user experience, integrated service management, and secure transactions. The platform's ambition is to unify traditional accommodation booking with a broader range of travel services and provide detailed analytics for administrators.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Core Technologies
- **Frontend**: React with TypeScript, TailwindCSS, Radix UI/shadcn/ui, TanStack Query, Wouter, Vite.
- **Backend**: Node.js with Express.js and TypeScript.
- **Database**: PostgreSQL (Neon serverless) with Drizzle ORM.

## Authentication & Authorization
- Custom email/password authentication using bcrypt and Express sessions.
- **Role-Based Access Control (RBAC)**: Ten distinct roles (Admin, Billing, Operation, Marketing, Property Owner, Service Provider, Client, Country Manager, City Manager, Operation Support) with specialized dashboards and granular permissions.
- An approval system governs user access, ensuring only approved users can perform certain actions or access specific parts of the platform. Pending users see an "Awaiting Approval" screen, and rejected users are denied login.

## Key Features
- **Multi-role Dashboards**: Specialized dashboards for each user role with enhanced analytics for administrators using Recharts.
- **Two-Tier Approval System**: Workflow for provider onboarding and service approval.
- **Real-time Notifications**: System-wide notifications for various events.
- **Live Chat System**: WebSocket-powered real-time messaging with WhatsApp-like features:
  - **Message Status Indicators**: Single checkmark (sent), double gray checkmarks (delivered), double blue checkmarks (read)
  - **Typing Indicators**: Real-time animated typing indicators with auto-stop after 3 seconds
  - **Online/Offline Status**: Live presence tracking showing when users are online
  - **Read Receipts**: Automatic marking of messages as delivered and read
  - **Real-time Updates**: Instant message delivery and status updates via WebSocket
- **WhatsApp Integration**: Direct WhatsApp contact and system notifications.
- **Stripe Payment Integration**: Secure payment flow with server-side validation and a payment-first confirmation process.
- **Operation Support System**: Dedicated support contact feature for the `operation_support` role.
- **CMS Content Management**: Admin-only system for managing informational pages with SEO support, including full CRUD, rich editing, and publish/unpublish toggles.
- **Seasonal Pricing System**: Property owners can manage seasonal pricing.
- **Activity Logging System**: Tracks significant user actions for audit trails and monitoring.
- **Territory Management**: Hierarchical system (Region → Country → City) for geographic organization and manager assignment.
- **Provider-Service Category Associations**: Many-to-many relationship allowing service providers to offer multiple service categories with a primary service indicator.

## Payment Flow
- Bookings start with `status='pending_payment'` and `paymentStatus='pending'`.
- Confirmation occurs only after successful Stripe payment verification, preventing orphaned orders.
- Stripe webhooks handle payment status updates (`payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`) and trigger notifications.

# External Dependencies

- **Database**: Neon (PostgreSQL serverless).
- **Payment Processing**: Stripe.
- **Communication**: Twilio (for WhatsApp integration and SendGrid for emails).
- **File Management**: Uppy (file uploads), AWS S3 (media storage).
- **UI/UX Libraries**: Radix UI, Lucide React, TailwindCSS, Recharts.
- **Development Tools**: TypeScript, Drizzle Kit, ESBuild.

# Production Deployment (Coolify)

## WebSocket Configuration

The real-time chat features (typing indicators, online/offline status, message delivery) use WebSocket connections (`/ws` path). For production deployment on Coolify:

### Required Environment Variables
- `SESSION_SECRET`: Must be set to a secure random string (used for session cookie signing and WebSocket authentication)
- All other environment variables from development (database URL, Stripe keys, etc.)

### Reverse Proxy Configuration
WebSocket connections require special proxy settings. If using **nginx** in Coolify, add this to your site configuration:

```nginx
location /ws {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 86400;
}
```

### Testing WebSocket Connection
After deployment, check server logs for:
- `[WebSocket] New connection attempt from: <IP>`
- `[WebSocket] User <userId> authenticated successfully`
- `[WebSocket] Broadcasting online status for user <userId>`

If authentication fails, verify:
1. `SESSION_SECRET` environment variable matches between development and production
2. Session cookies are being sent with WebSocket upgrade requests
3. Reverse proxy is configured to pass WebSocket upgrade headers

# Recent Changes

## November 17, 2025 - Multi-Currency System with Admin Control Panel
- **Comprehensive Multi-Currency Support**: Added complete multi-currency functionality across the platform
  - Currency conversion service using open.er-api.com API with rate caching (1-hour expiry)
  - Support for 20 major currencies (USD, EUR, GBP, JPY, CNY, AUD, CAD, CHF, INR, MXN, BRL, ZAR, KRW, SGD, NZD, HKD, NOK, SEK, DKK, AED)
  - Real-time currency conversion for all prices throughout the platform
  - User preference storage for selected currency
- **Currency Selector Component**: Added to header (desktop and mobile)
  - Displays current currency with symbol
  - Dropdown list of available currencies with flags and symbols
  - Persists user preference to database and localStorage
- **Admin Currency Control Panel**: New admin dashboard section for currency management
  - Located in Admin Dashboard > Currency Settings sidebar menu
  - Initialize button to set up all currencies with default settings
  - Toggle switches to enable/disable specific currencies
  - Real-time updates across entire platform when currencies are toggled
  - Changes immediately reflected in currency selector, bookings, services, and payments
- **Database Schema Updates**: Added currency support tables and fields
  - New `currency_settings` table for admin-controlled currency availability
  - Added currency fields to users, properties, bookings, and serviceOrders tables
  - All currency codes stored as VARCHAR(3) for ISO standard compatibility
- **Currency Context Provider**: React context for managing currency state
  - Fetches enabled currencies from API (5-minute cache for instant admin updates)
  - Provides formatPrice() and convertPrice() functions
  - Automatic currency preference sync for logged-in users
- **API Endpoints**: Full currency management API
  - Public: GET /api/currencies/enabled, GET /api/currencies/rates
  - Admin: POST /api/admin/currencies/settings/init, GET /api/admin/currencies/settings, PATCH /api/admin/currencies/settings/:code
  - User: PATCH /api/user/currency
- **Platform-wide Integration**: Currency conversion applied to:
  - Property cards (pricePerNight)
  - Service provider cards (hourlyRate, fixedRate)
  - Booking confirmation pages
  - Payment flows
  - All price displays throughout the application

## November 16, 2025 - Mobile Responsiveness Improvements
- **Header Component**: Added comprehensive mobile navigation
  - Mobile menu with hamburger icon using Sheet component
  - Shows on screens <768px with full search, navigation, and user profile
  - Responsive text sizing (text-lg sm:text-xl) and button layouts
- **Manager Dashboards**: Enhanced mobile layouts
  - Country Manager Dashboard: Responsive header (flex-col sm:flex-row), flexible sizing
  - City Manager Dashboard: Responsive header with stacking layout
  - Stats cards use responsive grids (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- **Messages Page**: Already mobile-optimized
  - Conversation list/chat view toggle on mobile (<768px)
  - Back button for navigation between views
- **Tables**: All tables wrapped in responsive containers with horizontal scrolling
- **General Mobile Enhancements**: Reduced padding on mobile (py-4 sm:py-8), full-width buttons on small screens