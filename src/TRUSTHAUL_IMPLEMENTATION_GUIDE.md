# TrustHaul Freight - Complete Implementation Documentation

**Generated:** June 5, 2026  
**Platform:** Base44  
**Domain:** app.trusthaulfreight.com  
**App Type:** Freight Marketplace (PWA - Progressive Web App)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Entity Schemas](#entity-schemas)
4. [Backend Functions](#backend-functions)
5. [Frontend Pages](#frontend-pages)
6. [Components](#components)
7. [Configuration Files](#configuration-files)
8. [Step-by-Step Setup Guide](#step-by-step-setup-guide)
9. [Image Assets](#image-assets)
10. [Deployment Instructions](#deployment-instructions)

---

## Project Overview

**TrustHaul Freight** is a subscription-based freight marketplace that connects independent drivers/carriers with shippers/organizations. The platform eliminates expensive dispatchers by enabling direct connections between verified drivers and shippers.

### Key Features
- ✅ Driver/Shipper onboarding with verification
- ✅ Load board with search & filtering
- ✅ Bidding system for drivers
- ✅ Real-time messaging between users
- ✅ GPS tracking integration points
- ✅ Review & rating system
- ✅ Subscription management (Stripe)
- ✅ Automated email notifications
- ✅ Mobile-responsive PWA

### Business Model
- **Shippers:** Free to post unlimited loads
- **Drivers:** Subscription-based ($69.99-$149.99/month)
- **Revenue:** Driver subscriptions only (no commission on loads)

---

## Architecture & Tech Stack

### Frontend
- **Framework:** React 18.2.0
- **Routing:** React Router DOM 6.26.0
- **State Management:** TanStack Query 5.84.1
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Styling:** Tailwind CSS 3.x with CSS variables
- **Animations:** Framer Motion 11.16.4
- **Forms:** React Hook Form 7.54.2
- **Date Handling:** date-fns 3.6.0
- **Icons:** Lucide React 0.475.0

### Backend
- **Runtime:** Deno Deploy
- **SDK:** Base44 SDK 0.8.31
- **Payment Processing:** Stripe 14.21.0
- **Email:** Base44 Core SendEmail integration

### Database (Base44 Entities)
- Load, LoadBid, DriverProfile, ShipperProfile, Message, Review, PaymentHold, User

### Key Integrations
- **Stripe:** Subscription checkout & payment processing
- **Base44 Core:** File upload, email sending, LLM (if needed)
- **PWA:** Progressive Web App for mobile installation

---

## Entity Schemas

### 1. Load Entity
**File:** `entities/Load.json`

```json
{
  "name": "Load",
  "type": "object",
  "properties": {
    "shipper_id": {"type": "string", "description": "ShipperProfile id"},
    "shipper_user_id": {"type": "string"},
    "title": {"type": "string"},
    "description": {"type": "string"},
    "pickup_address": {"type": "string"},
    "pickup_city": {"type": "string"},
    "pickup_state": {"type": "string"},
    "pickup_zip": {"type": "string"},
    "pickup_latitude": {"type": "number"},
    "pickup_longitude": {"type": "number"},
    "delivery_address": {"type": "string"},
    "delivery_city": {"type": "string"},
    "delivery_state": {"type": "string"},
    "delivery_zip": {"type": "string"},
    "delivery_latitude": {"type": "number"},
    "delivery_longitude": {"type": "number"},
    "pickup_date": {"type": "string", "format": "date"},
    "delivery_date": {"type": "string", "format": "date"},
    "truck_type_required": {
      "type": "string",
      "enum": ["flatbed", "dry_van", "reefer", "box_truck", "step_deck", "hotshot", "tanker", "car_hauler", "any"]
    },
    "weight_lbs": {"type": "number"},
    "dimensions": {"type": "string"},
    "commodity": {"type": "string"},
    "special_instructions": {"type": "string"},
    "budget": {"type": "number"},
    "distance_miles": {"type": "number"},
    "status": {
      "type": "string",
      "enum": ["posted", "assigned", "in_transit", "delivered", "cancelled", "disputed"],
      "default": "posted"
    },
    "assigned_driver_id": {"type": "string"},
    "assigned_driver_user_id": {"type": "string"},
    "current_latitude": {"type": "number"},
    "current_longitude": {"type": "number"},
    "last_location_update": {"type": "string", "format": "date-time"},
    "pickup_confirmed": {"type": "boolean", "default": false},
    "delivery_confirmed": {"type": "boolean", "default": false},
    "is_urgent": {"type": "boolean", "default": false},
    "commitment_deposit": {"type": "number", "description": "Shipper commitment deposit to prevent false pickups"}
  },
  "required": ["title", "pickup_city", "pickup_state", "delivery_city", "delivery_state"]
}
```

**Built-in Fields (auto-generated):**
- `id`, `created_date`, `updated_date`, `created_by_id`

---

### 2. DriverProfile Entity
**File:** `entities/DriverProfile.json`

```json
{
  "name": "DriverProfile",
  "type": "object",
  "properties": {
    "user_id": {"type": "string", "description": "Reference to the User entity"},
    "company_name": {"type": "string"},
    "mc_number": {"type": "string", "description": "Motor Carrier number"},
    "dot_number": {"type": "string", "description": "DOT number"},
    "cdl_number": {"type": "string", "description": "CDL license number"},
    "cdl_state": {"type": "string"},
    "truck_types": {
      "type": "array",
      "items": {"type": "string"},
      "description": "Types of trucks: flatbed, dry_van, reefer, box_truck, step_deck, hotshot, tanker, car_hauler"
    },
    "years_experience": {"type": "number"},
    "insurance_url": {"type": "string", "description": "Uploaded insurance document"},
    "cdl_url": {"type": "string", "description": "Uploaded CDL document"},
    "profile_photo_url": {"type": "string"},
    "bio": {"type": "string"},
    "phone": {"type": "string"},
    "city": {"type": "string"},
    "state": {"type": "string"},
    "zip_code": {"type": "string"},
    "latitude": {"type": "number"},
    "longitude": {"type": "number"},
    "service_radius_miles": {"type": "number", "default": 500},
    "verification_status": {
      "type": "string",
      "enum": ["pending", "verified", "rejected"],
      "default": "pending"
    },
    "background_check_status": {
      "type": "string",
      "enum": ["not_started", "pending", "passed", "failed"],
      "default": "not_started"
    },
    "subscription_plan": {
      "type": "string",
      "enum": ["none", "basic", "premium"],
      "default": "none"
    },
    "subscription_expires": {"type": "string", "format": "date"},
    "posts_remaining": {"type": "number", "default": 0},
    "average_rating": {"type": "number", "default": 0},
    "total_reviews": {"type": "number", "default": 0},
    "total_loads_completed": {"type": "number", "default": 0},
    "is_active": {"type": "boolean", "default": true}
  },
  "required": ["user_id"]
}
```

---

### 3. ShipperProfile Entity
**File:** `entities/ShipperProfile.json`

```json
{
  "name": "ShipperProfile",
  "type": "object",
  "properties": {
    "user_id": {"type": "string"},
    "company_name": {"type": "string"},
    "business_type": {
      "type": "string",
      "enum": ["individual", "small_business", "corporation", "non_profit", "government"],
      "default": "small_business"
    },
    "ein_number": {"type": "string", "description": "Employer Identification Number"},
    "profile_photo_url": {"type": "string"},
    "bio": {"type": "string"},
    "phone": {"type": "string"},
    "address": {"type": "string"},
    "city": {"type": "string"},
    "state": {"type": "string"},
    "zip_code": {"type": "string"},
    "latitude": {"type": "number"},
    "longitude": {"type": "number"},
    "verification_status": {
      "type": "string",
      "enum": ["pending", "verified", "rejected"],
      "default": "pending"
    },
    "payment_verified": {"type": "boolean", "default": false},
    "average_rating": {"type": "number", "default": 0},
    "total_reviews": {"type": "number", "default": 0},
    "total_loads_posted": {"type": "number", "default": 0},
    "is_active": {"type": "boolean", "default": true}
  },
  "required": ["user_id"]
}
```

---

### 4. LoadBid Entity
**File:** `entities/LoadBid.json`

```json
{
  "name": "LoadBid",
  "type": "object",
  "properties": {
    "load_id": {"type": "string"},
    "driver_id": {"type": "string"},
    "driver_user_id": {"type": "string"},
    "bid_amount": {"type": "number"},
    "message": {"type": "string"},
    "estimated_pickup": {"type": "string", "format": "date"},
    "estimated_delivery": {"type": "string", "format": "date"},
    "status": {
      "type": "string",
      "enum": ["pending", "accepted", "rejected", "withdrawn"],
      "default": "pending"
    },
    "description": {"type": "string", "maxLength": 1000, "description": "Optional additional details about this bid"}
  },
  "required": ["load_id", "driver_id", "bid_amount"]
}
```

---

### 5. Message Entity
**File:** `entities/Message.json`

```json
{
  "name": "Message",
  "type": "object",
  "properties": {
    "conversation_id": {"type": "string", "description": "Format: smaller_user_id_larger_user_id"},
    "sender_id": {"type": "string"},
    "receiver_id": {"type": "string"},
    "content": {"type": "string"},
    "load_id": {"type": "string", "description": "Optional reference to a load"},
    "is_read": {"type": "boolean", "default": false}
  },
  "required": ["conversation_id", "sender_id", "receiver_id", "content"]
}
```

---

### 6. Review Entity
**File:** `entities/Review.json`

```json
{
  "name": "Review",
  "type": "object",
  "properties": {
    "load_id": {"type": "string"},
    "reviewer_id": {"type": "string"},
    "reviewee_id": {"type": "string"},
    "reviewer_type": {"type": "string", "enum": ["driver", "shipper"]},
    "rating": {"type": "number", "description": "1-5 stars"},
    "comment": {"type": "string"},
    "professionalism": {"type": "number"},
    "communication": {"type": "number"},
    "timeliness": {"type": "number"},
    "description": {"type": "string", "maxLength": 1000, "description": "Optional extended description for this review"}
  },
  "required": ["load_id", "reviewer_id", "reviewee_id", "rating"]
}
```

---

### 7. PaymentHold Entity
**File:** `entities/PaymentHold.json`

```json
{
  "name": "PaymentHold",
  "type": "object",
  "properties": {
    "load_id": {"type": "string", "description": "Reference to the Load"},
    "shipper_user_id": {"type": "string"},
    "driver_user_id": {"type": "string"},
    "amount": {"type": "number", "description": "Held payment amount in USD"},
    "platform_fee": {"type": "number", "description": "Platform fee (5% of amount)"},
    "driver_payout": {"type": "number", "description": "Amount released to driver after platform fee"},
    "status": {
      "type": "string",
      "enum": ["held", "released", "refunded", "disputed"],
      "default": "held",
      "description": "held = payment collected but not released; released = sent to driver on pickup; refunded = returned to shipper"
    },
    "held_at": {"type": "string", "format": "date-time"},
    "released_at": {"type": "string", "format": "date-time"},
    "stripe_payment_intent_id": {"type": "string", "description": "Stripe PaymentIntent ID for tracking"},
    "notes": {"type": "string"}
  },
  "required": ["load_id", "shipper_user_id", "amount"]
}
```

---

## Backend Functions

### 1. createCheckoutSession
**File:** `functions/createCheckoutSession.js`

**Purpose:** Create Stripe checkout sessions for driver subscriptions.

```javascript
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

const PRICE_IDS = {
  basic: 'price_1TegZzLYYooVgTUXvB1yWXDe',
  premium: 'price_1TegZzLYYooVgTUXmoReuiZ1',
};

Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, successUrl, cancelUrl } = await req.json();
    const priceId = PRICE_IDS[plan];

    if (!priceId) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: user.email,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_id: user.id,
        plan,
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

**Usage (Frontend):**
```javascript
import { base44 } from '@/api/base44Client';

const response = await base44.functions.invoke('createCheckoutSession', {
  plan: 'basic', // or 'premium'
  successUrl: window.location.origin + '/subscription?success=true',
  cancelUrl: window.location.origin + '/subscription?cancelled=true',
});

// Redirect to Stripe checkout
window.location.href = response.data.url;
```

---

### 2. sendLoadNotification
**File:** `functions/sendLoadNotification.js`

**Purpose:** Automated email notifications for load status changes and bid updates.

**Triggered by:** Entity automation on Load & LoadBid updates.

```javascript
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { event, data, old_data } = body;

    const entityName = event?.entity_name;
    const eventType = event?.type;

    // --- LOAD status changes ---
    if (entityName === 'Load' && eventType === 'update') {
      const load = data;
      const oldStatus = old_data?.status;
      const newStatus = load?.status;

      if (!load || oldStatus === newStatus) return Response.json({ skipped: true });

      // Notify shipper when driver is assigned
      if (newStatus === 'assigned' && load.shipper_user_id) {
        const users = await base44.asServiceRole.entities.User.filter({ id: load.shipper_user_id });
        const shipper = users[0];
        if (shipper?.email) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: shipper.email,
            subject: `✅ Driver Assigned to "${load.title}"`,
            body: `Hi ${shipper.full_name || 'there'},\n\nA driver has been assigned to your load "${load.title}" (${load.pickup_city}, ${load.pickup_state} → ${load.delivery_city}, ${load.delivery_state}).\n\nLog in to TrustHaul to view details and track your shipment.\n\n— TrustHaul Team`,
          });
          console.log(`[INFO] Notified shipper ${shipper.email} of driver assignment`);
        }
      }

      // Notify driver when load is in_transit
      if (newStatus === 'in_transit' && load.assigned_driver_user_id) {
        const users = await base44.asServiceRole.entities.User.filter({ id: load.assigned_driver_user_id });
        const driver = users[0];
        if (driver?.email) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: driver.email,
            subject: `🚛 Load Pickup Confirmed: "${load.title}"`,
            body: `Hi ${driver.full_name || 'there'},\n\nPickup has been confirmed for load "${load.title}". You're now marked as in transit.\n\nDeliver to: ${load.delivery_city}, ${load.delivery_state}\n\n— TrustHaul Team`,
          });
          console.log(`[INFO] Notified driver ${driver.email} of in_transit status`);
        }
      }

      // Notify shipper when delivered
      if (newStatus === 'delivered' && load.shipper_user_id) {
        const users = await base44.asServiceRole.entities.User.filter({ id: load.shipper_user_id });
        const shipper = users[0];
        if (shipper?.email) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: shipper.email,
            subject: `📦 Load Delivered: "${load.title}"`,
            body: `Hi ${shipper.full_name || 'there'},\n\nYour load "${load.title}" has been successfully delivered!\n\nPlease log in to TrustHaul to leave a review for your driver.\n\n— TrustHaul Team`,
          });
          console.log(`[INFO] Notified shipper ${shipper.email} of delivery`);
        }
      }

      // Notify driver when load is cancelled
      if (newStatus === 'cancelled' && load.assigned_driver_user_id) {
        const users = await base44.asServiceRole.entities.User.filter({ id: load.assigned_driver_user_id });
        const driver = users[0];
        if (driver?.email) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: driver.email,
            subject: `❌ Load Cancelled: "${load.title}"`,
            body: `Hi ${driver.full_name || 'there'},\n\nUnfortunately the load "${load.title}" has been cancelled by the shipper.\n\nCheck the load board for new available loads.\n\n— TrustHaul Team`,
          });
          console.log(`[INFO] Notified driver ${driver.email} of cancellation`);
        }
      }
    }

    // --- NEW BID submitted ---
    if (entityName === 'LoadBid' && eventType === 'create') {
      const bid = data;
      if (!bid?.load_id) return Response.json({ skipped: true });

      const loads = await base44.asServiceRole.entities.Load.filter({ id: bid.load_id });
      const load = loads[0];
      if (!load?.shipper_user_id) return Response.json({ skipped: true });

      const users = await base44.asServiceRole.entities.User.filter({ id: load.shipper_user_id });
      const shipper = users[0];
      if (shipper?.email) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: shipper.email,
          subject: `💰 New Bid on "${load.title}"`,
          body: `Hi ${shipper.full_name || 'there'},\n\nYou have a new bid of $${bid.bid_amount} on your load "${load.title}".\n\n${bid.message ? `Driver's message: "${bid.message}"\n\n` : ''}Log in to TrustHaul to review and accept the bid.\n\n— TrustHaul Team`,
        });
        console.log(`[INFO] Notified shipper ${shipper.email} of new bid`);
      }
    }

    // --- BID accepted/rejected ---
    if (entityName === 'LoadBid' && eventType === 'update') {
      const bid = data;
      const oldBidStatus = old_data?.status;
      const newBidStatus = bid?.status;

      if (!bid?.driver_user_id || oldBidStatus === newBidStatus) return Response.json({ skipped: true });

      const users = await base44.asServiceRole.entities.User.filter({ id: bid.driver_user_id });
      const driver = users[0];

      if (driver?.email && newBidStatus === 'accepted') {
        const loads = await base44.asServiceRole.entities.Load.filter({ id: bid.load_id });
        const load = loads[0];
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: driver.email,
          subject: `🎉 Your Bid Was Accepted!`,
          body: `Hi ${driver.full_name || 'there'},\n\nCongratulations! Your bid of $${bid.bid_amount} was accepted for load "${load?.title || bid.load_id}".\n\nPickup: ${load?.pickup_city}, ${load?.pickup_state}\nDelivery: ${load?.delivery_city}, ${load?.delivery_state}\n\nLog in to TrustHaul to coordinate with the shipper.\n\n— TrustHaul Team`,
        });
        console.log(`[INFO] Notified driver ${driver.email} of accepted bid`);
      }

      if (driver?.email && newBidStatus === 'rejected') {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: driver.email,
          subject: `Bid Update on Load`,
          body: `Hi ${driver.full_name || 'there'},\n\nYour bid of $${bid.bid_amount} was not selected for this load. Keep browsing the load board for new opportunities!\n\n— TrustHaul Team`,
        });
        console.log(`[INFO] Notified driver ${driver.email} of rejected bid`);
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('[ERROR] sendLoadNotification:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

**Automation Setup:**
1. Go to **Dashboard → Automations**
2. Create entity automation:
   - **Name:** Load Status Notifications
   - **Entity:** Load
   - **Events:** update
   - **Function:** sendLoadNotification
3. Create entity automation:
   - **Name:** Bid Notifications
   - **Entity:** LoadBid
   - **Events:** create, update
   - **Function:** sendLoadNotification

---

## Frontend Pages

### Page Structure
All pages are located in `pages/` directory and use React Router for navigation.

### Route Mapping (App.jsx)
```javascript
// Public routes (no auth required)
/ → Landing
/about → About
/contact → Contact
/login → Login
/register → Register
/forgot-password → ForgotPassword
/reset-password → ResetPassword

// Protected routes (auth required)
/dashboard → Dashboard
/loads → LoadBoard
/post-load → PostLoad
/load/:id → LoadDetail
/my-loads → MyLoads
/messages → Messages
/profile → Profile
/reviews → Reviews
/subscription → Subscription
/calendar → LoadCalendar
/report → ShipmentReport
/bulk-loads → BulkLoads
/onboarding → Onboarding
```

---

### Key Pages Implementation

#### 1. Landing Page (`pages/Landing.jsx`)
**Purpose:** Public marketing page with hero, features, pricing, testimonials.

**Components Used:**
- HeroSection
- HowItWorks
- PricingSection
- TestimonialsSection
- TrustSection
- TruckTypes
- FooterSection

---

#### 2. Dashboard (`pages/Dashboard.jsx`)
**Purpose:** User's main dashboard with stats, active loads, quick links.

**Key Features:**
- Driver vs Shipper conditional rendering
- Real-time load updates via entity subscriptions
- Subscription status alerts
- Verification status prompts
- Pull-to-refresh support

**Data Sources:**
- `my-loads`: Filtered by user's account type
- `recent-loads`: Latest posted loads (drivers only)
- `my-profile`: DriverProfile or ShipperProfile

---

#### 3. Onboarding (`pages/Onboarding.jsx`)
**Purpose:** Multi-step wizard for new user profile creation.

**Steps:**
1. **Account Type Selection:** Driver vs Shipper
2. **Basic Information:** Company name, phone, location, bio
3. **Role-Specific Details:**
   - **Drivers:** MC/DOT numbers, CDL, truck types, document uploads
   - **Shippers:** Business type, EIN (optional)

**File Upload:**
```javascript
const handleFileUpload = async (e, field) => {
  const file = e.target.files[0];
  if (!file) return;
  const { file_url } = await base44.integrations.Core.UploadFile({ file });
  updateForm(field, file_url);
};
```

**Completion:**
- Creates DriverProfile or ShipperProfile entity
- Updates User entity: `account_type`, `role`, `onboarding_complete`, `profile_id`
- Redirects to `/dashboard`

---

#### 4. LoadBoard (`pages/LoadBoard.jsx`)
**Purpose:** Browse available loads with search & filters.

**Filters:**
- Search by title/commodity
- Truck type
- Pickup/delivery states
- Sort by: budget, distance, urgency, date

**Card Display:**
- Route (pickup → delivery)
- Budget & $/mile calculation
- Truck type required
- Weight, commodity
- Dates
- Urgent badge

---

#### 5. LoadDetail (`pages/LoadDetail.jsx`)
**Purpose:** Detailed load view with bidding system.

**Driver Actions:**
- Place bid (amount + message)
- View competing bids (if shipper)
- Accept/reject bids (if shipper)
- Confirm pickup → Mark delivered (if assigned driver)
- Message shipper

**Shipper Actions:**
- View all bids
- Accept bid (auto-assigns driver, rejects others)
- Cancel load
- Message bidders

**Real-time Features:**
- Bid mutations with optimistic UI updates
- Status change mutations
- Auto-invalidation on entity changes

---

#### 6. Messages (`pages/Messages.jsx`)
**Purpose:** Real-time messaging between users.

**Features:**
- Conversation list (sorted by last message)
- Auto-scroll to latest message
- 5-second polling for new messages
- Conversation ID format: `smaller_user_id_larger_user_id`
- URL parameter support: `/messages?user=USER_ID`

**Message Structure:**
```javascript
{
  conversation_id: "user1_user2",
  sender_id: "user1",
  receiver_id: "user2",
  content: "Message text",
  load_id: "optional_load_reference",
  is_read: false
}
```

---

#### 7. Profile (`pages/Profile.jsx`)
**Purpose:** View/edit user profile with photo upload.

**Editable Fields:**
- Company name, phone, location
- Bio
- Driver-specific: MC/DOT, CDL, years experience
- Profile photo upload

**Delete Account:**
- Removes DriverProfile/ShipperProfile
- Logs out user
- Confirmation dialog

---

#### 8. Reviews (`pages/Reviews.jsx`)
**Purpose:** View received reviews & leave reviews for completed loads.

**Features:**
- Star rating component
- Rating breakdown visualization
- Pending reviews for delivered loads
- One review per load

**Review Entity:**
```javascript
{
  load_id: "...",
  reviewer_id: "...",
  reviewee_id: "...",
  reviewer_type: "driver" | "shipper",
  rating: 5, // 1-5
  comment: "...",
  professionalism: 5,
  communication: 5,
  timeliness: 5
}
```

---

#### 9. Subscription (`pages/Subscription.jsx`)
**Purpose:** Manage driver subscription plans.

**Plans:**
- **Starter:** $69.99/month (price_1TegZzLYYooVgTUXvB1yWXDe)
- **Pro Hauler:** $149.99/month (price_1TegZzLYYooVgTUXmoReuiZ1)

**Checkout Flow:**
1. User selects plan
2. Calls `createCheckoutSession` backend function
3. Redirects to Stripe Checkout
4. Returns to `/subscription?success=true`
5. (Future) Webhook updates DriverProfile.subscription_plan

**Shipper Display:**
- "Always Free" messaging
- No subscription options shown

---

## Components

### Layout Components

#### 1. AppLayout (`components/layout/AppLayout.jsx`)
```javascript
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
```

#### 2. DashboardLayout (`components/layout/DashboardLayout.jsx`)
**Features:**
- Sidebar navigation (desktop)
- Bottom tab bar (mobile)
- Scroll position preservation
- Conditional links by account type

---

### UI Components (shadcn/ui)
All located in `components/ui/`:
- accordion, alert, alert-dialog, aspect-ratio
- avatar, badge, breadcrumb, button
- calendar, card, carousel, chart
- checkbox, collapsible, command
- context-menu, dialog, drawer
- dropdown-menu, form, hover-card
- input, input-otp, label
- menubar, navigation-menu, pagination
- popover, progress, radio-group
- resizable, scroll-area, select
- separator, sheet, sidebar
- skeleton, slider, sonner
- switch, table, tabs, textarea
- toast, toaster, toggle, toggle-group
- tooltip

---

### Landing Page Components

#### HeroSection (`components/landing/HeroSection.jsx`)
- Full-screen hero with background image
- Animated entrance (Framer Motion)
- CTA buttons
- Trust badges

#### HowItWorks (`components/landing/HowItWorks.jsx`)
- 4-step process cards
- Icons: UserPlus, Search, Handshake, Star
- Scroll-triggered animations

#### PricingSection (`components/landing/PricingSection.jsx`)
- 2 driver plans (Starter, Pro Hauler)
- Feature comparison
- Shipper "Always Free" callout
- Stripe integration CTAs

---

### Shared Components

#### PullToRefresh (`components/PullToRefresh.jsx`)
**Purpose:** Mobile-friendly pull-to-refresh for dashboards.

#### MobileSelect (`components/MobileSelect.jsx`)
**Purpose:** Native select dropdowns for mobile devices.

#### ProtectedRoute (`components/ProtectedRoute.jsx`)
**Purpose:** Route guard for authenticated pages.

#### AuthLayout (`components/AuthLayout.jsx`)
**Purpose:** Layout wrapper for auth pages.

---

## Configuration Files

### 1. App.jsx (Router)
**File:** `App.jsx`

```javascript
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import { useDarkMode } from '@/hooks/useDarkMode';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';

// Auth pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// Layouts
import AppLayout from '@/components/layout/AppLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Public pages
import Landing from '@/pages/Landing';

// Protected pages
import Onboarding from '@/pages/Onboarding';
import Dashboard from '@/pages/Dashboard';
import LoadBoard from '@/pages/LoadBoard';
import PostLoad from '@/pages/PostLoad';
import LoadDetail from '@/pages/LoadDetail';
import MyLoads from '@/pages/MyLoads';
import Messages from '@/pages/Messages';
import Profile from '@/pages/Profile';
import Reviews from '@/pages/Reviews';
import Subscription from '@/pages/Subscription';
import LoadCalendar from '@/pages/LoadCalendar';
import ShipmentReport from '@/pages/ShipmentReport';
import BulkLoads from '@/pages/BulkLoads';
import About from '@/pages/About';
import Contact from '@/pages/Contact';

// ... AuthenticatedApp component with routes ...

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
```

---

### 2. index.css (Design Tokens)
**File:** `index.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 210 20% 98%;
    --foreground: 222 47% 11%;
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    --primary: 220 65% 14%;
    --primary-foreground: 0 0% 100%;
    --secondary: 24 95% 53%;
    --secondary-foreground: 0 0% 100%;
    --muted: 210 20% 95%;
    --muted-foreground: 215 16% 47%;
    --accent: 24 95% 53%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 214 20% 90%;
    --input: 214 20% 90%;
    --ring: 220 56% 20%;
    --radius: 0.75rem;
    --font-heading: 'Space Grotesk', sans-serif;
    --font-body: 'Inter', sans-serif;
    --font-display: 'Space Grotesk', sans-serif;
    --sidebar-background: 220 65% 10%;
    --sidebar-foreground: 210 20% 95%;
    --sidebar-primary: 24 95% 53%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 220 56% 25%;
    --sidebar-accent-foreground: 210 20% 95%;
    --sidebar-border: 220 56% 25%;
    --sidebar-ring: 24 95% 53%;
  }

  .dark {
    /* Dark mode tokens */
  }
}
```

---

### 3. tailwind.config.js
**File:** `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			// ... all semantic color tokens
  		},
  		fontFamily: {
  			heading: ['var(--font-heading)'],
  			body: ['var(--font-body)'],
  			display: ['var(--font-display)'],
  			mono: ['var(--font-mono)']
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
```

---

### 4. lib/AuthContext.jsx
**File:** `lib/AuthContext.jsx`

**Purpose:** Global authentication state management.

**Key Methods:**
- `useAuth()` hook for accessing user state
- `checkAppState()` - validates app settings & auth
- `logout(shouldRedirect)` - clears session
- `navigateToLogin()` - redirects to login page

---

### 5. lib/query-client.js
**File:** `lib/query-client.js`

```javascript
import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});
```

---

## Step-by-Step Setup Guide

### Phase 1: Initial Setup (Completed ✅)

1. **Create Base44 App**
   - Go to base44.com
   - Create new app: "TrustHaul Freight"
   - Select blank template

2. **Configure Domain**
   - DNS: CNAME `app` → `base44.onrender.com` (Cloudflare proxied)
   - Base44 Dashboard → Publish → Custom Domain → `app.trusthaulfreight.com`
   - Wait for DNS propagation (5-48 hours)

3. **Set Environment Variables**
   - `STRIPE_SECRET_KEY` (from Stripe Dashboard)
   - `STRIPE_PUBLISHABLE_KEY` (from Stripe Dashboard)
   - `BASE44_APP_ID` (auto-set by platform)

---

### Phase 2: Entity Creation (Completed ✅)

1. **Create Entities** (in order):
   - Load
   - DriverProfile
   - ShipperProfile
   - LoadBid
   - Message
   - Review
   - PaymentHold

2. **Entity Relationships:**
   - `Load.shipper_user_id` → User.id
   - `Load.assigned_driver_user_id` → User.id
   - `DriverProfile.user_id` → User.id
   - `ShipperProfile.user_id` → User.id
   - `LoadBid.load_id` → Load.id
   - `LoadBid.driver_user_id` → User.id
   - `Message.conversation_id` → computed from User ids
   - `Review.load_id` → Load.id
   - `PaymentHold.load_id` → Load.id

---

### Phase 3: Backend Functions (Completed ✅)

1. **createCheckoutSession**
   - Creates Stripe checkout sessions
   - Price IDs: basic, premium
   - Metadata includes base44_app_id for tracking

2. **sendLoadNotification**
   - Handles Load & LoadBid entity events
   - Sends emails via Core.SendEmail
   - Triggers: status changes, new bids, bid accept/reject

3. **Setup Automations:**
   - Load.update → sendLoadNotification
   - LoadBid.create → sendLoadNotification
   - LoadBid.update → sendLoadNotification

---

### Phase 4: Frontend Development (Completed ✅)

1. **Create Pages:**
   - Landing (public)
   - About, Contact (public)
   - Auth pages (Login, Register, ForgotPassword, ResetPassword)
   - Dashboard, LoadBoard, PostLoad, LoadDetail
   - MyLoads, Messages, Profile, Reviews
   - Subscription, LoadCalendar, ShipmentReport, BulkLoads
   - Onboarding

2. **Create Components:**
   - Layouts: AppLayout, DashboardLayout
   - Landing: HeroSection, HowItWorks, PricingSection, TestimonialsSection, TrustSection, TruckTypes, FooterSection
   - Shared: PullToRefresh, MobileSelect, ProtectedRoute

3. **Configure Router:**
   - Update App.jsx with all routes
   - Wrap protected routes with ProtectedRoute
   - Add AppLayout to public routes
   - Add DashboardLayout to authenticated routes

---

### Phase 5: Stripe Integration (Completed ✅)

1. **Create Stripe Products:**
   - Product: "Starter Plan" → Price: $69.99/month
   - Product: "Pro Hauler Plan" → Price: $149.99/month

2. **Get Price IDs:**
   - `price_1TegZzLYYooVgTUXvB1yWXDe` (basic)
   - `price_1TegZzLYYooVgTUXmoReuiZ1` (premium)

3. **Update createCheckoutSession:**
   - Add price IDs to PRICE_IDS constant

4. **Test Checkout:**
   - Use test card: 4242 4242 4242 4242
   - Verify redirect to success/cancel URLs

---

### Phase 6: Testing & QA (Recommended)

1. **User Flows:**
   - ✅ Register as driver → complete onboarding → browse loads → place bid
   - ✅ Register as shipper → complete onboarding → post load → accept bid
   - ✅ Messaging between users
   - ✅ Load status transitions (posted → assigned → in_transit → delivered)
   - ✅ Review submission after delivery
   - ✅ Subscription checkout

2. **Email Notifications:**
   - ✅ Driver assigned → shipper notified
   - ✅ Load in transit → driver notified
   - ✅ Load delivered → shipper notified
   - ✅ Load cancelled → driver notified
   - ✅ New bid → shipper notified
   - ✅ Bid accepted/rejected → driver notified

3. **Mobile Testing:**
   - ✅ Responsive layouts (mobile, tablet, desktop)
   - ✅ Bottom navigation on mobile
   - ✅ Pull-to-refresh on dashboards
   - ✅ Touch targets (min 44px)

---

## Image Assets

### Logo
**URL:** `https://media.base44.com/images/public/6a205a947ba9f6044bb35d02/a4a1a4c9e_generated_image.png`
**Usage:** Navbar, favicon, social sharing

### Landing Page Images
1. **Hero Background:** `https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1920&q=80`
2. **Hero Feature Image:** `https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80`

### Usage in Code
```javascript
// Navbar logo
const LOGO_URL = "https://media.base44.com/images/public/6a205a947ba9f6044bb35d02/a4a1a4c9e_generated_image.png";

// Hero background
backgroundImage: "url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1920&q=80')"
```

---

## Deployment Instructions

### 1. Publish to Custom Domain

**DNS Configuration (Cloudflare):**
```
Type: CNAME
Name: app
Target: base44.onrender.com
Proxy: ☁️ ON (Proxied)
```

**Base44 Dashboard:**
1. Go to **Publish → Custom Domain**
2. Enter: `app.trusthaulfreight.com`
3. Click **Verify Domain**
4. Wait for verification (5 min - 48 hours)

**Troubleshooting:**
- Clear browser cache (Ctrl/Cmd + Shift + Delete)
- Check DNS propagation: `nslookup app.trusthaulfreight.com`
- Verify Cloudflare CNAME is proxied (orange cloud)

---

### 2. Enable PWA (Progressive Web App)

**Base44 Dashboard → Publish → Mobile App:**
1. Set app name: "TrustHaul Freight"
2. Upload app icon (512x512 PNG)
3. Set theme color: `#0f172a` (primary)
4. Enable PWA features
5. Publish

**User Installation:**
- **iOS Safari:** Share → "Add to Home Screen"
- **Android Chrome:** Auto-prompt or menu → "Install App"

---

### 3. Go Live with Stripe

**Current Status:** Test Mode (Sandbox)

**To Enable Live Payments:**
1. Go to **Dashboard → Integrations**
2. Click Stripe integration
3. Replace test keys with live keys:
   - Live Secret Key
   - Live Publishable Key
4. Update Price IDs to live versions (if different)

**Test Card (Sandbox Only):**
- Card: 4242 4242 4242 4242
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

---

### 4. Production Checklist

- [ ] DNS verified & domain working
- [ ] Stripe live keys configured
- [ ] All entity automations active
- [ ] Email notifications tested
- [ ] User flows tested (driver & shipper)
- [ ] Mobile responsiveness verified
- [ ] PWA installation tested
- [ ] Error monitoring enabled (Base44 logs)
- [ ] Backup/export strategy in place

---

## Support & Maintenance

### Base44 Resources
- **Dashboard:** base44.com → Your App
- **Code Editor:** Dashboard → Code
- **Logs:** Dashboard → Code → Functions → [function name] → Logs
- **Entity Data:** Dashboard → Data → [Entity Name]

### Common Issues

**1. Domain Not Resolving:**
- Wait 24-48 hours for DNS propagation
- Clear DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)
- Check Cloudflare proxy status

