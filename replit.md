# Overview

TravelHub is a comprehensive travel ecosystem platform that serves as an evolution of traditional accommodation booking services. The application enables users to book accommodations and curated travel services through a unified platform, featuring role-based access for travelers, property owners, service providers, and administrators. Built with modern web technologies, TravelHub emphasizes seamless user experience, integrated service management, and secure transactions.

# User Preferences

Preferred communication style: Simple, everyday language.

# Critical Requirements

## 🚨 NEVER REMOVE: Public Browsing Policy
**CRITICAL REQUIREMENT - DO NOT MODIFY OR REMOVE IN FUTURE IMPLEMENTATIONS**

Users MUST be able to browse the website without logging in. Authentication is ONLY required when users attempt to place orders or bookings.

**Public Access (No Login Required):**
- Landing page (`/`)
- Browse all properties (`/properties`)
- View property details (`/properties/:id`)
- View service providers and services
- Browse service categories
- Read reviews and ratings

**Authentication Required:**
- Creating bookings (`POST /api/bookings`)
- Ordering services
- Applying to become a service provider
- Accessing user dashboard (`/dashboard`)
- Posting reviews
- Messaging
- All admin functions

**Implementation:**
- Frontend: Public pages do NOT enforce authentication checks
- Backend: All POST/PUT/DELETE endpoints for bookings, orders, and user actions use `requireAuth` middleware
- User Experience: When unauthenticated users click "Book Now", they are redirected to login with a friendly message explaining they need to log in to complete the booking

This design ensures maximum accessibility for browsing while protecting transactional operations.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript for type safety and enhanced development experience
- **Styling**: TailwindCSS with CSS variables for theming, supporting both light and dark modes
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible interface components
- **State Management**: TanStack Query (React Query) for server state management with built-in caching, synchronization, and error handling
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript throughout the entire stack for consistency and type safety
- **Authentication**: OpenID Connect (OIDC) integration with Replit Auth using Passport.js strategy
- **Session Management**: Express sessions with PostgreSQL store for persistent user sessions
- **API Structure**: RESTful endpoints organized by resource type (properties, bookings, services, reviews)

## Database Design
- **Primary Database**: PostgreSQL with Neon serverless hosting for scalability
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Schema**: Comprehensive relational model with 16 tables:
  - **Core**: users, sessions
  - **Properties**: properties, property_services
  - **Services**: service_categories, service_providers, service_tasks
  - **Bookings**: bookings, service_bookings, service_task_assignments
  - **Management**: job_assignments, notifications, payments
  - **Social**: reviews, messages
- **Connection**: Connection pooling with @neondatabase/serverless for optimal performance
- **Dynamic Data**: All features use real database operations - NO static or placeholder data

## Authentication & Authorization
- **Strategy**: Custom email/password authentication with bcrypt hashing
- **Session Management**: Express sessions with connect-pg-simple for PostgreSQL session storage
- **Role-based Access Control (RBAC)**: Five distinct user roles with specialized dashboards:
  - **Admin**: Platform-wide management, user administration, statistics
  - **Property Owner**: Property listing management, booking oversight
  - **Service Provider**: Service delivery, task completion, job acceptance/rejection
  - **Client**: Property booking, service ordering, task monitoring
  - **Country Manager**: Service provider assignment, operation monitoring, alert management
- **Session Security**: HTTP-only cookies with secure flags and PostgreSQL-backed sessions
- **User Management**: Complete user lifecycle with role assignment capabilities

## Unique Features
- **Base44 Encoding**: Custom encoding system for generating human-readable booking codes using a 44-character alphabet
- **Multi-role Dashboards**: Separate, specialized dashboards for each user role (Admin, Client, Property Owner, Service Provider, Country Manager)
- **Granular Task Management**: 36 predefined maid service tasks (bedroom, kitchen, bathroom, living room, deep clean, maintenance checks)
- **Service Task Selection**: Clients can select specific tasks for each service date with real-time completion tracking
- **Job Assignment Workflow**: Country managers assign service providers to jobs with automated acceptance/rejection flow
- **Real-time Notifications**: System-wide notification system for job assignments, acceptances, rejections, and task completions
- **Payment Integration**: Stripe payment processing with complete payment record tracking
- **WhatsApp Integration**: Direct communication between clients and service providers (planned)
- **Task Monitoring**: Clients can monitor service delivery status in real-time as providers mark tasks complete

# External Dependencies

## Core Infrastructure
- **Database**: Neon PostgreSQL serverless database with connection pooling
- **Authentication**: Replit OIDC provider for user authentication and session management
- **WebSocket**: Native WebSocket implementation for real-time features

## Payment Processing
- **Stripe**: Integrated payment processing with React Stripe.js components for secure transactions
- **Payment Methods**: Support for multiple payment options with built-in fraud protection

## File Management
- **Uppy**: File upload handling with support for multiple providers including AWS S3 integration
- **Media Storage**: AWS S3 integration for property images, videos, and user-generated content

## Development Tools
- **TypeScript**: Full stack type safety with shared schema definitions
- **Drizzle Kit**: Database migration and schema management tools
- **ESBuild**: Fast bundling for production deployments
- **Vite Plugins**: Development enhancement plugins including error overlay and debugging tools

## UI/UX Libraries
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Lucide React**: Icon library with consistent styling and accessibility features
- **TailwindCSS**: Utility-first CSS framework with custom design system integration