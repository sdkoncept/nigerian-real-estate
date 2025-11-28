# Registration & User Types Guide

## Overview

The Nigerian Real Estate Platform supports three types of users:
- **Buyer** - People looking to purchase or rent properties
- **Seller** - Property owners who want to list their properties
- **Agent** - Licensed real estate professionals who help clients buy/sell properties

## Registration Flow

### Step 1: Choose User Type
When signing up, users select their role:
- **Buyer**: For browsing and purchasing properties
- **Seller**: For listing properties for sale/rent
- **Agent**: For professional real estate services (requires verification)

### Step 2: Create Account
Users provide:
- Full Name
- Email Address
- Password (minimum 6 characters)
- Confirm Password

### Step 3: Email Verification
After registration, users receive a verification email. They must verify their email before full access.

### Step 4: Profile Completion
- **Buyers**: Can immediately browse properties
- **Sellers**: Can list properties (may require verification for premium listings)
- **Agents**: Must complete agent profile and submit verification documents

## Agent Registration & Verification

### How Agent Registration Works

1. **Initial Registration**
   - Agent selects "Agent" as user type during signup
   - Account is created with `user_type: 'agent'`
   - Agent receives email verification link

2. **Agent Profile Creation**
   - After email verification, agent must complete their profile:
     - License number (REA license)
     - Company name (if applicable)
     - Bio/description
     - Specialties (e.g., "Luxury Homes", "Commercial Properties")
     - Years of experience
     - Contact information
     - Location (city, state)

3. **Verification Documents**
   - Agent must submit:
     - Real Estate Agent License
     - Government-issued ID
     - Professional credentials
   - Documents are stored in `verifications` table

4. **Admin Review**
   - Admin reviews submitted documents
   - Admin can approve or reject verification
   - Status updated in `agents.verification_status`:
     - `pending` - Awaiting review
     - `verified` - Approved and verified
     - `rejected` - Rejected (with reason)

5. **Verification Benefits**
   - Verified agents get:
     - "Verified" badge on profile
     - Higher search ranking
     - Ability to list premium properties
     - Access to analytics dashboard
     - Trust from potential clients

## User Type Differences

### Buyer
- **Purpose**: Find and purchase/rent properties
- **Features**:
  - Browse all properties
  - Search and filter listings
  - Save favorites
  - Contact agents/property owners
  - Submit property inquiries
  - Leave reviews

### Seller
- **Purpose**: List properties for sale/rent
- **Features**:
  - Create property listings
  - Upload property photos
  - Manage listings
  - Respond to inquiries
  - View property analytics
  - Accept/reject offers

### Agent
- **Purpose**: Help clients buy/sell properties
- **Features**:
  - All buyer features
  - Create agent profile
  - List properties on behalf of clients
  - Manage client relationships
  - View performance metrics
  - Receive client inquiries
  - Build reputation through reviews

## Database Schema

### Profiles Table
```sql
user_type: 'buyer' | 'seller' | 'agent' | 'admin'
```

### Agents Table
```sql
- user_id (links to profiles.id)
- license_number
- company_name
- bio
- specialties (array)
- years_experience
- properties_sold
- rating
- verification_status: 'pending' | 'verified' | 'rejected'
```

### Verifications Table
```sql
- entity_type: 'agent' | 'property'
- entity_id
- document_type
- document_url
- status: 'pending' | 'approved' | 'rejected'
```

## Frontend Pages

### Registration
- **Route**: `/signup`
- **Features**:
  - User type selection (Buyer/Seller/Agent)
  - Form validation
  - Password strength check
  - Success message with next steps

### Agent Pages
- **Agents Listing**: `/agents`
  - Search and filter agents
  - Sort by rating, experience, properties sold
  - Filter by state, verification status
  - View agent cards with key info

- **Agent Detail**: `/agents/:id`
  - Full agent profile
  - Statistics (experience, properties sold, rating)
  - Specialties
  - Contact information
  - Contact form
  - Verification badge

### About Page
- **Route**: `/about`
- **Content**:
  - Platform mission
  - How it works
  - Why choose us
  - Contact information

## Backend Integration

### Signup Endpoint
When a user signs up:
1. Supabase Auth creates user account
2. Trigger creates profile with `user_type`
3. If `user_type = 'agent'`, agent record created with `verification_status = 'pending'`

### Agent Verification Endpoint
- `POST /api/admin/verifications/approve` - Approve agent
- `POST /api/admin/verifications/reject` - Reject agent
- Updates `agents.verification_status` automatically

## Security Features

1. **Email Verification**: Required for all users
2. **Agent Verification**: Required for agents to be listed
3. **Document Upload**: Secure storage of verification documents
4. **Admin Review**: Manual review of agent documents
5. **Rate Limiting**: Prevents spam registrations

## Next Steps for Agents

After registration, agents should:
1. Verify email address
2. Complete agent profile
3. Upload verification documents
4. Wait for admin approval
5. Start listing properties and helping clients

## Support

For questions about registration or verification:
- Email: info@nigerianrealestate.ng
- Check the About page for more information
- Contact support through the platform

