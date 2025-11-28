# Storage Policies Setup - FIXED GUIDE

## ⚠️ CRITICAL: Create ONE Policy at a Time!

**DO NOT** copy all policy definitions into one policy. Each policy must be created **separately**.

---

## 🖼️ Property Images Bucket - Step by Step

### Policy 1: Public Read (SELECT)

1. Go to **Supabase Dashboard** → **Storage** → Click `property-images` bucket
2. Click **"Policies"** tab
3. Click **"New Policy"**
4. Fill in:
   - **Policy Name**: `Public can view property images`
   - **Allowed Operation**: Select **`SELECT`** (radio button)
   - **Policy Definition** (copy ONLY this line):
     ```
     bucket_id = 'property-images'
     ```
5. Click **"Review"** → **"Save policy"**
6. ✅ Policy 1 created!

### Policy 2: Authenticated Upload (INSERT)

1. Click **"New Policy"** again (create a NEW policy)
2. Fill in:
   - **Policy Name**: `Authenticated users can upload property images`
   - **Allowed Operation**: Select **`INSERT`** (radio button)
   - **Policy Definition** (copy ONLY this line):
     ```
     bucket_id = 'property-images' AND auth.role() = 'authenticated'
     ```
3. Click **"Review"** → **"Save policy"**
4. ✅ Policy 2 created!

### Policy 3: Update Own Files (UPDATE)

1. Click **"New Policy"** again (create a NEW policy)
2. Fill in:
   - **Policy Name**: `Users can update their own property images`
   - **Allowed Operation**: Select **`UPDATE`** (radio button)
   - **Policy Definition** (copy ONLY this line):
     ```
     bucket_id = 'property-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
     ```
3. Click **"Review"** → **"Save policy"**
4. ✅ Policy 3 created!

### Policy 4: Delete Own Files (DELETE)

1. Click **"New Policy"** again (create a NEW policy)
2. Fill in:
   - **Policy Name**: `Users can delete their own property images`
   - **Allowed Operation**: Select **`DELETE`** (radio button)
   - **Policy Definition** (copy ONLY this line):
     ```
     bucket_id = 'property-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
     ```
3. Click **"Review"** → **"Save policy"**
4. ✅ Policy 4 created!

**Result**: You should now have **4 separate policies** for `property-images`.

---

## 📄 Verification Documents Bucket - Step by Step

### Policy 1: View Own Documents (SELECT)

1. Go to **Supabase Dashboard** → **Storage** → Click `verification-documents` bucket
2. Click **"Policies"** tab
3. Click **"New Policy"**
4. Fill in:
   - **Policy Name**: `Users can view their own verification documents`
   - **Allowed Operation**: Select **`SELECT`** (radio button)
   - **Policy Definition** (copy ONLY this line):
     ```
     bucket_id = 'verification-documents' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
     ```
5. Click **"Review"** → **"Save policy"**
6. ✅ Policy 1 created!

### Policy 2: Upload Documents (INSERT)

1. Click **"New Policy"** again (create a NEW policy)
2. Fill in:
   - **Policy Name**: `Authenticated users can upload verification documents`
   - **Allowed Operation**: Select **`INSERT`** (radio button)
   - **Policy Definition** (copy ONLY this line):
     ```
     bucket_id = 'verification-documents' AND auth.role() = 'authenticated'
     ```
3. Click **"Review"** → **"Save policy"**
4. ✅ Policy 2 created!

### Policy 3: Update Own Documents (UPDATE)

1. Click **"New Policy"** again (create a NEW policy)
2. Fill in:
   - **Policy Name**: `Users can update their own verification documents`
   - **Allowed Operation**: Select **`UPDATE`** (radio button)
   - **Policy Definition** (copy ONLY this line):
     ```
     bucket_id = 'verification-documents' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
     ```
3. Click **"Review"** → **"Save policy"**
4. ✅ Policy 3 created!

**Result**: You should now have **3 separate policies** for `verification-documents`.

---

## 📋 Quick Reference - Copy ONE Line Per Policy

### Property Images (4 separate policies):

**Policy 1 - SELECT:**
```
bucket_id = 'property-images'
```

**Policy 2 - INSERT:**
```
bucket_id = 'property-images' AND auth.role() = 'authenticated'
```

**Policy 3 - UPDATE:**
```
bucket_id = 'property-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
```

**Policy 4 - DELETE:**
```
bucket_id = 'property-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
```

### Verification Documents (3 separate policies):

**Policy 1 - SELECT:**
```
bucket_id = 'verification-documents' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
```

**Policy 2 - INSERT:**
```
bucket_id = 'verification-documents' AND auth.role() = 'authenticated'
```

**Policy 3 - UPDATE:**
```
bucket_id = 'verification-documents' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
```

---

## ❌ Common Mistakes to Avoid

1. **DON'T** copy all policy definitions into one policy
2. **DON'T** combine multiple definitions with commas or semicolons
3. **DO** create each policy separately
4. **DO** use only ONE policy definition per policy
5. **DO** select the correct Operation (SELECT, INSERT, UPDATE, DELETE) for each policy

---

## ✅ Verification Checklist

After creating all policies:

### Property Images Bucket:
- [ ] Policy 1: `Public can view property images` (SELECT)
- [ ] Policy 2: `Authenticated users can upload property images` (INSERT)
- [ ] Policy 3: `Users can update their own property images` (UPDATE)
- [ ] Policy 4: `Users can delete their own property images` (DELETE)

### Verification Documents Bucket:
- [ ] Policy 1: `Users can view their own verification documents` (SELECT)
- [ ] Policy 2: `Authenticated users can upload verification documents` (INSERT)
- [ ] Policy 3: `Users can update their own verification documents` (UPDATE)

---

## 🎯 Visual Guide: What the Form Looks Like

When creating each policy, the form should look like this:

```
┌─────────────────────────────────────────┐
│ Policy Name:                             │
│ [Public can view property images]        │
│                                          │
│ Allowed Operation:                       │
│ ● SELECT  ← Select this one             │
│ ○ INSERT                                 │
│ ○ UPDATE                                 │
│ ○ DELETE                                 │
│                                          │
│ Policy Definition:                       │
│ ┌─────────────────────────────────────┐ │
│ │ bucket_id = 'property-images'       │ │ ← Copy ONLY this line
│ └─────────────────────────────────────┘ │
│                                          │
│ [Review] [Save policy]                  │
└─────────────────────────────────────────┘
```

**Important**: Only put ONE policy definition in the text box!

---

## 🆘 If You Still Get Errors

1. **Delete all existing policies** for the bucket
2. **Start fresh** - create policies one at a time
3. **Verify** you're copying only ONE line per policy
4. **Check** the Operation is selected correctly (SELECT, INSERT, UPDATE, or DELETE)
5. **Make sure** there are no extra spaces or characters

---

**Remember**: One policy = One definition = One operation. Create them separately! 🎯

