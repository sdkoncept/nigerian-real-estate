# Quick Storage Policies Setup Guide

## ⚠️ Important: Use Dashboard, Not SQL

Storage policies **cannot** be created via SQL. You must use the Supabase Dashboard.

## 📖 For Complete Step-by-Step Guide

See **`STORAGE_POLICIES_COMPLETE.md`** for detailed instructions with exact copy-paste policy definitions.

## Step-by-Step: Create Storage Policies

### 1. Property Images Bucket (Public)

1. Go to **Supabase Dashboard** → **Storage**
2. Click on the `property-images` bucket
3. Click the **"Policies"** tab
4. Click **"New Policy"**

#### Policy 1: Public Read
- **Name**: `Public can view property images`
- **Operation**: `SELECT`
- **Policy**:
  ```
  bucket_id = 'property-images'
  ```
- Click **"Save policy"**

#### Policy 2: Authenticated Upload
- **Name**: `Authenticated users can upload property images`
- **Operation**: `INSERT`
- **Policy**:
  ```
  bucket_id = 'property-images' AND auth.role() = 'authenticated'
  ```
- Click **"Save policy"**

#### Policy 3: Update Own Files
- **Name**: `Users can update their own property images`
- **Operation**: `UPDATE`
- **Policy**:
  ```
  bucket_id = 'property-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
  ```
- Click **"Save policy"**

#### Policy 4: Delete Own Files
- **Name**: `Users can delete their own property images`
- **Operation**: `DELETE`
- **Policy**:
  ```
  bucket_id = 'property-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
  ```
- Click **"Save policy"**

### 2. Verification Documents Bucket (Private)

1. Go to **Supabase Dashboard** → **Storage**
2. Click on the `verification-documents` bucket
3. Click the **"Policies"** tab
4. Click **"New Policy"**

#### Policy 1: View Own Documents
- **Name**: `Users can view their own verification documents`
- **Operation**: `SELECT`
- **Policy**:
  ```
  bucket_id = 'verification-documents' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
  ```
- Click **"Save policy"**

#### Policy 2: Upload Documents
- **Name**: `Authenticated users can upload verification documents`
- **Operation**: `INSERT`
- **Policy**:
  ```
  bucket_id = 'verification-documents' 
  AND auth.role() = 'authenticated'
  ```
- Click **"Save policy"**

#### Policy 3: Update Own Documents
- **Name**: `Users can update their own verification documents`
- **Operation**: `UPDATE`
- **Policy**:
  ```
  bucket_id = 'verification-documents' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
  ```
- Click **"Save policy"**

## Simplified Policies (For Quick Testing)

If you want to get started quickly, you can use these simpler policies that allow any authenticated user to access any file:

### Property Images (Simplified):
- **SELECT**: `bucket_id = 'property-images'`
- **INSERT**: `bucket_id = 'property-images' AND auth.role() = 'authenticated'`
- **UPDATE**: `bucket_id = 'property-images' AND auth.role() = 'authenticated'`
- **DELETE**: `bucket_id = 'property-images' AND auth.role() = 'authenticated'`

### Verification Documents (Simplified):
- **SELECT**: `bucket_id = 'verification-documents' AND auth.role() = 'authenticated'`
- **INSERT**: `bucket_id = 'verification-documents' AND auth.role() = 'authenticated'`
- **UPDATE**: `bucket_id = 'verification-documents' AND auth.role() = 'authenticated'`

**Note**: These simplified policies are less secure but work for development. Use the user-specific policies above for production.

## Visual Guide

When creating a policy in the Dashboard, you'll see:

```
┌─────────────────────────────────────┐
│ Policy Name: [Enter name]          │
│                                     │
│ Allowed Operation:                  │
│ ○ SELECT                            │
│ ○ INSERT                            │
│ ○ UPDATE                            │
│ ○ DELETE                            │
│                                     │
│ Policy Definition:                  │
│ ┌─────────────────────────────────┐ │
│ │ bucket_id = 'property-images'  │ │
│ │ AND auth.role() = 'authenticated'│ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Review] [Save policy]             │
└─────────────────────────────────────┘
```

## Common Errors

### "Error: must be owner of table objects"
- **Cause**: Trying to create policies via SQL Editor
- **Fix**: Use Supabase Dashboard → Storage → Policies tab

### "Permission denied"
- **Cause**: Policies not created or incorrect
- **Fix**: Check policies exist and match bucket name exactly

### "Bucket not found"
- **Cause**: Bucket doesn't exist
- **Fix**: Create bucket first in Storage section

---

**Remember**: Always create storage policies through the Dashboard, not SQL Editor!

