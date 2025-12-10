# Fix: Duplicate Storage Policies

## Problem
You have **8 policies** (4 duplicates) for the `property-images` bucket. You should have exactly **4 policies** with specific definitions.

## Solution: Clean Up and Fix Policies

### Step 1: Delete All Existing Policies
1. Go to **Supabase Dashboard** → **Storage**
2. Click on the `property-images` bucket
3. Go to the **"Policies"** tab
4. **Delete ALL existing policies** (click the delete/trash icon for each one)
5. Confirm deletion

### Step 2: Create 4 Correct Policies (One at a Time)

**⚠️ IMPORTANT**: Create each policy separately. Don't combine them!

#### Policy 1: Public Read (SELECT)
1. Click **"New Policy"**
2. Fill in:
   - **Policy Name**: `Public can view property images`
   - **Allowed Operation**: Select **`SELECT`** (radio button)
   - **Policy Definition** (copy this EXACTLY):
     ```
     bucket_id = 'property-images'
     ```
3. Click **"Review"** → **"Save policy"**
4. ✅ Policy 1 created!

#### Policy 2: Authenticated Upload (INSERT) ⚠️ CRITICAL
1. Click **"New Policy"** again (create a NEW policy)
2. Fill in:
   - **Policy Name**: `Authenticated users can upload property images`
   - **Allowed Operation**: Select **`INSERT`** (radio button)
   - **Policy Definition** (copy this EXACTLY):
     ```
     bucket_id = 'property-images' AND auth.role() = 'authenticated'
     ```
3. Click **"Review"** → **"Save policy"**
4. ✅ Policy 2 created!

**This is the most important one!** Without this INSERT policy with authentication check, uploads will fail.

#### Policy 3: Update Own Files (UPDATE)
1. Click **"New Policy"** again
2. Fill in:
   - **Policy Name**: `Users can update their own property images`
   - **Allowed Operation**: Select **`UPDATE`** (radio button)
   - **Policy Definition** (copy this EXACTLY):
     ```
     bucket_id = 'property-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
     ```
3. Click **"Review"** → **"Save policy"**
4. ✅ Policy 3 created!

#### Policy 4: Delete Own Files (DELETE)
1. Click **"New Policy"** again
2. Fill in:
   - **Policy Name**: `Users can delete their own property images`
   - **Allowed Operation**: Select **`DELETE`** (radio button)
   - **Policy Definition** (copy this EXACTLY):
     ```
     bucket_id = 'property-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
     ```
3. Click **"Review"** → **"Save policy"**
4. ✅ Policy 4 created!

### Step 3: Verify Final Result

After creating all 4 policies, you should see:

| Name | Command | Applied to | Actions |
|------|---------|------------|---------|
| Public can view property images | SELECT | public | ... |
| Authenticated users can upload property images | INSERT | public | ... |
| Users can update their own property images | UPDATE | public | ... |
| Users can delete their own property images | DELETE | public | ... |

**Note**: "Applied to: public" is correct for the `property-images` bucket (it's a public bucket).

### Step 4: Check Policy Definitions

Click on each policy to verify the **Policy Definition** matches exactly:

- **SELECT**: `bucket_id = 'property-images'`
- **INSERT**: `bucket_id = 'property-images' AND auth.role() = 'authenticated'`
- **UPDATE**: `bucket_id = 'property-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text`
- **DELETE**: `bucket_id = 'property-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text`

## Common Issues

❌ **"Applied to: public" is showing** - This is CORRECT for `property-images` bucket (it's a public bucket)
❌ **Policy definition is empty or wrong** - Make sure you copy-paste the exact definitions above
❌ **Still have duplicates** - Delete all policies and start over
❌ **INSERT policy missing authentication check** - Must include `AND auth.role() = 'authenticated'`

## Test After Fixing

1. Have an agent/seller log in
2. Go to create property page
3. Try uploading an image
4. Should work now! ✅

## If Still Not Working

Check the browser console (F12) for the exact error message. The improved error handling will show specific issues.








