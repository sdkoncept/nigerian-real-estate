# Supabase Storage Setup

## Required Storage Buckets

You need to create the following storage buckets in Supabase:

### 1. Property Images Bucket

1. Go to **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. Configure:
   - **Name**: `property-images`
   - **Public**: ✅ **Yes** (check this box)
   - **File size limit**: 5MB (or as needed)
   - **Allowed MIME types**: `image/jpeg, image/jpg, image/png`
4. Click **"Create bucket"**

### 2. Verification Documents Bucket

1. Go to **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. Configure:
   - **Name**: `verification-documents`
   - **Public**: ❌ **No** (keep private for security)
   - **File size limit**: 10MB
   - **Allowed MIME types**: `image/jpeg, image/jpg, image/png, application/pdf`
4. Click **"Create bucket"**

## Storage Policies

**⚠️ IMPORTANT**: Storage policies cannot be created via SQL in Supabase. You must use the Supabase Dashboard.

### Method 1: Using Supabase Dashboard (Recommended)

#### For Property Images Bucket (Public):

1. Go to **Storage** → Click on `property-images` bucket
2. Click **"Policies"** tab
3. Click **"New Policy"**
4. Create these policies:

   **Policy 1: Public Read Access**
   - Policy Name: `Public can view property images`
   - Allowed Operation: `SELECT`
   - Policy Definition:
     ```sql
     bucket_id = 'property-images'
     ```
   - Click **"Review"** → **"Save policy"**

   **Policy 2: Authenticated Upload**
   - Policy Name: `Authenticated users can upload property images`
   - Allowed Operation: `INSERT`
   - Policy Definition:
     ```sql
     bucket_id = 'property-images' AND auth.role() = 'authenticated'
     ```
   - Click **"Review"** → **"Save policy"**

   **Policy 3: Users can update their own uploads**
   - Policy Name: `Users can update their own property images`
   - Allowed Operation: `UPDATE`
   - Policy Definition:
     ```sql
     bucket_id = 'property-images' 
     AND auth.role() = 'authenticated'
     AND (storage.foldername(name))[1] = auth.uid()::text
     ```
   - Click **"Review"** → **"Save policy"**

   **Policy 4: Users can delete their own uploads**
   - Policy Name: `Users can delete their own property images`
   - Allowed Operation: `DELETE`
   - Policy Definition:
     ```sql
     bucket_id = 'property-images' 
     AND auth.role() = 'authenticated'
     AND (storage.foldername(name))[1] = auth.uid()::text
     ```
   - Click **"Review"** → **"Save policy"**

#### For Verification Documents Bucket (Private):

1. Go to **Storage** → Click on `verification-documents` bucket
2. Click **"Policies"** tab
3. Click **"New Policy"**
4. Create these policies:

   **Policy 1: Users can view their own documents**
   - Policy Name: `Users can view their own verification documents`
   - Allowed Operation: `SELECT`
   - Policy Definition:
     ```sql
     bucket_id = 'verification-documents' 
     AND auth.role() = 'authenticated'
     AND (storage.foldername(name))[1] = auth.uid()::text
     ```
   - Click **"Review"** → **"Save policy"**

   **Policy 2: Authenticated Upload**
   - Policy Name: `Authenticated users can upload verification documents`
   - Allowed Operation: `INSERT`
   - Policy Definition:
     ```sql
     bucket_id = 'verification-documents' 
     AND auth.role() = 'authenticated'
     ```
   - Click **"Review"** → **"Save policy"**

   **Policy 3: Users can update their own documents**
   - Policy Name: `Users can update their own verification documents`
   - Allowed Operation: `UPDATE`
   - Policy Definition:
     ```sql
     bucket_id = 'verification-documents' 
     AND auth.role() = 'authenticated'
     AND (storage.foldername(name))[1] = auth.uid()::text
     ```
   - Click **"Review"** → **"Save policy"**

### Method 2: Using Supabase CLI (Advanced)

If you have Supabase CLI installed, you can use:

```bash
supabase storage create property-images --public
supabase storage create verification-documents --private
```

Then create policies via the Dashboard as shown above.

### Quick Setup (Simplified - For Development)

**For quick testing, you can use these simpler policies:**

#### Property Images (Public Bucket):
- **Public Read**: `bucket_id = 'property-images'`
- **Authenticated Upload**: `bucket_id = 'property-images' AND auth.role() = 'authenticated'`
- **Authenticated Update**: `bucket_id = 'property-images' AND auth.role() = 'authenticated'`
- **Authenticated Delete**: `bucket_id = 'property-images' AND auth.role() = 'authenticated'`

#### Verification Documents (Private Bucket):
- **Authenticated Read**: `bucket_id = 'verification-documents' AND auth.role() = 'authenticated'`
- **Authenticated Upload**: `bucket_id = 'verification-documents' AND auth.role() = 'authenticated'`
- **Authenticated Update**: `bucket_id = 'verification-documents' AND auth.role() = 'authenticated'`

**Note**: The simplified policies above allow any authenticated user to access any file. For production, use the user-specific policies shown in Method 1.

## Testing

1. **Test Property Image Upload**:
   - Go to `/seller/properties/new`
   - Upload an image
   - Check if it appears in the property listing

2. **Test Verification Document Upload**:
   - Go to `/agent/dashboard`
   - Upload a verification document
   - Check if it's stored correctly

## Troubleshooting

**"Bucket not found"**
- Make sure you created the bucket in Supabase Dashboard
- Check the bucket name matches exactly (case-sensitive)

**"Permission denied"**
- Check storage policies are created in Dashboard
- Verify the user is authenticated
- Check file path matches user ID
- Make sure bucket is set to Public (for property-images) or Private (for verification-documents)

**"File too large"**
- Check bucket file size limit
- Reduce image size before upload

**"Error: must be owner of table objects"**
- This error occurs when trying to create storage policies via SQL
- **Solution**: Use Supabase Dashboard to create policies (see Method 1 above)
- Storage policies cannot be created via SQL Editor - they must be created through the Dashboard

---

**⚠️ IMPORTANT**: Storage policies **MUST** be created via Supabase Dashboard, not SQL Editor. The SQL Editor will give you a "must be owner of table objects" error.

