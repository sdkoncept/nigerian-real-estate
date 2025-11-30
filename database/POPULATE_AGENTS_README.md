# Populate Verified Agents Script

## Overview

This script populates your platform with verified agents across major Nigerian locations. It creates agent records for existing agent profiles in your database.

## Prerequisites

**IMPORTANT**: You must have agent accounts created first!

### Step 1: Create Agent Accounts

Before running this script, you need to create at least 8 agent accounts:

1. **Sign up on your platform** (or use Supabase Auth)
2. **Select "Agent" as user type** during registration
3. **Verify email** (if required)
4. **Complete profile** with name, email, phone

**Minimum Required**: At least 1 agent account (the script will use all available agent profiles)

**Recommended**: 8 agent accounts to get all the different agent profiles

### Quick Way to Create Agent Accounts

You can create agent accounts through:
- Your platform's signup page (select "Agent")
- Supabase Auth dashboard (create users, then update profiles table)

## How to Use

### Step 1: Verify You Have Agent Profiles

Run this query first to check how many agent profiles you have:

```sql
SELECT id, full_name, email, user_type 
FROM public.profiles 
WHERE user_type = 'agent';
```

If you see 0 results, you need to create agent accounts first (see Prerequisites above).

### Step 2: Run the Populate Script

**Option A: Simple Version (Recommended)**
1. Open **Supabase SQL Editor**
2. Copy and paste the entire contents of `POPULATE_AGENTS_SIMPLE.sql`
3. Click **"Run"** (or press Ctrl+Enter)

**Option B: Full Version**
1. Open **Supabase SQL Editor**
2. Copy and paste the entire contents of `POPULATE_AGENTS.sql`
3. Click **"Run"** (or press Ctrl+Enter)

### Step 3: Verify Results

After running, you should see:
- A list of all verified agents created
- Summary statistics (total agents, average rating, etc.)

## What Gets Created

The script creates agent records with:

### Agent Profiles (8 Different Agents)

1. **Lagos Agent** - Prime Realty Solutions
   - 10 years experience
   - 245 properties sold
   - 4.8 rating (89 reviews)
   - Specialties: Luxury Homes, Commercial Properties, Land Sales

2. **Abuja Agent** - Capital Properties Ltd
   - 8 years experience
   - 180 properties sold
   - 4.6 rating (67 reviews)
   - Specialties: Residential, Commercial, Property Management

3. **Port Harcourt Agent** - Port Harcourt Real Estate
   - 6 years experience
   - 120 properties sold
   - 4.7 rating (45 reviews)
   - Specialties: Residential, Land Development, Property Investment

4. **Lagos (Lekki) Agent** - Lekki Properties Group
   - 5 years experience
   - 95 properties sold
   - 4.9 rating (52 reviews)
   - Specialties: Luxury Homes, Beachfront Properties, Penthouses

5. **Benin City Agent** - Benin City Realty
   - 7 years experience
   - 150 properties sold
   - 4.5 rating (38 reviews)
   - Specialties: Residential, Land Sales, Property Valuation

6. **Delta State Agent** - Delta Properties Consultants
   - 9 years experience
   - 200 properties sold
   - 4.7 rating (72 reviews)
   - Specialties: Residential, Commercial, Property Investment

7. **Kaduna Agent** - Kaduna Real Estate Services
   - 6 years experience
   - 110 properties sold
   - 4.6 rating (42 reviews)
   - Specialties: Residential, Commercial, Property Management

8. **Kano Agent** - Kano Real Estate Services
   - 7 years experience
   - 150 properties sold
   - 4.5 rating (38 reviews)
   - Specialties: Residential, Commercial, Industrial

## Features

- ✅ All agents marked as **verified**
- ✅ Realistic experience levels (5-10 years)
- ✅ Realistic property sales numbers (95-245 properties)
- ✅ High ratings (4.5-4.9 stars)
- ✅ Review counts (38-89 reviews)
- ✅ Professional company names
- ✅ Detailed bios
- ✅ Specialties arrays
- ✅ All agents active

## How It Works

The script:
1. Finds all agent profiles in the `profiles` table
2. Checks if they already have agent records (skips if they do)
3. Creates agent records with different data based on profile order
4. Sets verification_status to 'verified'
5. Assigns realistic stats (experience, sales, ratings)

## Troubleshooting

### Error: "No agent profiles found"
- **Solution**: Create agent accounts first (see Prerequisites)

### Error: "duplicate key value violates unique constraint"
- **Solution**: The agent already has a record. The script skips existing agents automatically.

### Error: "null value in column 'user_id' violates not-null constraint"
- **Solution**: Make sure your agent profiles have valid IDs. Check that profiles exist.

### Agents not showing on agent page
- Check that `is_active = true` for all agents
- Verify RLS policies allow viewing agents
- Check that `verification_status = 'verified'`

## Customization

You can modify the script to:
- Change company names
- Adjust experience levels
- Modify ratings and review counts
- Add more specialties
- Change bio descriptions

## Next Steps

After populating agents:
1. Review agents in your admin dashboard
2. Link agents to properties (update property agent_id)
3. Add agent avatars (update profiles.avatar_url)
4. Add location data to profiles if needed
5. Create reviews for agents to make them more realistic

---

**Note**: The script will only create agents for existing agent profiles. If you have fewer than 8 agent accounts, it will create agents for all available profiles with appropriate data.

