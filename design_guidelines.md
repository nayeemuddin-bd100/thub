# TravelHub Design Guidelines

## Design Approach
**Reference-Based:** Drawing from Airbnb's visual sophistication, Booking.com's trust-building patterns, and Expedia's comprehensive navigation. This platform demands aspirational imagery, intuitive discovery, and seamless multi-role experiences.

## Typography System

**Font Families:**
- Primary: Inter (Google Fonts) - body text, UI elements, forms
- Display: Playfair Display (Google Fonts) - hero headlines, section titles

**Scale & Hierarchy:**
- Hero Headlines: text-5xl md:text-7xl, font-display, font-bold
- Section Headers: text-3xl md:text-5xl, font-display, font-semibold
- Subheadings: text-xl md:text-2xl, font-primary, font-semibold
- Body Large: text-lg, font-primary, font-normal
- Body: text-base, font-primary, font-normal
- Small/Meta: text-sm, font-primary, font-medium
- Captions: text-xs, font-primary, font-normal

## Layout & Spacing System

**Container Strategy:**
- Full-width sections: w-full with max-w-7xl mx-auto px-6 md:px-8
- Content sections: max-w-6xl mx-auto
- Dashboard content: max-w-screen-2xl mx-auto

**Spacing Primitives:** Use Tailwind units: 2, 4, 6, 8, 12, 16, 24
- Component padding: p-4 md:p-6
- Section vertical spacing: py-16 md:py-24
- Card gaps: gap-6 md:gap-8
- Element margins: mb-4, mb-8, mb-12

**Grid Systems:**
- Property/Service Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- Featured Destinations: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Dashboard Metrics: grid-cols-1 md:grid-cols-2 lg:grid-cols-4

## Core Components

### Navigation
**Main Header:**
- Sticky top navigation (sticky top-0 z-50)
- Logo left, search center (prominent), user menu right
- Multi-level mega menu for Accommodations/Services/Experiences categories
- Role-based quick access (Admin/Owner dashboard links when logged in)
- Height: h-20 md:h-24

**Search Bar (Hero Variant):**
- Large, prominent search with location, dates, guests inputs side-by-side
- Rounded-full with generous padding (p-6 md:p-8)
- Floating above hero image with backdrop-blur-xl background
- Shadow-2xl for elevation

**Dashboard Sidebar:**
- Fixed left sidebar for admin/owner portals (w-64)
- Icon + label navigation items
- Collapsible on mobile (transforms to bottom nav)

### Hero Section
**Primary Hero:**
- Full viewport height (min-h-screen)
- Large background image with gradient overlay (from-black/40 via-black/20 to-transparent)
- Centered content: Display headline + tagline + prominent search bar
- Floating search card with backdrop-blur-xl, shadow-2xl
- CTA buttons with backdrop-blur-md background (DO NOT implement hover states - these auto-handle)

### Cards

**Property/Service Cards:**
- Aspect ratio 4:3 image with rounded-2xl
- Image carousel indicators (bottom dots)
- Hover: subtle scale transform (scale-105 transition)
- Content: Title (font-semibold text-lg), Location (text-sm), Rating (★ with number), Price (text-xl font-bold)
- Wishlist heart icon (top-right overlay on image)
- Padding: p-0 with p-4 content section

**Feature Cards:**
- Horizontal on desktop (grid-cols-1 lg:grid-cols-2), vertical on mobile
- Large icon (h-12 w-12) with subtle background circle
- Title (text-2xl font-display), description (text-base)
- Padding: p-8, rounded-3xl

**Testimonial Cards:**
- Profile image (rounded-full, h-16 w-16)
- Quote text (text-lg italic)
- Name + location (text-sm font-medium)
- Star rating visualization
- Padding: p-6, rounded-2xl, shadow-lg

### Forms

**Search Filters:**
- Multi-select dropdowns with checkboxes
- Range sliders for price/distance
- Date pickers with calendar view
- Inline labels above inputs
- Apply/Clear buttons at bottom

**Booking Forms:**
- Multi-step wizard (progress indicator at top)
- Guest details, payment, confirmation steps
- Sticky price summary sidebar (right column on desktop)
- Input styling: rounded-xl, p-4, border focus:ring-2

**Input Fields:**
- Consistent height: h-12 md:h-14
- Rounded: rounded-xl
- Padding: px-4
- Labels: text-sm font-medium mb-2

### Data Display

**Listings Grid:**
- Infinite scroll or pagination
- Filter sidebar (left on desktop, drawer on mobile)
- Sort dropdown (top-right)
- Results count + map toggle
- Gap: gap-6 md:gap-8

**Dashboard Tables:**
- Striped rows with hover states
- Action dropdowns (right column)
- Sortable headers with arrow indicators
- Mobile: transform to cards
- Pagination at bottom

**Booking Calendar:**
- Full month view with available/booked/selected states
- Price per night shown in cells
- Range selection highlighting
- Legend below calendar

### Overlays

**Modals:**
- Centered with backdrop-blur-sm background overlay
- Max-width: max-w-2xl for content, max-w-5xl for image galleries
- Rounded: rounded-3xl
- Close button (top-right, absolute positioning)
- Padding: p-8 md:p-12

**Image Gallery Lightbox:**
- Full-screen overlay
- Navigation arrows (left/right)
- Thumbnail strip at bottom
- Zoom capability
- Counter (3/24)

**Toast Notifications:**
- Fixed top-right positioning
- Success/error/info variants (distinct icons)
- Auto-dismiss after 5s
- Stacking: space-y-4

## Page-Specific Layouts

### Homepage
1. **Hero** with large destination image + prominent search
2. **Featured Destinations** (3-column grid, large images)
3. **Popular Properties** (4-column horizontal scroll on mobile)
4. **Why Choose TravelHub** (benefits with icons, 3-column)
5. **Experiences** (2-column split with image)
6. **Testimonials** (3-column grid)
7. **Trust Indicators** (logos of partners, certifications)
8. **CTA Section** (full-width with background image)
9. **Footer** (multi-column: Company, Support, Destinations, Newsletter signup, social links)

### Property Detail Page
- Image gallery (large main image + 4 thumbnails grid, "Show all photos" button)
- Two-column: Left (details, amenities, description), Right (sticky booking card)
- Reviews section with filter/sort
- Location map
- Similar properties carousel
- Host information card

### Dashboard (Admin/Owner)
- Left sidebar navigation
- Top metrics cards (4-column grid: Revenue, Bookings, Views, Rating)
- Charts section (revenue graph, booking calendar)
- Recent activity table
- Quick actions cards

## Icons
**Heroicons** (via CDN) - outline for UI, solid for filled states
- Search, Heart, User, Calendar, MapPin, Star, ChevronDown, Menu, X, Plus, Filter, Check, AlertCircle

## Images

**Hero Image:** Full-width scenic destination photo (tropical beach, mountain vista, or city skyline) - 1920x1080 minimum

**Property Images:** Various accommodation types (modern apartments, luxury villas, cozy cabins) - 800x600 aspect ratio

**Destination Cards:** Landmark/cityscape photos - 600x450

**Experience Images:** Activities (diving, hiking, dining) - 800x600

**Testimonial Avatars:** Professional headshots - 200x200 circular crop

**Trust Badges:** Partner logos, certification seals - vector/SVG preferred

## Animation Guidelines
**Minimal, purposeful animations only:**
- Card hover: scale transform (duration-300)
- Search bar focus: subtle shadow expansion
- Page transitions: fade-in for content loads
- NO scroll-triggered animations, parallax, or decorative motion