**2. Stripe Checkout Fails:**
- Verify STRIPE_SECRET_KEY is set
- Check function logs for errors
- Ensure price IDs are valid

**3. Email Notifications Not Sending:**
- Verify automation is active
- Check function logs for errors
- Ensure user emails are valid

**4. Entity Permissions:**
- Default: Users can only access their own records
- Admin users: Full access to all records
- Custom RLS: Configure in Dashboard → Data → [Entity] → Security

---

## File Structure Summary

```
src/
├── App.jsx (router configuration)
├── index.css (design tokens)
├── index.html (HTML template)
├── main.jsx (React entry point)
├── api/
│   └── base44Client.js (SDK initialization)
├── components/
│   ├── ui/ (shadcn components)
│   ├── landing/ (marketing components)
│   └── layout/ (AppLayout, DashboardLayout)
├── entities/
│   ├── Load.json
│   ├── DriverProfile.json
│   ├── ShipperProfile.json
│   ├── LoadBid.json
│   ├── Message.json
│   ├── Review.json
│   └── PaymentHold.json
├── functions/
│   ├── createCheckoutSession.js
│   └── sendLoadNotification.js
├── hooks/
│   ├── useDarkMode.js
│   └── use-mobile.jsx
├── lib/
│   ├── AuthContext.jsx
│   ├── query-client.js
│   ├── utils.js
│   └── PageNotFound.jsx
├── pages/
│   ├── Landing.jsx
│   ├── About.jsx
│   ├── Contact.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── ForgotPassword.jsx
│   ├── ResetPassword.jsx
│   ├── Onboarding.jsx
│   ├── Dashboard.jsx
│   ├── LoadBoard.jsx
│   ├── PostLoad.jsx
│   ├── LoadDetail.jsx
│   ├── MyLoads.jsx
│   ├── Messages.jsx
│   ├── Profile.jsx
│   ├── Reviews.jsx
│   ├── Subscription.jsx
│   ├── LoadCalendar.jsx
│   ├── ShipmentReport.jsx
│   └── BulkLoads.jsx
└── tailwind.config.js
```

