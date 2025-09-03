# Overview

TravelHub is a comprehensive travel ecosystem platform that serves as an evolution of traditional accommodation booking services. The application enables users to book accommodations and curated travel services through a unified platform, featuring role-based access for travelers, property owners, service providers, and administrators. Built with modern web technologies, TravelHub emphasizes seamless user experience, integrated service management, and secure transactions.

# User Preferences

Preferred communication style: Simple, everyday language.

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
- **Schema**: Comprehensive relational model supporting users, properties, service providers, bookings, reviews, and messaging
- **Connection**: Connection pooling with @neondatabase/serverless for optimal performance

## Authentication & Authorization
- **Strategy**: Role-based access control (RBAC) with four distinct user roles: admin, property_owner, service_provider, and client
- **Session Security**: HTTP-only cookies with secure flags and configurable TTL
- **Identity Provider**: Replit OIDC for seamless authentication in development environment
- **User Management**: Automatic user provisioning with profile data synchronization

## Unique Features
- **Base44 Encoding**: Custom encoding system for generating human-readable booking codes using a 44-character alphabet
- **Multi-role Support**: Dynamic user interface adaptation based on user role and permissions
- **Integrated Services**: Unified booking system for both accommodations and additional services (transport, dining, experiences)
- **Real-time Communication**: WebSocket integration for live updates and messaging
- **Smart Property Management**: IoT device integration for automated property access and management

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