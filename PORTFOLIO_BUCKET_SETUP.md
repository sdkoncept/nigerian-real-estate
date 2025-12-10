# Portfolio Storage Bucket Setup

## Problem
Getting error: **"failed to save portfolio item: portfolio storage bucket not found"**

## Solution
Create the `portfolio` storage bucket in Supabase Storage.

## Quick Steps

### Step 1: Create the Portfolio Bucket

1. Go to **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. Configure:
   - **Name**: `portfolio` (must match exactly, lowercase)
   - **Public**: ✅ **Yes** (check this box - portfolio images should be public)
   - **File size limit**: 5MB (or as needed)
   - **Allowed MIME types**: `image/jpeg, image/jpg, image/png`
4. Click **"Create bucket"**

### Step 2: Set Up Storage Policies

After creating the bucket, add policies so users can upload portfolio images:

1. Click on the `portfolio` bucket you just created
2. Go to the **"Policies"** tab
3. Click **"New Policy"**

#### Policy 1: Public Read (SELECT)
- **Policy Name**: `Public can view portfolio images`
- **Allowed Operation**: Select **`SELECT`**
- **Policy Definition**:
  ```
  bucket_id = 'portfolio'
  ```
- Click **"Review"** → **"Save policy"**

#### Policy 2: Authenticated Upload (INSERT) ⚠️ **CRITICAL**
- Click **"New Policy"** again
- **Policy Name**: `Authenticated users can upload portfolio images`
- **Allowed Operation**: Select **`INSERT`**
- **Policy Definition**:
  ```
  bucket_id = 'portfolio' AND auth.role() = 'authenticated'
  ```
- Click **"Review"** → **"Save policy"**

**This is the most important one!** Without this INSERT policy, uploads will fail.

#### Policy 3: Update Own Files (UPDATE)
- Click **"New Policy"** again
- **Policy Name**: `Users can update their own portfolio images`
- **Allowed Operation**: Select **`UPDATE`**
- **Policy Definition**:
  ```
  bucket_id = 'portfolio' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
  ```
- Click **"Review"** → **"Save policy"**

#### Policy 4: Delete Own Files (DELETE)
- Click **"New Policy"** again
- **Policy Name**: `Users can delete their own portfolio images`
- **Allowed Operation**: Select **`DELETE`**
- **Policy Definition**:
  ```
  bucket_id = 'portfolio' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
  ```
- Click **"Review"** → **"Save policy"**

### Step 3: Verify

After creating all 4 policies, you should see:
- ✅ 4 policies listed in the Policies tab
- ✅ All policies show as "Active"
- ✅ INSERT policy includes `auth.role() = 'authenticated'`

## Testing

After setup:
1. Try saving a portfolio item with an image
2. Should work now! ✅

## Common Issues

❌ **"Bucket not found" still appears**
- Make sure bucket name is exactly `portfolio` (lowercase, no spaces)
- Refresh the page and try again

❌ **"Permission denied" error**
- Check that INSERT policy exists and includes authentication check
- Verify user is logged in

❌ **Upload fails silently**
- Check browser console (F12) for detailed error messages
- Verify all 4 policies are created

## Need More Help?

See `STORAGE_SETUP.md` for complete storage setup instructions for all buckets.





