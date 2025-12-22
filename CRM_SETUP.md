# CRM Feature Setup Guide

## Overview

The CRM (Customer Relationship Management) feature allows agents to manage leads, track activities, and close more deals. Leads are automatically created when users inquire about properties.

## Database Setup

### Step 1: Run the CRM Schema

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `database/CRM_SCHEMA.sql`
4. Click "Run"
5. ✅ You should see: "Success. No rows returned"

### What Gets Created

1. **leads** table - Stores all lead information
2. **lead_activities** table - Tracks all interactions with leads
3. **lead_notes** table - Stores notes about leads
4. **Views** - Analytics views for pipeline stats and conversion funnels
5. **RLS Policies** - Security policies for agent access

## Features

### 1. Automatic Lead Creation
- When a user sends a message about a property, a lead is automatically created
- Leads are linked to the property and agent
- Duplicate leads (same email + property) are updated instead of duplicated

### 2. Lead Management Page
- **Route**: `/agent/leads`
- **Features**:
  - View all leads with filtering by status
  - Search leads by name, email, or phone
  - Update lead status (new → contacted → viewing → closed)
  - View lead details and timeline
  - Add activities (calls, meetings, viewings)
  - Add notes (important, private)

### 3. Lead Status Pipeline
- **New** - Just created, not contacted yet
- **Contacted** - Initial contact made
- **Viewing Scheduled** - Property viewing scheduled
- **Viewing Completed** - Viewing done
- **Offer Made** - Offer submitted
- **Negotiating** - In negotiations
- **Closed Won** - Deal closed successfully
- **Closed Lost** - Lead didn't convert
- **Nurturing** - Long-term follow-up

### 4. Activity Tracking
- Track calls, emails, meetings, viewings
- Schedule future activities
- View activity timeline per lead
- Link activities to properties

### 5. Notes System
- Add notes to leads
- Mark notes as important
- Private notes (only visible to you)
- Full note history

### 6. Lead Scoring
- Automatic lead scoring (0-100)
- Based on engagement and interest
- Priority levels (low, medium, high, urgent)

## Usage

### For Agents

1. **Access CRM**:
   - Go to Agent Dashboard
   - Click "Manage Leads" in sidebar
   - Or navigate to `/agent/leads`

2. **View Leads**:
   - All leads are automatically created from property inquiries
   - Filter by status using the buttons
   - Search by name, email, or phone

3. **Manage a Lead**:
   - Click on a lead to view details
   - Update status using the dropdown
   - Add activities (calls, meetings, etc.)
   - Add notes for important information

4. **Create Manual Lead**:
   - Click "+ Add Lead" button
   - Fill in lead information
   - Set priority and source

### For Property Owners

- When someone inquires about your property, a lead is automatically created
- You can view and manage leads in the CRM
- Track all interactions with potential buyers/renters

## Integration Points

### Automatic Lead Creation
- **PropertyDetailPage**: When user sends message → creates lead
- **Messages**: All property inquiries become leads
- **Contact Forms**: Can be extended to create leads

### Agent Dashboard Integration
- Shows lead statistics (total, new, contacted, closed)
- Quick link to manage leads
- Real-time updates

## Analytics

The CRM includes built-in analytics views:

1. **lead_pipeline_stats** - Pipeline statistics per agent
2. **lead_conversion_funnel** - Conversion funnel metrics
3. **recent_lead_activities** - Recent activity feed

## Security

- Row Level Security (RLS) enabled
- Agents can only see their own leads
- Admins can view all leads
- Private notes are protected

## Next Steps (Future Enhancements)

1. **Email Automation** - Auto-responders and drip campaigns
2. **Task Management** - Follow-up reminders and deadlines
3. **Advanced Reporting** - Conversion rates, lead sources
4. **Pipeline Visualization** - Drag-and-drop kanban board
5. **Integration** - WhatsApp, email, calendar sync
6. **Mobile App** - CRM on the go

## Troubleshooting

### Leads Not Creating Automatically
- Check that property has an `agent_id` set
- Verify agent exists in `agents` table
- Check browser console for errors

### Can't See Leads
- Verify you're logged in as an agent
- Check that agent profile exists
- Ensure RLS policies are active

### Database Errors
- Run `database/CRM_SCHEMA.sql` again
- Check Supabase logs for detailed errors
- Verify all foreign key relationships

