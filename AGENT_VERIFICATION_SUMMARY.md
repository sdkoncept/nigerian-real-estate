# Agent Verification - Quick Summary

## What Documents Do Agents Need to Submit?

Yes, agents **must submit documentation** to become verified. Here's what's required:

### Required Documents:

1. **Real Estate Agent License** (REQUIRED)
   - Must be a valid license from a recognized Nigerian regulatory body
   - Format: PDF, JPG, or PNG
   - Max size: 5MB
   - Example: `REA/LAG/2020/001` format

2. **Government-Issued ID** (REQUIRED)
   - Accepted: National ID, International Passport, Driver's License, or Voter's Card
   - Format: PDF, JPG, or PNG
   - Max size: 5MB
   - Must match the name on the account

3. **Professional Credentials** (OPTIONAL but Recommended)
   - Additional certifications or credentials
   - Format: PDF, JPG, or PNG
   - Max size: 5MB

## Verification Process:

1. **Agent registers** → Selects "Agent" as user type
2. **Completes profile** → Adds license number, bio, specialties, etc.
3. **Uploads documents** → Submits license and ID through agent dashboard
4. **Admin reviews** → Takes 2-5 business days
5. **Status updated** → Agent receives "Verified" badge or rejection notice

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

### If Approved (Verified):
- ✅ "Verified" badge appears on profile
- ✅ Can list unlimited properties
- ✅ Higher search ranking
- ✅ Access to analytics
- ✅ Builds trust with clients

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

- License expired or invalid
- Name doesn't match account
- Documents are blurry or illegible
- Wrong file format
- File corrupted or unreadable

---

**Note**: The document upload functionality is currently being implemented. Agents will be able to submit documents through the agent dashboard once complete.

