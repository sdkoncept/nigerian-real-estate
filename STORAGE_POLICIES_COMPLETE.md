# Complete Storage Policies Setup Guide

## ⚠️ CRITICAL: Create ONE Policy at a Time!

**IMPORTANT**: Each policy must be created **separately**. Do NOT copy multiple policy definitions into one policy. Create one policy, save it, then create the next one.

## 📋 Overview

This guide provides **exact copy-paste policy definitions** for both storage buckets. Follow these steps in the Supabase Dashboard.

---

## 🖼️ Property Images Bucket (`property-images`)

### Step 1: Navigate to Bucket
1. Go to **Supabase Dashboard** → **Storage**
2. Click on the **`property-images`** bucket
3. Click the **"Policies"** tab at the top
4. Click **"New Policy"** button

### Step 2: Create Policies (Create 4 policies total)

#### Policy 1: Public Read Access (SELECT)
- **Policy Name**: `Public can view property images`
- **Allowed Operation**: Select **`SELECT`**
- **Policy Definition** (copy this exactly):
  ```
  bucket_id = 'property-images'
  ```
- Click **"Review"** → **"Save policy"**

#### Policy 2: Authenticated Upload (INSERT)
- Click **"New Policy"** again
- **Policy Name**: `Authenticated users can upload property images`
- **Allowed Operation**: Select **`INSERT`**
- **Policy Definition** (copy this exactly):
  ```
  bucket_id = 'property-images' AND auth.role() = 'authenticated'
  ```
- Click **"Review"** → **"Save policy"**

#### Policy 3: Update Own Files (UPDATE)
- Click **"New Policy"** again
- **Policy Name**: `Users can update their own property images`
- **Allowed Operation**: Select **`UPDATE`**
- **Policy Definition** (copy this exactly):
  ```
  bucket_id = 'property-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
  ```
- Click **"Review"** → **"Save policy"**

#### Policy 4: Delete Own Files (DELETE)
- Click **"New Policy"** again
- **Policy Name**: `Users can delete their own property images`
- **Allowed Operation**: Select **`DELETE`**
- **Policy Definition** (copy this exactly):
  ```
  bucket_id = 'property-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
  ```
- Click **"Review"** → **"Save policy"**

### ✅ Property Images Policies Complete!

You should now have 4 policies for `property-images`:
1. ✅ Public can view property images (SELECT)
2. ✅ Authenticated users can upload property images (INSERT)
3. ✅ Users can update their own property images (UPDATE)
4. ✅ Users can delete their own property images (DELETE)

---

## 📄 Verification Documents Bucket (`verification-documents`)

### Step 1: Navigate to Bucket
1. Go to **Supabase Dashboard** → **Storage**
2. Click on the **`verification-documents`** bucket
3. Click the **"Policies"** tab at the top
4. Click **"New Policy"** button

### Step 2: Create Policies (Create 3 policies total)

#### Policy 1: View Own Documents (SELECT)
- **Policy Name**: `Users can view their own verification documents`
- **Allowed Operation**: Select **`SELECT`**
- **Policy Definition** (copy this exactly):
  ```
  bucket_id = 'verification-documents' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
  ```
- Click **"Review"** → **"Save policy"**

#### Policy 2: Upload Documents (INSERT)
- Click **"New Policy"** again
- **Policy Name**: `Authenticated users can upload verification documents`
- **Allowed Operation**: Select **`INSERT`**
- **Policy Definition** (copy this exactly):
  ```
  bucket_id = 'verification-documents' AND auth.role() = 'authenticated'
  ```
- Click **"Review"** → **"Save policy"**

#### Policy 3: Update Own Documents (UPDATE)
- Click **"New Policy"** again
- **Policy Name**: `Users can update their own verification documents`
- **Allowed Operation**: Select **`UPDATE`**
- **Policy Definition** (copy this exactly):
  ```
  bucket_id = 'verification-documents' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
  ```
- Click **"Review"** → **"Save policy"**

### ✅ Verification Documents Policies Complete!

You should now have 3 policies for `verification-documents`:
1. ✅ Users can view their own verification documents (SELECT)
2. ✅ Authenticated users can upload verification documents (INSERT)
3. ✅ Users can update their own verification documents (UPDATE)

---

## 📝 Quick Reference: All Policy Definitions

### Property Images (4 policies)

**1. SELECT (Public Read)**
```
bucket_id = 'property-images'
```

**2. INSERT (Authenticated Upload)**
```
bucket_id = 'property-images' AND auth.role() = 'authenticated'
```

**3. UPDATE (Update Own Files)**
```
bucket_id = 'property-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
```

**4. DELETE (Delete Own Files)**
```
bucket_id = 'property-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
```

### Verification Documents (3 policies)

**1. SELECT (View Own Documents)**
```
bucket_id = 'verification-documents' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
```

**2. INSERT (Upload Documents)**
```
bucket_id = 'verification-documents' AND auth.role() = 'authenticated'
```

**3. UPDATE (Update Own Documents)**
```
bucket_id = 'verification-documents' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
```

---

## 🎯 What Each Policy Does

### Property Images Policies:
- **SELECT**: Anyone can view property images (public access)
- **INSERT**: Only logged-in users can upload images
- **UPDATE**: Users can only update their own uploaded images (based on folder structure)
- **DELETE**: Users can only delete their own uploaded images

### Verification Documents Policies:
- **SELECT**: Users can only view their own verification documents (private)
- **INSERT**: Only logged-in users can upload documents
- **UPDATE**: Users can only update their own documents

---

## 🔍 How the Folder Structure Works

The policies use `(storage.foldername(name))[1] = auth.uid()::text` to ensure users can only access files in their own folder.

**File path structure:**
- Property Images: `properties/{user_id}/{timestamp}_{filename}`
- Verification Documents: `verification_documents/{user_id}/{document_type}_{timestamp}{extension}`

The `[1]` extracts the second part of the path (the user_id folder), ensuring users can only access their own files.

---

## ✅ Verification Checklist

After creating all policies, verify:

- [ ] `property-images` has 4 policies (SELECT, INSERT, UPDATE, DELETE)
- [ ] `verification-documents` has 3 policies (SELECT, INSERT, UPDATE)
- [ ] All policy names match exactly
- [ ] All policy definitions are copied correctly (no typos)
- [ ] Bucket `property-images` is set to **Public**
- [ ] Bucket `verification-documents` is set to **Private**

---

## 🧪 Testing

### Test Property Image Upload:
1. Go to `/seller/properties/new`
2. Try uploading an image
3. Should work without errors

### Test Verification Document Upload:
1. Go to `/agent/dashboard`
2. Try uploading a verification document
3. Should work without errors

---

## 🆘 Troubleshooting

**"Permission denied" when uploading:**
- Check that INSERT policy exists
- Verify policy definition is correct (copy exactly)
- Make sure user is logged in

**"Cannot view image" after upload:**
- Check SELECT policy exists for `property-images`
- Verify bucket is set to Public
- Check image URL is correct

**"Cannot view verification document":**
- Check SELECT policy exists for `verification-documents`
- Verify file path includes user_id folder
- Make sure you're logged in as the same user who uploaded

---

**That's it! Your storage policies are now configured correctly.** 🎉

