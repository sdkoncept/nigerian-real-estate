# Agent Verification - Quick Summary

## What Documents Do Agents Need to Submit?

Yes, agents **must submit documentation** to become verified. Here's what's required:

### Required Documents:

1. **Government-Issued ID** (REQUIRED)
   - Accepted: National ID, International Passport, Driver's License, or Voter's Card
   - Format: PDF, JPG, or PNG
   - Max size: 5MB
   - Must match the name on the account

2. **Business Registration** (OPTIONAL but Recommended)
   - CAC Certificate or Business Name Registration
   - Helps achieve "Trusted Agent" status
   - Format: PDF, JPG, or PNG
   - Max size: 5MB

3. **Professional Credentials** (OPTIONAL)
   - Additional certifications or credentials
   - Format: PDF, JPG, or PNG
   - Max size: 5MB

## Verification Process:

1. **Agent registers** → Selects "Agent" as user type
2. **Verifies email & phone** → Completes basic verification
3. **Completes profile** → Adds bio, specialties, experience, etc.
4. **Uploads ID document** → Submits government-issued ID through agent dashboard
5. **Optional: Uploads business registration** → For "Trusted Agent" status
6. **Admin reviews** → Takes 2-5 business days
7. **Status updated** → Agent receives verification badge (tiered system)

## Current Implementation Status:

✅ **Database Schema**: Ready
- `verifications` table exists
- `agents.verification_status` field exists
- RLS policies configured

✅ **Backend Routes**: Partially ready
- Admin routes for approving/rejecting verifications exist
- Agent routes for submitting documents need to be added (see `backend/src/routes/agent.ts`)

⏳ **Frontend**: Not yet implemented
- Agent dashboard for uploading documents needs to be created
- Document upload form needs to be built

## What Happens After Submission?

### If Approved (Tiered Verification System):
**Platform Verified** (Level 1):
- ✅ ID verified badge appears on profile
- ✅ Can list properties
- ✅ Basic verification status

**Trusted Agent** (Level 2):
- ✅ "Trusted Agent" badge
- ✅ Higher search ranking
- ✅ More client trust

**Premium Agent** (Level 3):
- ✅ "Premium Agent" badge
- ✅ Priority placement
- ✅ Unlimited listings
- ✅ Access to analytics

**Top Agent** (Level 4):
- ✅ "Top Agent" badge
- ✅ Featured placement
- ✅ Maximum visibility
- ✅ All premium features

### If Rejected:
- ❌ Receives email with rejection reason
- ❌ Can resubmit with corrected documents
- ⚠️ Limited platform access until verified

## File Requirements:

- **Formats**: JPG, JPEG, PNG, PDF
- **Max Size**: 5MB per file
- **Total Size**: 15MB (all documents combined)
- **Quality**: Must be clear and readable (not blurry)

## Common Rejection Reasons:

- ID expired or invalid
- Name doesn't match account
- Documents are blurry or illegible
- Wrong file format
- File corrupted or unreadable
- ID not clearly visible

---

**Note**: The document upload functionality is currently being implemented. Agents will be able to submit documents through the agent dashboard once complete.

