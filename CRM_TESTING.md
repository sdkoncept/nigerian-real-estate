# CRM Feature Testing Checklist

## Pre-Testing Setup

### 1. Database Setup (REQUIRED)
- [ ] Run `database/CRM_SCHEMA.sql` in Supabase SQL Editor
- [ ] Verify tables created: `leads`, `lead_activities`, `lead_notes`
- [ ] Verify views created: `lead_pipeline_stats`, `lead_conversion_funnel`, `recent_lead_activities`
- [ ] Verify RLS policies are active

### 2. Test User Setup
- [ ] Create test agent account
- [ ] Create test property with agent_id
- [ ] Create test buyer account

## Testing Scenarios

### Test 1: Automatic Lead Creation
**Steps:**
1. Log in as test buyer
2. Navigate to a property (with agent_id)
3. Click "Contact Owner" or "Send Message"
4. Fill out contact form and send message
5. Log in as agent
6. Go to `/agent/leads`

**Expected Result:**
- ✅ Lead should appear in "New" status
- ✅ Lead should be linked to the property
- ✅ Lead should have buyer's name, email, phone
- ✅ Activity should show "Initial inquiry message"

### Test 2: Lead Management Page
**Steps:**
1. Log in as agent
2. Navigate to `/agent/leads`
3. View lead statistics
4. Filter leads by status
5. Search for a lead

**Expected Result:**
- ✅ Stats show correct counts
- ✅ Filters work correctly
- ✅ Search finds leads by name/email/phone
- ✅ Lead cards display correctly

### Test 3: Lead Details & Status Update
**Steps:**
1. Click on a lead
2. View lead details
3. Change status from "new" to "contacted"
4. Change status to "viewing_scheduled"
5. Change status to "closed_won"

**Expected Result:**
- ✅ Lead details show correctly
- ✅ Status updates save
- ✅ Status changes reflect in list
- ✅ Closed leads show closed_at timestamp

### Test 4: Activity Creation
**Steps:**
1. Select a lead
2. Click "+ Activity"
3. Create a "Call" activity
4. Create a "Meeting" activity with scheduled time
5. View activity timeline

**Expected Result:**
- ✅ Activities save correctly
- ✅ Activities appear in timeline
- ✅ Scheduled activities show future date
- ✅ Completed activities show completed_at

### Test 5: Note Creation
**Steps:**
1. Select a lead
2. Click "+ Note"
3. Add a note
4. Mark as important
5. Add a private note
6. View notes section

**Expected Result:**
- ✅ Notes save correctly
- ✅ Important notes show ⭐ indicator
- ✅ Notes appear in chronological order
- ✅ Private notes are visible (for future: only to creator)

### Test 6: Manual Lead Creation
**Steps:**
1. Click "+ Add Lead"
2. Fill in lead form
3. Set source, interest type, priority
4. Create lead

**Expected Result:**
- ✅ Lead created successfully
- ✅ Lead appears in list
- ✅ All fields saved correctly
- ✅ first_contact_at and last_contact_at set

### Test 7: Agent Dashboard Integration
**Steps:**
1. Log in as agent
2. Go to `/agent/dashboard`
3. View CRM section in sidebar
4. Check lead statistics
5. Click "Manage Leads →"

**Expected Result:**
- ✅ Stats show correct numbers
- ✅ Link navigates to `/agent/leads`
- ✅ Stats update when leads change

### Test 8: Duplicate Lead Prevention
**Steps:**
1. Send message about same property twice (same email)
2. Check leads list

**Expected Result:**
- ✅ Only one lead created
- ✅ last_contact_at updated on second message
- ✅ New activity added to existing lead

### Test 9: Dark Mode
**Steps:**
1. Toggle dark mode
2. Navigate to `/agent/leads`
3. Check all components

**Expected Result:**
- ✅ All text readable
- ✅ Cards have proper backgrounds
- ✅ Modals work in dark mode
- ✅ Forms styled correctly

### Test 10: Mobile Responsiveness
**Steps:**
1. Open on mobile device
2. Test lead management page
3. Test modals
4. Test forms

**Expected Result:**
- ✅ Layout responsive
- ✅ Modals work on mobile
- ✅ Forms usable on mobile
- ✅ Touch targets adequate

## Known Issues / Limitations

1. **Pipeline View**: Currently list-based, not kanban board (future enhancement)
2. **Drag-and-Drop**: Not implemented yet (future enhancement)
3. **Email Automation**: Not implemented (future enhancement)
4. **Bulk Actions**: Not implemented (future enhancement)

## Performance Testing

- [ ] Load 100+ leads - should be fast
- [ ] Search with many leads - should be responsive
- [ ] Filter with many leads - should be fast
- [ ] Activity timeline with many activities - should load quickly

## Security Testing

- [ ] Agent A cannot see Agent B's leads
- [ ] Non-agents cannot access `/agent/leads`
- [ ] RLS policies working correctly
- [ ] Private notes visible only to creator (if implemented)

## Browser Testing

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

