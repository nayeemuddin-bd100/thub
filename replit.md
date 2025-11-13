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
- **Authentication**: Email/password authentication with bcrypt hashing
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
- **Live Chat System**: Real-time messaging between users with WebSocket-powered instant delivery, conversation management, unread message tracking, and automatic message read receipts.
- **WhatsApp Integration**: Direct WhatsApp contact for service providers with click-to-chat buttons and system notification capabilities via Twilio.
- **Stripe Payment Integration**: Complete payment flow with secure intent creation, UI, and status updates.
- **Server-side Price Validation**: Critical security feature to recalculate all prices from authoritative database sources, ignore client-supplied pricing, and validate items belong to the specified provider, preventing tampering and injection attacks.
- **Secure Payment-First Flow**: Service orders and bookings require payment completion before confirmation, preventing abandoned payments from creating orphaned orders in the system.

## Payment Flow
### Service Order Payment
1. **Order Creation**: Client selects services and places order → Order created with status='pending_payment' and paymentStatus='pending'
2. **Automatic Redirect**: After successful order placement, client automatically redirected to payment page (`/pay-service-order/:orderId`) after 1.5 second delay
3. **Payment Processing**: Payment page loads Stripe Elements for secure card input, validates order status is 'pending_payment'
4. **Payment Completion**: Upon successful payment, order's paymentStatus updated to 'paid' AND status updated to 'confirmed'
5. **Order Fulfillment**: Provider delivers service on scheduled date

### Property Booking Payment
1. **Booking Creation**: Client selects property and dates → Booking created with status='pending_payment' and paymentStatus='pending'
2. **Automatic Redirect**: After successful booking, client automatically redirected to payment page (`/pay-booking/:bookingId`) after 1.5 second delay
3. **Payment Processing**: Payment page loads Stripe Elements for secure card input, validates booking status is 'pending_payment'
4. **Payment Completion**: Upon successful payment, booking's paymentStatus updated to 'paid' AND status updated to 'confirmed'
5. **Property Access**: Client receives booking confirmation with property access details

### Key Implementation Details
- **CRITICAL SECURITY FIX**: Both service orders and property bookings created with `status='pending_payment'` initially (NOT 'confirmed')
- Orders/bookings ONLY become 'confirmed' AFTER successful payment verification with Stripe
- This prevents abandoned/failed payments from creating confirmed orders in the system
- Payment requires: status = 'pending_payment' AND paymentStatus = 'pending'
- Redirect includes booking/order code in success toast: "Your booking code is XXX. Redirecting to payment..."
- Payment pages include loading states, error handling, and security notices
- Stripe payment intents created server-side for security
- Payment verification completed server-side before updating both payment status AND order/booking status to confirmed

## Live Chat & Messaging System
### Real-time Chat
- **WebSocket Connection**: Persistent WebSocket connection at `/ws` for instant message delivery
- **Frontend Hook**: `useWebSocket` custom hook handles connection, authentication, and real-time updates
- **Messages Page**: Full-featured chat UI at `/messages` with conversation list and chat interface
- **Auto-reconnection**: Exponential backoff strategy for WebSocket reconnections
- **Features**:
  - Conversation list with unread message counts
  - Real-time message delivery and read receipts
  - Auto-scroll to latest messages
  - Message history persistence
  - Responsive mobile/desktop layouts

### Backend Messaging API
- `POST /api/messages` - Send message (requires auth)
- `GET /api/conversations` - Get user's conversation list with unread counts (requires auth)
- `GET /api/messages/:userId` - Get conversation history with specific user (requires auth)
- `PUT /api/messages/read` - Mark messages as read (requires auth)

### Database Schema
- **Messages Table**: Stores all chat messages with sender/receiver, content, read status, timestamps
- **Dynamic Conversations**: Conversations generated dynamically from messages table
- **Unread Tracking**: Automatic counting of unread messages per conversation

### WhatsApp Integration
- **Floating Bubble**: Global WhatsApp chat bubble in bottom-right corner of all pages
- **Business Contact**: Direct link to business WhatsApp number +18495815558
- **Direct Links**: Uses `https://api.whatsapp.com/send?phone=` for universal compatibility
- **System Notifications**: Backend capability to send WhatsApp notifications via Twilio API
- **Endpoints**:
  - `GET /api/whatsapp/link/:providerId` - Get WhatsApp chat link
  - `POST /api/whatsapp/notify` - Send system notification (requires auth)
- **Configuration**: Requires Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER)

### Navigation
- **Header Icon**: MessageSquare icon button for quick access to Messages page
- **User Menu**: Messages link in dropdown menu
- **Real-time Badge**: Connection status indicator (Connected/Disconnected)
- **Provider Pages**: "Send Message" button navigates to Messages page with auto-selected conversation
- **Query Parameters**: Supports `?user=<userId>` to auto-open specific conversations

# External Dependencies

## Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Email/password with session-based authentication
- **WebSocket**: Native WebSocket implementation for real-time chat messaging

## Payment Processing
- **Stripe**: Payment processing integrated with React Stripe.js components.

## Communication
- **Twilio**: WhatsApp messaging service for provider contact and system notifications (requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_NUMBER environment variables).

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