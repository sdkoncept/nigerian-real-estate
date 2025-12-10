# Quick Fix: Storage Bucket Not Found Error

## Problem
Agents are getting the error: **"storage bucket not found"** when trying to upload images/documents.

## Solution
The `verification-documents` storage bucket needs to be created in your Supabase project.

## Quick Steps to Fix

### 1. Create the Storage Bucket

1. Go to your **Supabase Dashboard**: https://app.supabase.com
2. Select your project
3. Navigate to **Storage** (left sidebar)
4. Click **"New bucket"** button
5. Configure the bucket:
   - **Name**: `verification-documents` (must match exactly, including hyphens)
   - **Public**: ❌ **No** (unchecked - keep it private for security)
   - **File size limit**: 10MB (or leave default)
   - **Allowed MIME types**: `image/jpeg, image/jpg, image/png, application/pdf`
6. Click **"Create bucket"**

### 2. Set Up Storage Policies

After creating the bucket, you need to add policies so agents can upload files:

1. Click on the `verification-documents` bucket you just created
2. Go to the **"Policies"** tab
3. Click **"New Policy"**

#### Policy 1: Allow Authenticated Users to Upload
- **Policy Name**: `Authenticated users can upload verification documents`
- **Allowed Operation**: Select **`INSERT`**
- **Policy Definition**:
  ```
  bucket_id = 'verification-documents' AND auth.role() = 'authenticated'
  ```
- Click **"Review"** → **"Save policy"**

#### Policy 2: Allow Users to View Their Own Documents
- Click **"New Policy"** again
- **Policy Name**: `Users can view their own verification documents`
- **Allowed Operation**: Select **`SELECT`**
- **Policy Definition**:
  ```
  bucket_id = 'verification-documents' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
  ```
- Click **"Review"** → **"Save policy"**

#### Policy 3: Allow Users to Update Their Own Documents
- Click **"New Policy"** again
- **Policy Name**: `Users can update their own verification documents`
- **Allowed Operation**: Select **`UPDATE`**
- **Policy Definition**:
  ```
  bucket_id = 'verification-documents' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
  ```
- Click **"Review"** → **"Save policy"**

#### Policy 4: Allow Users to Delete Their Own Documents
- Click **"New Policy"** again
- **Policy Name**: `Users can delete their own verification documents`
- **Allowed Operation**: Select **`DELETE`**
- **Policy Definition**:
  ```
  bucket_id = 'verification-documents' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
  ```
- Click **"Review"** → **"Save policy"**

### 3. Verify Property Images Bucket (If Needed)

If sellers are also having issues uploading property images, make sure the `property-images` bucket exists:

1. Go to **Storage** → Check if `property-images` bucket exists
2. If not, create it:
   - **Name**: `property-images`
   - **Public**: ✅ **Yes** (checked)
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/jpeg, image/jpg, image/png`
3. See `STORAGE_SETUP.md` for policies setup

## Testing

After creating the bucket and policies:

1. Have an agent log in
2. Go to `/agent/dashboard`
3. Try uploading a verification document
4. The upload should now work!

## Common Issues

**"Bucket not found" still appears:**
- Make sure the bucket name is exactly `verification-documents` (lowercase, with hyphens)
- Refresh the page and try again
- Check that you're in the correct Supabase project

**"Permission denied" error:**
- Make sure you created all 4 policies
- Verify the policies are saved (check the Policies tab)
- Make sure the user is logged in

**"File too large" error:**
- Check the bucket's file size limit
- Reduce the file size before uploading

## Need More Help?

See `STORAGE_SETUP.md` for complete storage setup instructions with detailed screenshots and troubleshooting.








