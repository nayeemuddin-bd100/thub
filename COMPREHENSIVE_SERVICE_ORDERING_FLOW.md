# Comprehensive Service Ordering Flow Documentation

**Last Updated**: October 30, 2025  
**Status**: Complete Feature Specification  
**Critical Requirement**: ALL features must be 100% dynamic with real database operations - NO static or placeholder data

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Client User Journey](#client-user-journey)
3. [Service Provider Journey](#service-provider-journey)
4. [Chef Service - Complete Flow](#chef-service-complete-flow)
5. [Maid Service - Complete Flow](#maid-service-complete-flow)
6. [Database Schema Requirements](#database-schema-requirements)
7. [API Endpoints Required](#api-endpoints-required)
8. [Frontend Pages & Components](#frontend-pages--components)
9. [Payment Integration](#payment-integration)
10. [Implementation Checklist](#implementation-checklist)

---

## System Overview

TravelHub enables clients staying at properties to order additional services (chef, maid, tours, transport, wellness) directly through the platform. Service providers manage their availability, capabilities, pricing, and incoming orders through dedicated dashboards.

### Core Principles
- **Zero Contact with Support**: All features are self-service
- **100% Dynamic Data**: Every piece of information comes from database
- **Seamless Payment**: Integrated Stripe payment flow
- **Real-time Updates**: Order status changes reflected immediately
- **Mobile-First Design**: All interfaces work perfectly on mobile devices

---

## Client User Journey

### Phase 1: Service Discovery
**Location**: Property Details Page (`/properties/:id`)

**Features**:
1. **Service Badge on Property Cards**
   - Display: "+X services available"
   - Dynamic count from `property_services` table
   - Only shown when count > 0

2. **Available Services Section**
   - Shows all service providers linked to property
   - Each service displays:
     - Provider business name
     - Service category (Chef, Maid, Tours, Transport, Wellness)
     - Average rating (from reviews table)
     - Price range (hourly rate or fixed rate)
     - Service description
     - "View Details" button

**Database Queries**:
```sql
-- Get services for a property
SELECT sp.*, sc.name as category_name
FROM service_providers sp
JOIN property_services ps ON sp.id = ps.service_provider_id
JOIN service_categories sc ON sp.category_id = sc.id
WHERE ps.property_id = ?
```

---

### Phase 2: Service Selection & Configuration
**Location**: Service Provider Detail Page (`/service-provider/:id`)

#### 2.1 Provider Information Panel
- Business name
- Full description
- Category
- Average rating with review count
- Response time
- Languages spoken
- Years of experience

#### 2.2 Availability Calendar (Dynamic)
**Features**:
- Interactive calendar showing available dates
- Color-coded availability:
  - Green: Fully available
  - Yellow: Partially available (some time slots taken)
  - Red: Fully booked
  - Gray: Provider unavailable (day off)

**Data Source**: `provider_availability` table
```typescript
interface ProviderAvailability {
  id: string;
  providerId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isAvailable: boolean;
  maxOrders: number; // How many concurrent orders
  currentOrders: number; // How many already booked
}
```

**User Actions**:
1. Click desired date(s)
2. Select time slots (dropdown or time picker)
3. System validates against availability
4. Shows hourly breakdown for that day

#### 2.3 Service Options Selection

##### For Chef Services:
**Menu Categories** (Dynamic from `provider_menus` table)
- Breakfast, Lunch, Dinner, Snacks, Desserts
- Each category has multiple menu items

**Menu Item Display** (`menu_items` table):
```typescript
interface MenuItem {
  id: string;
  menuId: string;
  name: string;
  description: string;
  price: number;
  preparationTime: number; // minutes
  servings: number;
  allergens: string[]; // ['nuts', 'dairy', 'gluten']
  dietaryInfo: string[]; // ['vegan', 'vegetarian', 'gluten-free']
  imageUrl?: string;
  isAvailable: boolean;
}
```

**Ingredients Display** (`provider_materials` table):
```typescript
interface Ingredient {
  id: string;
  providerId: string;
  name: string;
  category: string; // 'produce', 'protein', 'dairy', 'spices'
  unitCost: number;
  unit: string; // 'kg', 'piece', 'liter'
  isClientProvided: boolean; // true if client must provide
  isOptional: boolean;
}
```

**Client Interface**:
- Browse menu by category
- Filter by dietary preferences
- See ingredients required
- Mark which ingredients client will provide
- System calculates total cost dynamically
- Add/remove menu items to order
- Set number of servings per item

##### For Maid Services:
**Task Checklist** (Dynamic from `provider_task_configs` table)
```typescript
interface TaskConfig {
  id: string;
  providerId: string;
  taskId: string; // Reference to service_tasks
  isOffered: boolean;
  effectivePrice: number; // Provider's price for this task
  estimatedMinutes: number;
  requiresMaterial: boolean;
  notes?: string;
}
```

**Service Tasks** (Predefined in `service_tasks` table):
```typescript
interface ServiceTask {
  id: string;
  name: string;
  category: string; // 'bedroom', 'kitchen', 'bathroom', 'living_room'
  description: string;
  basePrice: number;
  defaultMinutes: number;
}
```

**Client Interface**:
- Task categories displayed with icons
- Checkboxes for each task
- Task details on hover/click:
  - Description
  - Estimated time
  - Price
  - Materials required
- Select all/none buttons per category
- Running total calculation
- Total estimated time display

#### 2.4 Material/Supply Requirements
**Features**:
- Display list of materials provider needs
- Checkbox: "I will provide this" vs "Provider will bring"
- Materials provided by client reduce cost
- Materials provided by provider increase cost
- Dynamic price calculation

**Database**: `provider_materials` table
```sql
SELECT name, unit_cost, unit, is_client_provided
FROM provider_materials
WHERE provider_id = ?
ORDER BY category, name
```

#### 2.5 Special Instructions
**Features**:
- Text area for special requests
- Character limit (500 chars)
- Optional field
- Stored in `service_orders.special_instructions`

---

### Phase 3: Date & Time Selection
**Location**: Booking Configuration Panel

#### 3.1 Single Service Date
**For one-time services** (chef for dinner, one-time deep clean):
- Date picker (only available dates enabled)
- Time slot selector
  - Dropdowns: Start time, Duration
  - Visual time blocks (9:00 AM - 12:00 PM, 1:00 PM - 5:00 PM)
- Real-time availability check

#### 3.2 Recurring Services
**For regular services** (daily maid service during stay):
- Select start date and end date
- Choose frequency:
  - Daily
  - Every 2 days
  - Every 3 days
  - Specific days of week (Mon, Wed, Fri)
- Time selection for recurring slots
- Calendar preview showing all selected dates
- Total service count displayed

**Database**: Creates multiple `service_orders` records or single order with `recurring_config` JSON field

---

### Phase 4: Order Review & Confirmation
**Location**: Order Summary Panel (`/book-service/:id`)

**Display Components**:

1. **Service Summary**
   - Provider name
   - Service category
   - Selected dates and times (all occurrences if recurring)

2. **Selected Items** (Chef)
   - Menu items with quantities
   - Price per item
   - Subtotal per item

3. **Selected Tasks** (Maid)
   - Task checklist with prices
   - Estimated time per task
   - Total estimated hours

4. **Materials/Supplies**
   - Items client will provide (cost reduction shown)
   - Items provider will bring (cost addition shown)

5. **Pricing Breakdown**
   - Service base cost
   - Items/tasks cost
   - Materials cost adjustment
   - Subtotal
   - Platform fee (10%)
   - Taxes (calculated based on location)
   - **Total Amount**

6. **Special Instructions**
   - Display entered notes

**Action Buttons**:
- "Edit" (go back to modify)
- "Submit Order" (creates order, requires authentication)

**Authentication Check**:
- If not logged in: Redirect to login with return URL
- If logged in: Proceed to order creation

---

### Phase 5: Order Submission
**API Endpoint**: `POST /api/service-orders`

**Request Payload**:
```typescript
interface CreateServiceOrder {
  providerId: string;
  propertyId: string;
  serviceDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isRecurring: boolean;
  recurringDates?: string[]; // Array of dates if recurring
  specialInstructions?: string;
  selectedMenuItems?: {
    menuItemId: string;
    quantity: number;
  }[];
  selectedTasks?: string[]; // Array of task IDs
  clientProvidedMaterials?: string[]; // Array of material IDs
}
```

**Server-Side Processing**:
1. Validate user authentication
2. Verify provider exists and is active
3. Check availability for all selected dates/times
4. Recalculate ALL prices from database (prevent tampering)
5. Calculate total cost
6. Generate unique booking code (Base44 encoding)
7. Create service order record(s)
8. Create service order items (menu items or tasks)
9. Mark availability slots as booked
10. Send notification to provider
11. Return order details with booking code

**Response**:
```typescript
interface ServiceOrderResponse {
  orderId: string;
  bookingCode: string;
  totalAmount: number;
  status: 'pending_provider_confirmation';
  requiresPayment: boolean;
  paymentDueDate: string;
}
```

---

### Phase 6: Order Tracking
**Location**: Client Dashboard - My Service Orders (`/my-service-orders`)

**Features**:

1. **Order List Tabs**
   - Pending (waiting provider confirmation)
   - Confirmed (provider accepted, payment pending)
   - Paid (payment completed, scheduled)
   - In Progress (currently being performed)
   - Completed
   - Cancelled

2. **Order Card Display**
   - Booking code (prominent)
   - Provider name with avatar
   - Service category icon
   - Date(s) and time(s)
   - Total amount
   - Payment status badge
   - Order status badge
   - Quick action buttons

3. **Order Details Modal**
   - Full order information
   - Timeline of status changes
   - Selected items/tasks breakdown
   - Material requirements
   - Special instructions
   - Provider contact (WhatsApp button)
   - Payment information
   - Invoice download button

4. **Order Actions by Status**

   **Pending**:
   - Cancel Order (before provider confirms)
   - Contact Provider
   - View Details

   **Confirmed**:
   - **Pay Now** (prominent button)
   - Modify Order (request changes)
   - Cancel Order (with cancellation fee warning)

   **Paid**:
   - View Receipt
   - Contact Provider
   - Add to Calendar (iCal export)
   - Get Directions to Property

   **In Progress**:
   - Live Status Updates
   - Contact Provider (urgent)
   - Report Issue

   **Completed**:
   - Rate & Review
   - Rebook Service
   - Download Invoice
   - Report Problem (within 24 hours)

**Database Queries**:
```sql
-- Get client's orders with provider details
SELECT so.*, sp.business_name, sp.category_id, sc.name as category_name
FROM service_orders so
JOIN service_providers sp ON so.provider_id = sp.id
JOIN service_categories sc ON sp.category_id = sc.id
WHERE so.client_id = ?
ORDER BY so.service_date DESC, so.start_time DESC
```

---

### Phase 7: Payment Processing
**Location**: Payment Page (`/payment/:orderId`)

**Triggered When**:
- Provider confirms the order
- Client clicks "Pay Now" button
- Redirects to secure payment page

**Page Components**:

1. **Order Summary** (Read-only)
   - Order details
   - Total amount to pay
   - Payment due date

2. **Payment Form** (Stripe Integration)
   - Stripe Payment Element (handles card, Google Pay, Apple Pay)
   - Billing address
   - Email receipt checkbox
   - Terms & conditions checkbox

3. **Security Badges**
   - Secure payment icons
   - SSL certificate indicator
   - PCI compliance badge

**Payment Flow**:

1. **Client arrives at payment page**
   - API call: `POST /api/payment/create-intent`
   - Server creates Stripe Payment Intent
   - Amount pulled from service order (server-side calculation)
   - Returns client secret

2. **Client enters payment details**
   - Stripe Payment Element handles input
   - Real-time validation
   - Card error display

3. **Client submits payment**
   - Stripe processes payment
   - Client redirected to processing screen
   - Loading indicator shown

4. **Payment confirmation**
   - API call: `POST /api/payment/confirm`
   - Server verifies payment with Stripe
   - Updates order status to 'paid'
   - Creates payment record
   - Sends confirmation notifications
   - Redirects to success page

5. **Success page**
   - Order confirmation details
   - Receipt download button
   - Calendar add button
   - "Back to My Orders" link

**API Endpoints**:
```typescript
POST /api/payment/create-intent
Body: { orderId: string }
Response: { clientSecret: string, amount: number }

POST /api/payment/confirm
Body: { orderId: string, paymentIntentId: string }
Response: { success: boolean, receiptUrl: string }
```

**Database Updates**:
```sql
-- Update order status
UPDATE service_orders
SET payment_status = 'paid', 
    status = 'scheduled',
    paid_at = NOW()
WHERE id = ?;

-- Create payment record
INSERT INTO payments (order_id, amount, stripe_payment_id, status)
VALUES (?, ?, ?, 'completed');
```

---

### Phase 8: Service Delivery & Completion
**Location**: My Service Orders Page

**During Service**:
1. **Status Updates**
   - Provider marks tasks as in progress
   - Client sees real-time updates
   - Notification: "Your service has started"

2. **Task Completion** (Maid Service)
   - Provider checks off completed tasks
   - Timestamp recorded for each task
   - Client can view progress

3. **Service Completion**
   - Provider marks service as complete
   - Client receives notification
   - Review request sent after 1 hour

**After Service**:
1. **Rate & Review Prompt**
   - Modal appears on next login
   - 5-star rating
   - Written review (optional)
   - Upload photos (optional)
   - Submit review

2. **Issue Reporting** (if needed)
   - Report problem within 24 hours
   - Select issue type
   - Describe problem
   - Upload evidence (photos)
   - Submit for admin review

---

## Service Provider Journey

### Phase 1: Provider Registration & Profile Setup
**Location**: Become a Provider Page (`/become-provider`)

**Registration Steps**:
1. User creates account or logs in
2. Selects "Become a Service Provider"
3. Fills application form:
   - Business name
   - Service category (dropdown)
   - Years of experience
   - Description (500 chars)
   - Languages spoken (multi-select)
   - Certifications (upload images)
   - Business license number
   - Tax ID/VAT number

4. Uploads profile photo and business photos
5. Submits application
6. Admin reviews and approves
7. Provider gains access to provider dashboard

---

### Phase 2: Profile Configuration
**Location**: Provider Settings (`/provider-config`)

This page already exists but needs enhancements:

#### 2.1 Business Profile Tab
**Current Features**:
- Business name, description
- Contact information
- Operating hours
- Service radius

**Enhancements Needed**:
- Profile photo upload
- Business photo gallery
- Video introduction (upload to object storage)
- Languages spoken (multi-select)
- Certifications display
- Awards & recognitions
- Social media links

#### 2.2 Availability Calendar Tab
**Features**:
- Monthly calendar view
- Click dates to set availability
- Bulk operations:
  - Set recurring availability (every Monday, Tuesday, etc.)
  - Block off vacation dates
  - Copy availability from previous month

**Availability Configuration Panel**:
- Date: Selected date
- Available: Yes/No toggle
- Time slots:
  - Add time block (start time, end time)
  - Multiple blocks per day (morning slot + evening slot)
  - Max concurrent orders for each block
- Recurring pattern:
  - Repeat this availability
  - Choose days: M T W T F S S
  - End date for recurring pattern

**Save Actions**:
- Save individual date
- Save recurring pattern
- Clear all availability
- Import from template

**Database**: `provider_availability` table
```sql
INSERT INTO provider_availability 
(provider_id, date, start_time, end_time, is_available, max_orders)
VALUES (?, ?, ?, ?, ?, ?)
ON CONFLICT (provider_id, date, start_time) 
DO UPDATE SET is_available = ?, max_orders = ?;
```

#### 2.3 Service Capabilities Tab

##### Chef Providers - Menu Management
**Existing**: Already implemented in provider-config page

**Features**:
- Menu categories (Breakfast, Lunch, Dinner, Desserts, Snacks)
- Add menu items:
  - Name, description
  - Price
  - Preparation time
  - Servings
  - Allergens (multi-select checkboxes)
  - Dietary labels (vegan, vegetarian, gluten-free, etc.)
  - Upload food image
  - Availability toggle

**Enhancement - Ingredients Management**:
- Tab: "Ingredients & Supplies"
- Add ingredient:
  - Name
  - Category (produce, protein, dairy, spices, equipment)
  - Unit cost (for cost calculation)
  - Unit (kg, piece, liter)
  - Client can provide? (checkbox)
  - Optional? (checkbox)
  - Notes
- Bulk import ingredients (CSV upload)
- Link ingredients to menu items

**Database**: `provider_materials` table (already exists)

##### Maid Providers - Task Configuration
**Existing**: Already implemented in provider-config page

**Features**:
- List of all predefined tasks (from `service_tasks`)
- For each task:
  - Offered: Yes/No toggle
  - Custom price (override default)
  - Estimated time (override default)
  - Requires materials checkbox
  - Special notes

**Enhancement - Material Requirements**:
- Tab: "Cleaning Supplies"
- Add material:
  - Name (e.g., "Vacuum cleaner", "Eco-friendly detergent")
  - Category
  - Client can provide? (reduces cost)
  - Provider brings? (adds cost)
  - Unit cost
- Associate materials with tasks

#### 2.4 Pricing Tab
**Features**:

1. **Base Pricing**
   - Hourly rate (for time-based services)
   - Fixed rate per service
   - Minimum order amount
   - Currency

2. **Dynamic Pricing Rules**
   - Weekend surcharge (%)
   - Holiday surcharge (%)
   - Last-minute booking fee (within 24 hours)
   - Early bird discount (book 7+ days ahead)
   - Recurring service discount (%)

3. **Travel Fees**
   - Distance-based pricing
   - Fixed travel fee within service radius
   - Extended travel fee (beyond radius)

4. **Material Cost Markup**
   - Percentage markup on materials provided
   - Flat fee for bringing equipment

**Save & Preview**:
- Preview pricing calculator
- Test different scenarios
- Save pricing configuration

**Database**: 
```typescript
interface ProviderPricing {
  providerId: string;
  hourlyRate?: number;
  fixedRate?: number;
  minimumOrder: number;
  weekendSurcharge: number; // percentage
  holidaySurcharge: number;
  lastMinuteFee: number;
  earlyBirdDiscount: number;
  recurringDiscount: number;
  travelFeeFixed: number;
  travelFeePerKm: number;
  materialMarkup: number; // percentage
}
```

---

### Phase 3: Order Management
**Location**: Provider Dashboard - Orders (`/provider-orders`)

This page already exists but here's the complete flow:

#### 3.1 Incoming Orders Tab (Pending)
**Features**:
- List of new orders awaiting confirmation
- Order card displays:
  - Booking code
  - Client name (with verified badge if applicable)
  - Property name and location
  - Service date(s) and time(s)
  - Order details (items/tasks selected)
  - Total amount
  - Special instructions
  - Time until auto-decline (24 hours)

**Actions**:
- View Full Details (modal)
- Accept Order (button)
  - Confirmation dialog: "Accept this order?"
  - Updates status to 'confirmed'
  - Sends notification to client
  - Client can now pay
- Decline Order (button)
  - Requires reason (dropdown + notes)
  - Reasons: Unavailable, Too far, Outside expertise, Other
  - Updates status to 'declined'
  - Client notified with reason
  - Suggests alternative providers

**Order Details Modal**:
- Client information (name, phone, email)
- Property details with map
- Complete order breakdown
- Chat/message history
- Accept/Decline buttons

#### 3.2 Confirmed Orders Tab
**Features**:
- Orders accepted, waiting for client payment
- Shows payment status
- Payment deadline countdown
- Reminder button (send payment reminder to client)

**Auto-cancellation**:
- If client doesn't pay within X days (configurable)
- Order automatically cancelled
- Availability slot freed up
- Both parties notified

#### 3.3 Upcoming Services Tab
**Features**:
- Paid orders scheduled for future dates
- Calendar view and list view toggle
- Sort by: Date, Amount, Location
- Filter by: This week, This month, Date range

**Service Preparation**:
- View order details
- Download order summary (PDF)
- Navigation to property (maps integration)
- Contact client (WhatsApp, phone, message)
- Add to personal calendar (iCal export)

**Day-of Service**:
- "Start Service" button (appears on service date)
- Confirms arrival at property
- Starts service timer
- Updates status to 'in_progress'

#### 3.4 In Progress Tab
**Features**:
- Services currently being performed
- Live timer showing duration
- Task completion checkboxes (for maid service)
- Notes field (record issues, additional work)
- Photo upload (before/after for cleaning)

**Complete Service**:
- "Mark as Complete" button
- Confirmation dialog
- Optional: Upload completion photos
- Optional: Request client signature (mobile app)
- Updates status to 'completed'
- Triggers payment release (if held in escrow)
- Requests client review

#### 3.5 Completed Tab
**Features**:
- Historical record of all completed services
- Service details with completion timestamp
- Client reviews (once posted)
- Earnings breakdown
- Reorder button (client can rebook same service)

**Analytics**:
- Total services completed
- Average rating
- Total earnings
- Most popular services
- Repeat client rate

#### 3.6 Cancelled Tab
**Features**:
- Orders cancelled by client or provider
- Cancellation reason
- Cancellation date and who initiated
- Refund status (if paid)
- Pattern analysis (multiple cancellations flagged)

---

### Phase 4: Earnings & Payments
**Location**: Provider Dashboard - Earnings (`/provider-earnings`)

**Features**:

1. **Overview Cards**
   - Total earnings (all time)
   - This month's earnings
   - Pending payments
   - Next payout date
   - Average order value

2. **Earnings Timeline**
   - Graph showing daily/weekly/monthly earnings
   - Filter by date range
   - Export data (CSV, PDF)

3. **Transaction List**
   - Date, Order ID, Client, Amount, Status
   - Filter by status (completed, pending, refunded)
   - Search by order ID or client name

4. **Payout Settings**
   - Bank account information
   - Payout frequency (weekly, bi-weekly, monthly)
   - Minimum payout threshold
   - Tax information (W-9 for US providers)

5. **Payout History**
   - Date, Amount, Method, Status
   - Download statements
   - Tax documents (1099, invoices)

**Database**:
```sql
SELECT 
  so.id, so.booking_code, so.total_amount,
  so.service_date, so.status,
  u.name as client_name
FROM service_orders so
JOIN users u ON so.client_id = u.id
WHERE so.provider_id = ?
  AND so.status = 'completed'
ORDER BY so.service_date DESC;
```

---

## Chef Service - Complete Flow

### Client Side - Ordering Chef Service

**Step 1: Browse Chef Profiles**
- Location: `/services?category=chef` or property details
- View all chefs available for the property
- Filter by:
  - Cuisine type (Italian, Mexican, Asian, French, etc.)
  - Dietary options (vegan, gluten-free, etc.)
  - Price range
  - Rating
- Sort by: Rating, Price, Experience

**Step 2: View Chef Profile**
- Location: `/service-provider/:chefId`
- See:
  - Chef bio and experience
  - Cuisine specialties
  - Sample menu with photos
  - Client reviews
  - Availability calendar
  - Pricing structure

**Step 3: Select Date & Time**
- Click desired date on availability calendar
- Choose meal type: Breakfast, Lunch, Dinner
- Select time:
  - Start time (when chef should arrive)
  - Expected service duration
- System shows available time slots

**Step 4: Choose Menu Items**
- Browse menu categories:
  - **Appetizers**: 5-8 items with prices
  - **Main Courses**: 10-15 items
  - **Side Dishes**: 6-10 items
  - **Desserts**: 5-8 items
  - **Beverages**: 4-6 items

- Each menu item shows:
  - Photo
  - Name and description
  - Price per serving
  - Preparation time
  - Allergen information
  - Dietary labels
  - Number of servings

- Select items:
  - Click to add to order
  - Adjust quantity (number of servings)
  - See running total
  - Estimated preparation time

**Step 5: Ingredients & Materials**
- View complete ingredients list for selected items
- For each ingredient:
  - Name and quantity needed
  - Option: "I will provide this"
  - Option: "Chef will bring"
  - Cost impact shown

- Equipment needed:
  - Chef brings: Professional knives, cookware
  - Property should have: Stove, oven, basic utensils
  - Special equipment: If needed, noted with cost

**Step 6: Special Instructions**
- Text field for dietary restrictions
- Preferences (spice level, cooking methods)
- Plating preferences
- Serving time preferences
- Number of guests

**Step 7: Review & Book**
- Order summary:
  - Date, time, duration
  - Selected menu items with quantities
  - Ingredients (client-provided vs chef-provided)
  - Special instructions
  - **Pricing breakdown**:
    - Chef service fee (base hourly rate × hours)
    - Menu items total
    - Ingredients cost (if chef provides)
    - Travel fee (if applicable)
    - Platform fee (10%)
    - Tax
    - **TOTAL**

- Submit button: "Request Chef Service"
- Creates order with status 'pending_provider_confirmation'

**Step 8: Wait for Chef Confirmation**
- Notification: "Your request has been sent to [Chef Name]"
- Chef has 24 hours to accept or decline
- Client can view order in "My Service Orders" with status "Pending"

**Step 9: Chef Accepts & Payment**
- Notification: "Good news! [Chef Name] confirmed your booking"
- Order status: 'confirmed'
- Action required: "Pay Now" button prominent
- Client clicks "Pay Now" → redirected to payment page

**Step 10: Payment Processing**
- Secure Stripe payment page
- Amount: Full total from order
- Payment methods: Card, Google Pay, Apple Pay
- Enter payment details
- Submit payment
- Confirmation: "Payment successful"
- Order status: 'paid' → 'scheduled'

**Step 11: Pre-Service Communication**
- Client can message chef through platform
- Confirm arrival time
- Make last-minute menu adjustments
- Discuss kitchen setup

**Step 12: Service Day**
- Chef arrives at scheduled time
- Client receives notification: "Your chef has started service"
- Live updates as chef prepares dishes
- Estimated completion time shown

**Step 13: Service Completion**
- Chef marks service complete
- Client notified: "Your meal is ready! Bon appetit!"
- Request for review sent (after meal time)

**Step 14: Review & Rebook**
- Rate chef (1-5 stars)
- Write review
- Upload food photos
- Option to rebook same chef: "Order Again" button

---

### Provider Side - Chef Managing Service

**Step 1: Profile Setup**
- Location: `/provider-config`
- Fill business profile:
  - Chef name (professional or personal)
  - Years of experience
  - Culinary background
  - Specialties (cuisine types)
  - Certifications (upload)
  - Profile photo
  - Kitchen/food photos

**Step 2: Set Availability**
- Navigate to Availability Calendar tab
- Click dates to set availability
- For each available date:
  - Morning slot: 6:00 AM - 12:00 PM
  - Afternoon slot: 12:00 PM - 6:00 PM
  - Evening slot: 6:00 PM - 11:00 PM
  - All-day: Custom hours
  - Max bookings per slot: 1-3

- Recurring availability:
  - Example: Available every Friday-Sunday evening
  - Block off: Holidays, personal days

**Step 3: Create Menus**
- Navigate to Menu Management tab
- Create menu categories:
  - Breakfast Menu
  - Lunch Menu
  - Dinner Menu
  - Special Occasions Menu

- Add menu items:
  - Name: "Grilled Salmon with Lemon Butter"
  - Description: "Fresh Atlantic salmon, herb-infused..."
  - Price per serving: $25
  - Preparation time: 30 minutes
  - Servings: 1 (client can order multiple)
  - Allergens: Fish
  - Dietary: Gluten-free, Keto-friendly
  - Upload photo
  - Mark as available

- Repeat for 20-30 menu items across categories

**Step 4: Define Ingredients & Costs**
- Navigate to Ingredients tab
- Add commonly used ingredients:
  - Salmon fillet: $12/lb
  - Butter: $3/lb
  - Lemons: $1 each
  - Fresh herbs: $2/bunch

- Mark which ingredients:
  - Chef typically brings
  - Client can provide (cost reduction)
  - Must be fresh from market (chef purchases day-of)

**Step 5: Set Pricing**
- Navigate to Pricing tab
- Hourly rate: $50/hour
- Minimum order: $150
- Weekend surcharge: 20%
- Travel fee: $15 fixed + $2/km beyond 5km
- Last-minute booking (< 24 hours): +$30
- Ingredient markup: 15% (on cost of groceries)

**Step 6: Receive Order Notification**
- Email/SMS: "New service request from Sarah at Beachfront Villa"
- Push notification: Order details summary
- Login to dashboard

**Step 7: Review Order Details**
- Location: `/provider-orders` → Pending tab
- View order:
  - Client: Sarah Johnson
  - Property: Luxury Beachfront Villa (5.2 km away)
  - Date: Saturday, Nov 2, 2025
  - Time: 6:00 PM - 9:00 PM (3 hours)
  - Meal: Dinner for 4 people
  - Selected menu items:
    - Appetizer: Caprese Salad × 4 ($12 each)
    - Main: Grilled Salmon × 2 ($25 each)
    - Main: Chicken Piccata × 2 ($22 each)
    - Side: Roasted Vegetables × 4 ($8 each)
    - Dessert: Tiramisu × 4 ($10 each)
  - Ingredients: Client will provide basics (olive oil, salt, pepper)
  - Special notes: "One guest has nut allergy. Please avoid cross-contamination."
  - **Order total: $312**
    - Service fee: $150 (3 hours × $50)
    - Menu items: $246
    - Travel fee: $19 ($15 + 4km × $2)
    - Subtotal: $415
    - Client-provided ingredients discount: -$15
    - Platform keeps: $31.20 (10%)
    - **Chef earns: $280.80**

**Step 8: Accept or Decline**
- Decision considerations:
  - ✓ Available on that date/time
  - ✓ Comfortable with menu items
  - ✓ Can accommodate allergy restriction
  - ✓ Distance is acceptable
  - ✓ Earning is fair

- Action: Click "Accept Order"
- Optional message to client: "Looking forward to cooking for you! I'll bring fresh salmon from the market that morning."
- Order status → 'confirmed'
- Client notified immediately

**Step 9: Wait for Payment**
- Order moves to "Confirmed" tab
- Shows "Payment pending" badge
- Chef can send payment reminder if needed
- Once client pays → moves to "Upcoming Services"

**Step 10: Prepare for Service**
- Day before service:
  - Review order details
  - Create shopping list (ingredients chef will provide)
  - Check equipment needed
  - Confirm arrival time with client via message

- Morning of service:
  - Purchase fresh ingredients
  - Pack equipment and supplies
  - Travel to property

**Step 11: Perform Service**
- Arrive at property on time
- Click "Start Service" in app
  - Records arrival time
  - Status → 'in_progress'
  - Client receives notification

- Cook meal:
  - Follow menu items
  - Respect allergy restrictions
  - Plate beautifully
  - Communicate with client about timing

**Step 12: Complete Service**
- After serving food and cleanup:
  - Take photo of final dishes (optional)
  - Click "Mark as Complete"
  - Add notes: "Meal served successfully. Clients very happy!"
  - Submit completion

- Order status → 'completed'
- Client receives notification
- Payment released to chef (or already held in account)

**Step 13: Receive Review & Payment**
- Client posts review: "Amazing experience! Chef John's salmon was perfect. 5 stars!"
- Review appears on chef profile
- Earnings of $280.80 added to account balance
- Scheduled for payout on Friday (per payout settings)

**Step 14: Future Opportunities**
- Client can "Rebook" same chef
- Chef can offer special promotions
- Build repeat client base

---

## Maid Service - Complete Flow

### Client Side - Ordering Maid Service

**Step 1: Browse Maid Service Providers**
- Location: Property details or `/services?category=maid`
- View available cleaning services
- Filter by:
  - Service type (regular cleaning, deep clean, move-in/out)
  - Eco-friendly products
  - Rating
  - Price range
- Sort by: Rating, Price, Response time

**Step 2: View Maid Service Profile**
- Location: `/service-provider/:providerId`
- See:
  - Business name and description
  - Years in business
  - Services offered
  - Cleaning products used
  - Eco-friendly options
  - Insurance and bonding info
  - Client reviews with photos
  - Availability calendar

**Step 3: Select Service Dates**
- Two options:

**Option A: One-Time Service**
- Pick single date
- Choose time slot (morning 8 AM-12 PM or afternoon 1 PM-5 PM)

**Option B: Recurring Service**
- Select stay dates (check-in to check-out)
- Choose frequency:
  - Daily
  - Every 2 days
  - Every 3 days
  - Specific days (Mon, Wed, Fri)
- Choose time for all services
- Calendar shows all selected dates (e.g., 5 cleaning sessions)

**Step 4: Select Cleaning Tasks**
- Task categories with checkboxes:

**Bedroom** (category icon)
- [ ] Change bed linens ($8, 10 min)
- [ ] Vacuum floors ($6, 15 min)
- [ ] Dust furniture ($5, 10 min)
- [ ] Clean mirrors ($4, 5 min)
- [ ] Organize closet ($10, 20 min)
- Select All Bedroom Tasks

**Bathroom** (category icon)
- [ ] Clean toilet ($8, 10 min)
- [ ] Scrub shower/tub ($10, 15 min)
- [ ] Clean sink and counter ($6, 10 min)
- [ ] Mop floor ($7, 10 min)
- [ ] Replenish toiletries ($3, 5 min)
- Select All Bathroom Tasks

**Kitchen** (category icon)
- [ ] Wash dishes ($12, 20 min)
- [ ] Clean countertops ($8, 10 min)
- [ ] Clean stove/oven ($15, 25 min)
- [ ] Wipe cabinets ($6, 10 min)
- [ ] Mop kitchen floor ($8, 15 min)
- [ ] Clean refrigerator ($12, 20 min)
- Select All Kitchen Tasks

**Living Room** (category icon)
- [ ] Vacuum carpet/floor ($10, 20 min)
- [ ] Dust all surfaces ($8, 15 min)
- [ ] Clean windows ($12, 25 min)
- [ ] Wipe down electronics ($5, 10 min)
- Select All Living Room Tasks

**Deep Cleaning** (category)
- [ ] Baseboards and trim ($15, 30 min)
- [ ] Ceiling fans and light fixtures ($10, 20 min)
- [ ] Window sills and tracks ($8, 15 min)
- [ ] Behind appliances ($20, 40 min)
- [ ] Detailed bathroom grout ($18, 35 min)

**Running Totals** (updates live):
- Tasks selected: 12
- Estimated time: 3 hours 15 minutes
- Total cost: $156

**Step 5: Cleaning Materials Selection**
- Materials list with options:

**Basic Supplies**:
- [ ] All-purpose cleaner: I'll provide ✓ / Provider brings ($3)
- [ ] Glass cleaner: I'll provide ✓ / Provider brings ($2)
- [ ] Toilet cleaner: I'll provide ✓ / Provider brings ($4)
- [ ] Trash bags: I'll provide / Provider brings ($3) ✓

**Equipment**:
- [x] Vacuum cleaner: Provider brings (included)
- [x] Mop and bucket: Provider brings (included)
- [x] Cleaning cloths: Provider brings (included)

**Optional Supplies**:
- [ ] Eco-friendly products upgrade (+$15)
- [ ] Air fresheners ($5)
- [ ] Replacement linens ($25)

- Cost adjustment:
  - Materials provided by provider: +$12
  - Total updated: $168

**Step 6: Special Instructions**
- Text area:
  "Please be careful around the antique vase in the living room. Dog-friendly products only as we have a pet. Focus extra on the master bathroom."

**Step 7: Review & Book**
- Order summary:

**Service Details**:
- Provider: Sparkle Clean Co
- Service type: Recurring cleaning
- Dates: Nov 1, 3, 5, 7, 9 (5 sessions)
- Time: 9:00 AM - 12:30 PM each day
- Location: Luxury Beachfront Villa, Unit 302

**Tasks Selected** (12 tasks):
- Bedroom: Change linens, vacuum, dust (× 5 sessions)
- Bathroom: Full cleaning (× 5 sessions)
- Kitchen: Counters, floor (× 5 sessions)
- Living room: Vacuum, dust (× 5 sessions)

**Materials**:
- Provider brings: Eco cleaners, vacuum, mop
- Client provides: Basic cleaners (saving $15)

**Pricing**:
- Service base: $156/session × 5 = $780
- Materials: $12/session × 5 = $60
- Recurring discount (10%): -$84
- Travel fee: $15 × 5 = $75
- Subtotal: $831
- Platform fee (10%): $83.10
- **Total: $914.10**

- Savings shown: "You save $84 with recurring booking!"

- Button: "Request Cleaning Service"

**Step 8: Wait for Confirmation**
- Order submitted
- Status: 'pending_provider_confirmation'
- Notification: "Your request sent to Sparkle Clean Co"
- Provider has 24 hours to accept

**Step 9: Provider Accepts**
- Email notification: "Great news! Your cleaning service is confirmed"
- Order status: 'confirmed'
- "Pay Now" button appears
- Payment due within 48 hours

**Step 10: Make Payment**
- Click "Pay Now"
- Redirected to `/payment/order-abc123`
- See order summary
- Enter payment details (Stripe)
- Total: $914.10
- Submit payment
- Confirmation: "Payment successful!"
- Order status: 'paid' → 'scheduled'

**Step 11: Service Day - First Session**
- Morning of Nov 1:
  - Reminder notification: "Your cleaning service starts today at 9:00 AM"
  - Maid arrives at property
  - Notification: "Your cleaner has arrived and started"

- During service (live updates):
  - "Cleaning bedroom..." (✓ Complete)
  - "Cleaning bathroom..." (✓ Complete)
  - "Cleaning kitchen..." (In progress)

- Client can view task completion in real-time

**Step 12: First Session Complete**
- Notification: "Cleaning session 1 of 5 complete!"
- View completion report:
  - All tasks completed ✓
  - Time taken: 3 hours 20 minutes
  - Before/after photos (optional)
  - Next service: Nov 3 at 9:00 AM

**Step 13: Recurring Sessions**
- Sessions 2-5 occur on schedule
- Each session:
  - Arrival notification
  - Live task updates
  - Completion notification

**Step 14: All Services Complete**
- After final session (Nov 9):
  - Notification: "All cleaning sessions complete!"
  - Request for review: "How was your experience with Sparkle Clean Co?"

**Step 15: Leave Review**
- Rate service: 5 stars
- Write review: "Excellent service throughout our stay. Always on time, thorough cleaning, very professional."
- Upload photos of clean rooms
- Submit review
- Option: "Book Again" for future stays

---

### Provider Side - Maid Service Managing Orders

**Step 1: Profile Setup**
- Location: `/provider-config`
- Business profile:
  - Business name: "Sparkle Clean Co"
  - Description: Professional cleaning service specializing in vacation rentals
  - Years in business: 8 years
  - Team size: 5 cleaners
  - Insurance: Fully insured and bonded
  - Background checks: All staff verified
  - Eco-friendly: Yes, use green products
  - Languages: English, Spanish
  - Profile photo: Company logo
  - Gallery: 8 photos of cleaned properties

**Step 2: Set Availability**
- Navigate to Availability Calendar
- Set standard availability:
  - Monday-Saturday: 8:00 AM - 6:00 PM
  - Sunday: Closed
  - Max 3 concurrent bookings per day

- Block specific dates:
  - December 24-25: Holiday closure
  - January 15-20: Team training week

- Save recurring pattern

**Step 3: Configure Service Tasks**
- Navigate to Tasks tab
- View all 36 predefined tasks
- For each task, configure:

Example - "Change bed linens":
- Offered: ✓ Yes
- Price: $8 (override default $6)
- Estimated time: 10 minutes
- Requires materials: Yes (if client doesn't provide linens)
- Notes: "Includes stripping, washing, and remaking bed"

Example - "Deep clean oven":
- Offered: ✓ Yes
- Price: $25
- Estimated time: 45 minutes
- Requires materials: Yes (special oven cleaner)
- Notes: "May require additional time for heavily soiled ovens"

- Enable 28 out of 36 tasks
- Disable tasks: Pool cleaning, window exterior, roof gutters (not offered)

**Step 4: Define Materials & Supplies**
- Navigate to Materials tab
- Add supplies:

**Cleaning Products**:
- All-purpose cleaner: Client can provide OR provider brings ($3)
- Glass cleaner: Client can provide OR provider brings ($2)
- Toilet cleaner: Provider brings ($4)
- Eco-friendly cleaner: Provider brings ($6)

**Equipment** (Always provider brings):
- Vacuum cleaner: Included in service
- Mop and bucket: Included
- Cleaning cloths: Included
- Gloves: Included

**Optional Add-ons**:
- Air freshener: $5
- Extra cleaning cloths: $3
- Specialty products: $8

**Step 5: Set Pricing**
- Navigate to Pricing tab
- Hourly rate: $45/hour
- Minimum order: $100
- Weekend surcharge: 15%
- Recurring service discount: 10%
- Last-minute booking (< 12 hours): +$25
- Travel fee: $15 fixed
- Material markup: 20%

**Step 6: Receive Order Request**
- Notification: "New cleaning service request"
- Email/SMS: Order details summary
- Login to `/provider-orders`

**Step 7: Review Order Details**
- Pending tab shows new order:

**Client**: Mike Thompson
**Property**: Modern Downtown Apartment (3.1 km away)
**Service Type**: Recurring cleaning
**Dates**: Nov 1, 3, 5, 7, 9 (5 sessions)
**Time**: 9:00 AM start time
**Duration**: ~3.5 hours estimated per session

**Tasks Selected** (14 tasks × 5 sessions):
- Bedrooms (3): Change linens, vacuum, dust
- Bathrooms (2): Full cleaning
- Kitchen: Dishes, counters, stove, floor
- Living room: Vacuum, dust, windows

**Materials**:
- Client provides: Basic cleaners
- Provider brings: Vacuum, mop, eco products

**Pricing Breakdown**:
- Task total: $165/session × 5 = $825
- Materials: $12/session × 5 = $60
- Recurring discount (10%): -$88.50
- Travel fee: $15 × 5 = $75
- Subtotal: $871.50
- Platform fee (10%): $87.15
- **Total order value: $958.65**
- **Provider earns: $784.35** (after 10% platform fee)

**Special Instructions**: "Please use eco-friendly products only. We have allergies."

**Step 8: Make Decision**
- Check team availability for those dates
- Review task list (all are offered services)
- Eco products available ✓
- Distance acceptable ✓
- Earning is good for 17.5 hours of work ✓

**Action**: Click "Accept Order"
- Message to client: "Thank you for booking with Sparkle Clean Co! We'll use our eco-friendly products. Our team is ready for your service dates."
- Order status → 'confirmed'
- Client notified

**Step 9: Wait for Payment**
- Order appears in "Confirmed" tab
- Shows "Payment pending"
- Client has 48 hours to pay
- Can send reminder if needed

**Step 10: Payment Received**
- Notification: "Payment received for Order #XYZ"
- Order moves to "Upcoming Services"
- $784.35 scheduled for payout
- Payment held in escrow until service complete

**Step 11: Prepare for First Session**
- Day before (Oct 31):
  - Assign team member: Maria (experienced cleaner)
  - Review task checklist
  - Pack supplies: Eco products, vacuum, mop
  - Confirm appointment via message to client

- Morning of Nov 1:
  - Maria receives order details on mobile
  - Drives to property (address provided)

**Step 12: Perform Service - Session 1**
- Arrive at property 9:00 AM
- Maria clicks "Start Service" in app
  - Records arrival time
  - Client notified: "Your cleaner has arrived"

- Complete tasks (check off as done):
  - ✓ Change bed linens (bedroom 1)
  - ✓ Change bed linens (bedroom 2)
  - ✓ Vacuum bedroom 1
  - ✓ Vacuum bedroom 2
  - ✓ Dust furniture (both bedrooms)
  - ✓ Clean toilet (bathroom 1)
  - ✓ Clean toilet (bathroom 2)
  - ✓ Scrub shower (bathroom 1)
  - ✓ Clean sink and counter (bathroom 2)
  - ✓ Wash dishes
  - ✓ Clean countertops
  - ✓ Clean stove
  - ✓ Mop kitchen floor
  - ✓ Vacuum living room

- Each checked task updates client's view in real-time

- Take before/after photos of key areas

**Step 13: Complete First Session**
- 12:30 PM - All tasks done
- Click "Mark as Complete"
- Add notes: "All tasks completed. Client was very pleasant. Property well-maintained."
- Upload 4 photos showing results
- Submit completion

- Order status (session 1): 'completed'
- Client notified: "Cleaning session 1 of 5 complete!"

**Step 14: Recurring Sessions 2-5**
- Nov 3: Session 2
  - Same cleaner (Maria) for consistency
  - Repeat process
  - Complete and submit

- Nov 5: Session 3
- Nov 7: Session 4
- Nov 9: Session 5 (final)

**Step 15: Final Session Complete**
- All 5 sessions marked complete
- Overall order status: 'completed'
- Client receives: "All cleaning sessions complete!"
- Provider dashboard updates earnings

**Step 16: Payment Released & Review**
- Full amount ($784.35) released from escrow
- Scheduled for payout on Friday
- Client posts review: "Sparkle Clean Co is amazing! Maria was punctual, thorough, and professional. Our apartment was spotless every time. Highly recommend! 5 stars!"
- Review appears on provider profile
- Builds reputation for future bookings

**Step 17: Opportunity for Repeat Business**
- Client books same property again next month
- Option: "Rebook Sparkle Clean Co" available
- Can request same cleaner (Maria)
- Provider builds loyal client base

---

## Database Schema Requirements

### Existing Tables (Already Implemented)
✅ `users` - User accounts with roles  
✅ `properties` - Property listings  
✅ `service_categories` - Categories (Chef, Maid, Tours, etc.)  
✅ `service_providers` - Provider profiles  
✅ `property_services` - Links properties to providers  
✅ `provider_menus` - Chef menu categories  
✅ `menu_items` - Individual menu items  
✅ `provider_task_configs` - Tasks offered by providers  
✅ `provider_materials` - Ingredients/supplies  
✅ `provider_availability` - Available time slots  
✅ `service_orders` - Main order records  
✅ `service_order_items` - Items within orders  
✅ `service_tasks` - Predefined task library  
✅ `payments` - Payment records  

### New Tables Needed

#### 1. Provider Pricing Configuration
```typescript
export const providerPricing = pgTable('provider_pricing', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar('provider_id').notNull().references(() => serviceProviders.id, { onDelete: 'cascade' }),
  hourlyRate: integer('hourly_rate'), // cents
  fixedRate: integer('fixed_rate'), // cents
  minimumOrder: integer('minimum_order').notNull().default(10000), // $100 in cents
  weekendSurcharge: integer('weekend_surcharge').default(0), // percentage × 100
  holidaySurcharge: integer('holiday_surcharge').default(0),
  lastMinuteFee: integer('last_minute_fee').default(0), // cents
  earlyBirdDiscount: integer('early_bird_discount').default(0), // percentage × 100
  recurringDiscount: integer('recurring_discount').default(0),
  travelFeeFixed: integer('travel_fee_fixed').default(0), // cents
  travelFeePerKm: integer('travel_fee_per_km').default(0), // cents per km
  materialMarkup: integer('material_markup').default(0), // percentage × 100
  currency: varchar('currency').notNull().default('USD'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});
```

#### 2. Recurring Service Configuration
```typescript
export const recurringServiceConfig = pgTable('recurring_service_config', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar('order_id').notNull().references(() => serviceOrders.id, { onDelete: 'cascade' }),
  frequency: varchar('frequency').notNull(), // 'daily', 'every_2_days', 'weekly', 'custom'
  daysOfWeek: varchar('days_of_week').array(), // ['monday', 'wednesday', 'friday']
  startDate: varchar('start_date').notNull(), // YYYY-MM-DD
  endDate: varchar('end_date').notNull(),
  totalOccurrences: integer('total_occurrences').notNull(),
  completedOccurrences: integer('completed_occurrences').default(0),
  createdAt: timestamp('created_at').defaultNow()
});
```

#### 3. Service Sessions (For Recurring Orders)
```typescript
export const serviceSessions = pgTable('service_sessions', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar('order_id').notNull().references(() => serviceOrders.id, { onDelete: 'cascade' }),
  sessionNumber: integer('session_number').notNull(), // 1, 2, 3...
  scheduledDate: varchar('scheduled_date').notNull(),
  scheduledStartTime: varchar('scheduled_start_time').notNull(),
  scheduledEndTime: varchar('scheduled_end_time').notNull(),
  actualStartTime: timestamp('actual_start_time'),
  actualEndTime: timestamp('actual_end_time'),
  status: varchar('status').notNull().default('scheduled'), // 'scheduled', 'in_progress', 'completed', 'cancelled'
  notes: text('notes'),
  completionPhotos: text('completion_photos').array(), // URLs
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at')
});
```

#### 4. Task Completion Tracking
```typescript
export const taskCompletions = pgTable('task_completions', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar('session_id').notNull().references(() => serviceSessions.id, { onDelete: 'cascade' }),
  taskId: varchar('task_id').notNull(), // Reference to service_task_configs
  completedAt: timestamp('completed_at'),
  completedBy: varchar('completed_by'), // Provider user ID
  notes: text('notes'),
  photoUrl: text('photo_url')
});
```

#### 5. Order Communication/Messages
```typescript
export const orderMessages = pgTable('order_messages', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar('order_id').notNull().references(() => serviceOrders.id, { onDelete: 'cascade' }),
  senderId: varchar('sender_id').notNull().references(() => users.id),
  senderRole: varchar('sender_role').notNull(), // 'client', 'provider'
  message: text('message').notNull(),
  isSystemMessage: boolean('is_system_message').default(false),
  createdAt: timestamp('created_at').defaultNow()
});
```

#### 6. Client Provided Materials Tracking
```typescript
export const orderClientMaterials = pgTable('order_client_materials', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar('order_id').notNull().references(() => serviceOrders.id, { onDelete: 'cascade' }),
  materialId: varchar('material_id').notNull().references(() => providerMaterials.id),
  isClientProviding: boolean('is_client_providing').notNull(),
  costAdjustment: integer('cost_adjustment').notNull().default(0) // Negative if client provides (saves money)
});
```

---

## API Endpoints Required

### Public Endpoints (No Auth Required)

```typescript
GET /api/public/properties/:id
// Returns property with service count

GET /api/public/properties/:id/services
// Returns list of service providers for property

GET /api/public/service-provider/:id
// Returns provider profile, reviews, sample menu/tasks

GET /api/public/provider/:id/availability/:month
// Returns availability calendar for specific month
// month format: 2025-11

GET /api/public/provider/:id/menus
// Returns all menu categories and items ✅ Already implemented

GET /api/public/provider/:id/tasks
// Returns all tasks offered by provider ✅ Already implemented

GET /api/public/provider/:id/materials
// Returns materials/ingredients list
```

### Authenticated Client Endpoints

```typescript
POST /api/service-orders
// Create new service order ✅ Already implemented
// Enhanced with recurring service support

GET /api/service-orders/client
// Get client's orders ✅ Already implemented

GET /api/service-orders/:id
// Get order details ✅ Already implemented
// Enhanced with session breakdown for recurring

PUT /api/service-orders/:id/cancel
// Cancel order (with cancellation policy check)

POST /api/service-orders/:id/modify
// Request order modification

GET /api/service-orders/:id/messages
// Get order communication thread

POST /api/service-orders/:id/messages
// Send message to provider

POST /api/service-orders/:id/review
// Submit review after service completion

POST /api/payment/create-intent
// Create Stripe payment intent for order

POST /api/payment/confirm
// Confirm payment success
```

### Authenticated Provider Endpoints

```typescript
GET /api/service-orders/provider
// Get provider's orders ✅ Already implemented

PUT /api/service-orders/:id/status
// Update order status (accept/decline/complete) ✅ Already implemented

POST /api/provider/availability
// Set availability slots

PUT /api/provider/availability/:id
// Update availability slot

DELETE /api/provider/availability/:id
// Remove availability slot

POST /api/provider/pricing
// Set/update pricing configuration

GET /api/provider/pricing
// Get current pricing config

POST /api/provider/menus
// Create menu category ✅ Already exists

POST /api/provider/menus/:menuId/items
// Add menu item ✅ Already exists

PUT /api/provider/menu-items/:id
// Update menu item

DELETE /api/provider/menu-items/:id
// Remove menu item

POST /api/provider/tasks/configure
// Configure which tasks are offered

POST /api/provider/materials
// Add material/ingredient

PUT /api/provider/materials/:id
// Update material

DELETE /api/provider/materials/:id
// Remove material

POST /api/service-sessions/:id/start
// Mark service session started

POST /api/service-sessions/:id/complete
// Mark session complete with photos

POST /api/task-completions
// Mark individual task complete

GET /api/provider/earnings
// Get earnings overview and history

GET /api/provider/analytics
// Get performance analytics
```

### Admin Endpoints

```typescript
POST /api/admin/properties/:id/services
// Assign service provider to property ✅ Already implemented

DELETE /api/admin/properties/:propertyId/services/:serviceProviderId
// Remove service assignment ✅ Already implemented

GET /api/admin/service-providers/pending
// Get pending provider applications

PUT /api/admin/service-providers/:id/approve
// Approve provider application

PUT /api/admin/service-providers/:id/reject
// Reject provider application

GET /api/admin/orders/disputes
// Get orders with issues/disputes

POST /api/admin/orders/:id/refund
// Process refund
```

---

## Frontend Pages & Components

### Client-Facing Pages

#### 1. Service Provider Detail Page
**Route**: `/service-provider/:id`  
**Status**: ✅ Exists but needs enhancements

**Components**:
- Provider Header (name, rating, category)
- Photo Gallery
- About Section (bio, experience, certifications)
- Availability Calendar (interactive, month view)
- Service Offerings:
  - For Chefs: Menu browser with filtering
  - For Maids: Task checklist with categories
- Pricing Information
- Reviews & Ratings Section
- "Book Now" Button (sticky on scroll)

#### 2. Service Booking Page
**Route**: `/book-service/:providerId`  
**Status**: ✅ Exists but needs enhancements

**Components**:
- Progress Indicator (Steps 1-4)
- Step 1: Date & Time Selection
  - Calendar with availability
  - Time slot picker
  - Recurring service options
- Step 2: Service Selection
  - Menu items (for chefs) OR Task checklist (for maids)
  - Real-time total calculation
- Step 3: Materials & Special Instructions
  - Materials selection (client provides vs provider brings)
  - Special instructions text area
- Step 4: Review & Confirm
  - Complete order summary
  - Pricing breakdown
  - Submit button (redirects to login if needed)

#### 3. My Service Orders Page
**Route**: `/my-service-orders`  
**Status**: ✅ Already implemented

**Enhancements Needed**:
- Add "Recurring" badge for recurring orders
- Show session progress (2 of 5 completed)
- Add calendar export button
- Add "Modify Order" functionality

#### 4. Order Details Modal/Page
**Route**: Modal or `/my-service-orders/:id`  
**Status**: Needs implementation

**Components**:
- Order Header (booking code, status badges)
- Timeline (ordered → confirmed → paid → scheduled → in progress → completed)
- Service Details (dates, times, location)
- Selected Items/Tasks Breakdown
- Materials List
- Special Instructions Display
- Pricing Breakdown
- Payment Information (status, receipt download)
- Provider Contact Section (WhatsApp, message)
- Action Buttons (context-sensitive based on status)
- Live Progress (for in-progress services)
  - Task completion checkboxes
  - Estimated completion time
  - Real-time updates

#### 5. Payment Page
**Route**: `/payment/:orderId`  
**Status**: ✅ Already implemented

**Validation Needed**:
- Ensure order belongs to logged-in user
- Check order is in 'confirmed' status
- Prevent duplicate payments

### Provider-Facing Pages

#### 1. Provider Configuration Dashboard
**Route**: `/provider-config`  
**Status**: ✅ Already implemented

**Tabs**:
1. ✅ Business Profile
2. 🆕 Availability Calendar (new tab needed)
3. ✅ Menu Management (chefs)
4. ✅ Task Configuration (maids)
5. 🆕 Materials & Supplies (needs enhancement)
6. 🆕 Pricing Settings (new tab needed)

#### 2. Provider Orders Dashboard
**Route**: `/provider-orders`  
**Status**: ✅ Already implemented

**Enhancements**:
- Add calendar view toggle
- Bulk actions (accept multiple orders)
- Filter by property
- Export orders to CSV

#### 3. Provider Earnings Page
**Route**: `/provider-earnings`  
**Status**: Needs implementation

**Components**:
- Earnings Overview Cards
- Earnings Graph (Chart.js or Recharts)
- Transaction List with Filtering
- Payout Settings Form
- Payout History Table
- Download Statements Button

#### 4. Service Session Management
**Route**: `/provider-orders/:orderId/sessions` or within order details  
**Status**: Needs implementation (for recurring orders)

**Components**:
- Session List (all occurrences)
- Each Session Card:
  - Date, time, session number
  - Status badge
  - Start/Complete buttons
  - Task checklist
  - Notes field
  - Photo upload
  - Client contact

### Shared Components

#### 1. Availability Calendar Component
**Usage**: Service provider detail page, booking page, provider config

**Features**:
- Month view with date cells
- Color-coded availability (green/yellow/red/gray)
- Click to select dates
- Multi-date selection for recurring
- Time slot selector (modal on date click)
- Mobile-responsive (swipe to change months)

**Props**:
```typescript
interface AvailabilityCalendarProps {
  providerId: string;
  mode: 'view' | 'select' | 'manage';
  selectedDates?: string[];
  onDateSelect?: (date: string) => void;
  showTimeSlots?: boolean;
}
```

#### 2. Menu Browser Component
**Usage**: Service provider detail, booking page

**Features**:
- Category tabs
- Menu item cards with photos
- Dietary filter chips
- Search functionality
- Add to order button
- Quantity selector
- Running total display

#### 3. Task Checklist Component
**Usage**: Service provider detail, booking page, service session

**Features**:
- Category sections
- Task checkboxes with details
- Price display per task
- Time estimate per task
- Select all/none buttons
- Running total calculation
- Mobile-friendly accordion layout

#### 4. Order Status Badge Component
**Usage**: Everywhere orders are displayed

**Variants**:
- Pending (yellow)
- Confirmed (blue)
- Paid (green)
- Scheduled (purple)
- In Progress (orange, animated)
- Completed (green, checkmark)
- Cancelled (red)

#### 5. Pricing Breakdown Component
**Usage**: Booking review, order details, payment page

**Features**:
- Line items with labels and amounts
- Subtotals
- Discounts (highlighted in green)
- Fees (platform, travel, materials)
- Tax calculation
- Grand total (prominent)

---

## Payment Integration

### Stripe Setup (Already Done ✅)
- Stripe account connected
- API keys configured
- `@stripe/stripe-js` and `@stripe/react-stripe-js` installed

### Payment Flow Implementation

#### Step 1: Create Payment Intent (Server-side)
**Endpoint**: `POST /api/payment/create-intent`

```typescript
app.post('/api/payment/create-intent', requireAuth, async (req: any, res) => {
  try {
    const { orderId } = req.body;
    const userId = (req.session as any).userId;
    
    // Get order and verify ownership
    const order = await storage.getServiceOrder(orderId);
    if (!order || order.clientId !== userId) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Verify order is in correct status
    if (order.status !== 'confirmed') {
      return res.status(400).json({ message: "Order is not ready for payment" });
    }
    
    // Check if payment already exists
    const existingPayment = await storage.getPaymentByOrderId(orderId);
    if (existingPayment && existingPayment.status === 'completed') {
      return res.status(400).json({ message: "Order already paid" });
    }
    
    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.totalAmount, // Amount in cents
      currency: 'usd',
      metadata: {
        orderId: order.id,
        clientId: userId,
        providerId: order.providerId
      }
    });
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: order.totalAmount
    });
  } catch (error) {
    console.error("Payment intent creation error:", error);
    res.status(500).json({ message: "Failed to create payment intent" });
  }
});
```

#### Step 2: Payment Form (Client-side)
**Component**: `PaymentForm.tsx`

```typescript
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function PaymentPage() {
  const { orderId } = useParams();
  const [clientSecret, setClientSecret] = useState('');
  
  useEffect(() => {
    // Fetch payment intent
    apiRequest(`/api/payment/create-intent`, {
      method: 'POST',
      body: JSON.stringify({ orderId })
    }).then(data => {
      setClientSecret(data.clientSecret);
    });
  }, [orderId]);
  
  if (!clientSecret) return <Loading />;
  
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm orderId={orderId} />
    </Elements>
  );
}

function PaymentForm({ orderId }: { orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    
    setIsProcessing(true);
    
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success?orderId=${orderId}`
      },
      redirect: 'if_required'
    });
    
    if (error) {
      toast.error(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Confirm payment on server
      await apiRequest(`/api/payment/confirm`, {
        method: 'POST',
        body: JSON.stringify({
          orderId,
          paymentIntentId: paymentIntent.id
        })
      });
      
      // Redirect to success page
      window.location.href = `/payment/success?orderId=${orderId}`;
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button type="submit" disabled={isProcessing || !stripe}>
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </Button>
    </form>
  );
}
```

#### Step 3: Confirm Payment (Server-side)
**Endpoint**: `POST /api/payment/confirm`

```typescript
app.post('/api/payment/confirm', requireAuth, async (req: any, res) => {
  try {
    const { orderId, paymentIntentId } = req.body;
    const userId = (req.session as any).userId;
    
    // Verify order ownership
    const order = await storage.getServiceOrder(orderId);
    if (!order || order.clientId !== userId) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: "Payment not successful" });
    }
    
    // Verify amount matches
    if (paymentIntent.amount !== order.totalAmount) {
      return res.status(400).json({ message: "Payment amount mismatch" });
    }
    
    // Update order status
    await storage.updateServiceOrderStatus(orderId, 'paid');
    
    // Create payment record
    await storage.createPayment({
      orderId: order.id,
      amount: order.totalAmount,
      stripePaymentId: paymentIntentId,
      status: 'completed'
    });
    
    // Send notifications
    await sendNotification(order.providerId, {
      type: 'order_paid',
      message: `Payment received for order ${order.bookingCode}`,
      orderId: order.id
    });
    
    res.json({ success: true, receiptUrl: `/orders/${orderId}/receipt` });
  } catch (error) {
    console.error("Payment confirmation error:", error);
    res.status(500).json({ message: "Failed to confirm payment" });
  }
});
```

---

## Implementation Checklist

### Phase 1: Database & Backend (Week 1)
- [ ] Create new database tables:
  - [ ] `provider_pricing`
  - [ ] `recurring_service_config`
  - [ ] `service_sessions`
  - [ ] `task_completions`
  - [ ] `order_messages`
  - [ ] `order_client_materials`
- [ ] Run database migration: `npm run db:push --force`
- [ ] Add storage interface methods for new tables
- [ ] Implement API endpoints for availability calendar
- [ ] Implement API endpoints for pricing configuration
- [ ] Enhance service order creation with recurring support
- [ ] Implement session management endpoints
- [ ] Add materials tracking to order creation

### Phase 2: Provider Features (Week 2)
- [ ] Build Availability Calendar tab in provider config
  - [ ] Month view calendar component
  - [ ] Time slot configuration
  - [ ] Recurring patterns
  - [ ] Save/update availability
- [ ] Build Pricing Settings tab
  - [ ] Pricing form with all fields
  - [ ] Preview calculator
  - [ ] Save pricing config
- [ ] Enhance Materials tab
  - [ ] Add/edit/delete materials
  - [ ] Link materials to menu items/tasks
  - [ ] Client provision toggle
- [ ] Enhance Provider Orders dashboard
  - [ ] Session view for recurring orders
  - [ ] Start/complete session buttons
  - [ ] Task completion tracking
  - [ ] Photo upload for completion

### Phase 3: Client Discovery & Booking (Week 3)
- [ ] Enhance Service Provider Detail page
  - [ ] Integrate availability calendar (view mode)
  - [ ] Display menu items with photos (chefs)
  - [ ] Display task checklist (maids)
  - [ ] Show pricing information
  - [ ] Reviews section
- [ ] Build/Enhance Service Booking page
  - [ ] Step-by-step wizard UI
  - [ ] Date selection with availability check
  - [ ] Recurring service configuration
  - [ ] Menu/task selection with live total
  - [ ] Materials selection
  - [ ] Special instructions
  - [ ] Order review panel
  - [ ] Submit order (with auth check)

### Phase 4: Order Management (Week 4)
- [ ] Enhance My Service Orders page
  - [ ] Recurring order display
  - [ ] Session progress indicators
  - [ ] Order actions by status
  - [ ] Filter and search
- [ ] Build Order Details modal/page
  - [ ] Complete order information
  - [ ] Timeline visualization
  - [ ] Session breakdown (recurring)
  - [ ] Live progress tracking
  - [ ] Provider contact section
  - [ ] Action buttons
- [ ] Implement order modification flow
- [ ] Implement cancellation flow with policies

### Phase 5: Service Delivery & Completion (Week 5)
- [ ] Build service session interface (provider mobile view)
  - [ ] Start service button
  - [ ] Task checklist with real-time updates
  - [ ] Notes and photos
  - [ ] Complete service button
- [ ] Build live progress view (client side)
  - [ ] Real-time task completion updates
  - [ ] Estimated time remaining
  - [ ] Contact provider button
- [ ] Implement completion workflow
  - [ ] Session completion with photos
  - [ ] Client notification
  - [ ] Review request (delayed by 1 hour)

### Phase 6: Reviews & Communication (Week 6)
- [ ] Build review submission interface
  - [ ] Star rating
  - [ ] Written review
  - [ ] Photo upload
  - [ ] Submit button
- [ ] Implement order messaging
  - [ ] Message thread view
  - [ ] Send message form
  - [ ] Real-time updates (WebSocket)
  - [ ] Notification badges
- [ ] Build WhatsApp integration
  - [ ] WhatsApp click-to-chat buttons
  - [ ] Provider phone number display (only after booking confirmed)

### Phase 7: Provider Earnings (Week 7)
- [ ] Build Provider Earnings page
  - [ ] Overview cards
  - [ ] Earnings graph (Recharts)
  - [ ] Transaction list
  - [ ] Filters and export
- [ ] Implement payout settings
  - [ ] Bank account form
  - [ ] Payout schedule selection
  - [ ] Tax information
- [ ] Build payout history view
  - [ ] Payout list
  - [ ] Download statements

### Phase 8: Testing & Refinement (Week 8)
- [ ] End-to-end testing:
  - [ ] Chef service ordering flow (one-time)
  - [ ] Chef service ordering flow (recurring)
  - [ ] Maid service ordering flow (one-time)
  - [ ] Maid service ordering flow (recurring)
  - [ ] Payment processing
  - [ ] Service delivery and completion
  - [ ] Reviews and ratings
- [ ] Mobile responsiveness testing
- [ ] Cross-browser testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation updates

---

## Success Metrics

### Client Experience
✅ Can browse services without login  
✅ Can select specific dates and times  
✅ Can choose menu items or tasks  
✅ Can specify materials/ingredients  
✅ Sees accurate pricing before booking  
✅ Can pay securely via Stripe  
✅ Receives order confirmations  
✅ Can track service progress in real-time  
✅ Can communicate with provider  
✅ Can review and rebook services  
✅ Never needs to contact support  

### Provider Experience
✅ Can set complete availability calendar  
✅ Can define all service capabilities  
✅ Can list materials and requirements  
✅ Can set dynamic pricing  
✅ Receives instant order notifications  
✅ Can accept/decline orders  
✅ Can manage service delivery  
✅ Can track task completion  
✅ Receives payments automatically  
✅ Can view earnings and analytics  

### Platform Integrity
✅ 100% dynamic data from database  
✅ Zero static or placeholder content  
✅ Real-time updates via WebSocket  
✅ Secure payment processing  
✅ Proper authorization on all endpoints  
✅ Mobile-responsive design  
✅ Fast page load times  
✅ Comprehensive error handling  

---

**This document serves as the complete specification for implementing the comprehensive service ordering system in TravelHub. All features listed must be implemented with real database operations and connected to the frontend.**