---

## Next Steps & Recommendations

### Immediate Actions
1. ✅ Domain setup (completed - DNS configured)
2. ⏳ Wait for DNS propagation
3. ⏳ Test full user flows in production
4. ⏳ Set up Stripe live mode when ready

### Future Enhancements
1. **GPS Tracking Integration:**
   - Add real-time location updates to Load entity
   - Map view in LoadDetail page
   - Driver location tracking automation

2. **Payment Holds:**
   - Implement commitment deposit collection
   - PaymentHold entity automation
   - Stripe Connect for driver payouts

3. **Background Checks:**
   - Integration with Checkr or similar
   - Automated verification_status updates
   - Badge display on profiles

4. **Analytics:**
   - Track key metrics (loads posted, bids placed, conversions)
   - Dashboard charts for drivers/shippers
   - Admin analytics for platform health

5. **Mobile App:**
   - PWA is sufficient for launch
   - Consider React Native wrapper later
   - Push notifications via Base44

---

## Credits & Attribution

**Built with:**
- Base44 Platform (base44.com)
- React 18
- Tailwind CSS
- shadcn/ui
- Stripe
- Deno Deploy

**Generated:** June 5, 2026  
**Version:** 1.0.0  
**Domain:** app.trusthaulfreight.com

---

**END OF DOCUMENTATION**