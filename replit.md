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
- **Live Chat System**: WebSocket-powered real-time messaging.
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