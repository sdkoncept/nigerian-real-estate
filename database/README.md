# Database Schema Documentation

## Overview

This directory contains the complete database schema for the Nigerian Real Estate Platform, designed to run on Supabase (PostgreSQL).

## Files

- `schema.sql` - Complete database schema with tables, indexes, RLS policies, triggers, and functions

## Quick Setup

1. **Open Supabase Dashboard**
   - Go to your project at https://supabase.com
   - Navigate to **SQL Editor** (left sidebar)

2. **Run the Schema**
   - Click **"New query"**
   - Open `database/schema.sql` from this project
   - Copy ALL contents (Ctrl+A, Ctrl+C)
   - Paste into Supabase SQL Editor
   - Click **"Run"** (or press Ctrl+Enter)
   - ✅ You should see: "Success. No rows returned"

## What Gets Created

### Tables

1. **profiles** - User profiles extending Supabase auth.users
   - Links to authentication system
   - Stores user type (buyer, seller, agent, admin)
   - Auto-created when user signs up

2. **agents** - Real estate agent information
   - License numbers, company info
   - Ratings and reviews
   - Verification status

3. **properties** - Property listings
   - Full property details (location, price, features)
   - Images, amenities, coordinates
   - Verification and featured status

4. **favorites** - User favorite properties
   - Many-to-many relationship between users and properties

5. **reviews** - Reviews for properties or agents
   - Ratings (1-5 stars)
   - Comments
   - Verification status

6. **contacts** - Contact/message submissions
   - For property inquiries
   - Agent communications

7. **verifications** - Document verification system
   - For agents and properties
   - Admin review workflow

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Policies** configured for:
  - Public read access where appropriate
  - User-specific data protection
  - Agent and admin permissions

### Automation

- **Triggers** for automatic `updated_at` timestamps
- **Function** to auto-create profiles on user signup
- **Constraints** to ensure data integrity

### Performance

- **Indexes** on frequently queried columns:
  - Location (city, state)
  - Property type and listing type
  - Price ranges
  - Foreign keys

## Schema Features

### Data Integrity

- Foreign key constraints
- Check constraints (e.g., ratings 1-5, valid enum values)
- Unique constraints (e.g., user favorites)
- NOT NULL constraints where required

### Nigerian Real Estate Specific

- Currency defaults to NGN (Nigerian Naira)
- State and city fields for Nigerian locations
- Support for both sqft and sqm measurements
- Property types relevant to Nigerian market

## Verification

After running the schema, verify:

1. **Tables exist**: Check Supabase Dashboard → Table Editor
2. **RLS is enabled**: All tables should show RLS enabled
3. **Triggers work**: Sign up a test user, check if profile is auto-created
4. **Policies work**: Test read/write permissions

## Troubleshooting

**"Policy already exists"**
- Policies use `CREATE POLICY` which will fail if they exist
- Drop existing policies first or modify to use `CREATE POLICY IF NOT EXISTS`

**"Trigger already exists"**
- The schema uses `DROP TRIGGER IF EXISTS` for the auth trigger
- Other triggers may need manual cleanup if re-running

**"Function already exists"**
- Functions use `CREATE OR REPLACE` so they're safe to re-run

## Next Steps

After schema setup:
1. Configure environment variables (see `SUPABASE_SETUP.md`)
2. Test authentication flow
3. Seed sample data (optional)
4. Configure email templates in Supabase Dashboard

---

**Schema Version**: 1.0  
**Last Updated**: 2024  
**Compatible with**: Supabase (PostgreSQL 15+)

