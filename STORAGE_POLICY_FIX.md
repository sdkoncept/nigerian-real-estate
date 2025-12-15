# Fix: Property Images Upload Error (Bucket Exists But Upload Fails)

## Problem
Agents/sellers are getting errors when trying to upload property images, even though the `property-images` bucket exists in Supabase Storage.

**Common error messages:**
- "storage bucket not found"
- "Permission denied"
- "Failed to upload image"

## Root Cause
The bucket exists, but **storage policies are missing or incorrectly configured**. Supabase Storage requires policies to allow uploads, even if the bucket exists.

## Solution: Check and Fix Storage Policies

### Step 1: Verify Bucket Exists
1. Go to **Supabase Dashboard** → **Storage**
2. Confirm `property-images` bucket exists
3. Note if it's set to **Public** or **Private** (should be **Public**)

### Step 2: Check Storage Policies
1. Click on the `property-images` bucket
2. Go to the **"Policies"** tab
3. You should see **4 policies**. If you see fewer, that's the problem!

### Step 3: Create Missing Policies

You need **4 policies** total for the `property-images` bucket:

#### Policy 1: Public Read (SELECT)
- **Policy Name**: `Public can view property images`
- **Allowed Operation**: `SELECT`
- **Policy Definition**:
  ```
  bucket_id = 'property-images'
  ```

#### Policy 2: Authenticated Upload (INSERT) ⚠️ **MOST IMPORTANT**
- **Policy Name**: `Authenticated users can upload property images`
- **Allowed Operation**: `INSERT`
- **Policy Definition**:
  ```
  bucket_id = 'property-images' AND auth.role() = 'authenticated'
  ```
**This is the critical one!** If this policy is missing, uploads will fail.

#### Policy 3: Update Own Files (UPDATE)
- **Policy Name**: `Users can update their own property images`
- **Allowed Operation**: `UPDATE`
- **Policy Definition**:
  ```
  bucket_id = 'property-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
  ```

#### Policy 4: Delete Own Files (DELETE)
- **Policy Name**: `Users can delete their own property images`
- **Allowed Operation**: `DELETE`
- **Policy Definition**:
  ```
  bucket_id = 'property-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
  ```

### Step 4: Verify Policies Are Active
1. After creating each policy, make sure it shows as **"Active"** in the Policies tab
2. Check that all 4 policies are listed
3. Verify the policy definitions match exactly (copy-paste to avoid typos)

## Quick Test

After fixing policies:
1. Have an agent/seller log in
2. Go to create property page
3. Try uploading an image
4. Should work now!

## Common Mistakes

❌ **Creating one policy with multiple operations** - Each operation needs its own policy
❌ **Typos in bucket name** - Must be exactly `property-images` (lowercase, hyphen)
❌ **Missing INSERT policy** - This is the most common cause of upload failures
❌ **Wrong policy definition** - Copy-paste the exact definitions above

## Still Not Working?

1. **Check browser console** - Look for the actual error message
2. **Verify user is authenticated** - User must be logged in
3. **Check bucket is Public** - Property images bucket should be public
4. **Verify policy syntax** - Make sure there are no extra spaces or characters

## Need More Help?

See `STORAGE_SETUP.md` for complete setup instructions with screenshots.











