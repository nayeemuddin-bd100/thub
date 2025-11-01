# Overview

TravelHub is a comprehensive travel ecosystem platform that allows users to book accommodations and curated travel services. It features role-based access for travelers, property owners, service providers, and administrators. The platform emphasizes a seamless user experience, integrated service management, and secure transactions, aiming to evolve traditional accommodation booking services into a unified travel solution.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: TailwindCSS with CSS variables for theming (light/dark mode support)
- **UI Components**: Radix UI primitives with shadcn/ui for consistent and accessible components
- **State Management**: TanStack Query for server state management, caching, and error handling
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds

## Backend Architecture
- **Runtime**: Node.js with Express.js for RESTful API endpoints
- **Language**: TypeScript throughout the stack
- **Authentication**: OpenID Connect (OIDC) with Replit Auth using Passport.js
- **Session Management**: Express sessions with PostgreSQL store
- **API Structure**: RESTful endpoints organized by resource type

## Database Design
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe operations and schema management
- **Schema**: Comprehensive relational model with tables for users, properties, services, bookings, management, and social features.
- **Dynamic Data**: All features use real database operations; no static or placeholder data.

## Authentication & Authorization
- **Strategy**: Custom email/password authentication with bcrypt hashing
- **Session Management**: Express sessions with `connect-pg-simple` for PostgreSQL session storage
- **Role-based Access Control (RBAC)**: Five distinct user roles (Admin, Property Owner, Service Provider, Client, Country Manager) with specialized dashboards
- **Session Security**: HTTP-only cookies with secure flags and PostgreSQL-backed sessions
- **Public Browsing Policy**: Users can browse public pages without logging in; authentication is required only for transactional operations (bookings, orders, etc.).

## Unique Features
- **Base44 Encoding**: Custom encoding for human-readable booking codes.
- **Multi-role Dashboards**: Specialized dashboards for each user role.
- **Granular Task Management**: Predefined maid service tasks with client selection and real-time completion tracking.
- **Job Assignment Workflow**: Country managers assign service providers to jobs with automated acceptance/rejection.
- **Real-time Notifications**: System-wide notifications for job assignments, acceptances, rejections, and task completions.
- **Stripe Payment Integration**: Complete payment flow with secure intent creation, UI, and status updates.
- **Server-side Price Validation**: Critical security feature to recalculate all prices from authoritative database sources, ignore client-supplied pricing, and validate items belong to the specified provider, preventing tampering and injection attacks.
- **Immediate Payment Flow**: Service orders are auto-confirmed upon creation to enable immediate payment, eliminating wait time for provider confirmation.

## Payment Flow
### Service Order Payment
1. **Order Creation**: Client selects services and places order → Order created with status='confirmed' (auto-confirmed for immediate payment)
2. **Automatic Redirect**: After successful order placement, client automatically redirected to payment page (`/pay-service-order/:orderId`) after 1.5 second delay
3. **Payment Processing**: Payment page loads Stripe Elements for secure card input, validates order is confirmed and unpaid
4. **Payment Completion**: Upon successful payment, order's paymentStatus updated to 'paid'
5. **Order Fulfillment**: Provider delivers service on scheduled date

### Property Booking Payment
1. **Booking Creation**: Client selects property and dates → Booking created with status='confirmed' (auto-confirmed for immediate payment)
2. **Automatic Redirect**: After successful booking, client automatically redirected to payment page (`/pay-booking/:bookingId`) after 1.5 second delay
3. **Payment Processing**: Payment page loads Stripe Elements for secure card input, validates booking is confirmed and unpaid
4. **Payment Completion**: Upon successful payment, booking's paymentStatus updated to 'paid'
5. **Property Access**: Client receives booking confirmation with property access details

### Key Implementation Details
- Both service orders and property bookings created with `status='confirmed'` immediately (no provider/owner pre-approval needed)
- Payment requires: status = 'confirmed' AND paymentStatus = 'pending'
- Redirect includes booking/order code in success toast: "Your booking code is XXX. Redirecting to payment..."
- Payment pages include loading states, error handling, and security notices
- Stripe payment intents created server-side for security
- Payment verification completed server-side before updating payment status

# External Dependencies

## Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit OIDC provider
- **WebSocket**: Native WebSocket implementation

## Payment Processing
- **Stripe**: Payment processing integrated with React Stripe.js components.

## File Management
- **Uppy**: File upload handling, including AWS S3 integration.
- **Media Storage**: AWS S3 for property images and user content.

## Development Tools
- **TypeScript**: Full-stack type safety.
- **Drizzle Kit**: Database migration and schema management.
- **ESBuild**: Fast bundling.

## UI/UX Libraries
- **Radix UI**: Accessible, unstyled UI primitives.
- **Lucide React**: Icon library.
- **TailwindCSS**: Utility-first CSS framework.