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

## Key Features
- **Multi-role Dashboards**: Specialized dashboards for each user role (e.g., Billing, Operation, Marketing, City Manager).
- **Two-Tier Approval System**: Workflow for provider onboarding and service approval by managers/admins.
- **Real-time Notifications**: System-wide notifications for job assignments, approvals, and task completions.
- **Live Chat System**: WebSocket-powered real-time messaging between users with conversation management and unread message tracking.
- **WhatsApp Integration**: Direct WhatsApp contact for service providers and system notifications via Twilio.
- **Stripe Payment Integration**: Secure payment flow with server-side price validation and a payment-first confirmation process for orders and bookings.
- **Operation Support System**: Dedicated support contact feature with a protected dashboard for the `operation_support` role, ensuring a single support user.

## Payment Flow
- Services and bookings are initially created with `status='pending_payment'` and `paymentStatus='pending'`.
- Confirmation (`status='confirmed'`) only occurs after successful Stripe payment verification, preventing orphaned orders.
- Server-side payment intent creation and validation are crucial for security.

# External Dependencies

- **Database**: Neon (PostgreSQL serverless).
- **Payment Processing**: Stripe.
- **Communication**: Twilio (for WhatsApp integration).
- **File Management**: Uppy (file uploads), AWS S3 (media storage).
- **Development Tools**: TypeScript, Drizzle Kit, ESBuild.
- **UI/UX Libraries**: Radix UI, Lucide React, TailwindCSS.