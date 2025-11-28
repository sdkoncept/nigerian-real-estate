# 📋 Remaining Tasks - Nigerian Real Estate Platform

## 🔴 Critical (Must Do Before Launch)

### 1. Payment Integration
- [ ] **Integrate Paystack SDK** in frontend
- [ ] **Implement subscription payment flow**
  - Premium plan (₦5,000/mo)
  - Enterprise plan (₦15,000/mo)
  - Professional agent plan (₦10,000/mo)
- [ ] **Implement featured listing payment** (₦2,000/mo)
- [ ] **Implement priority verification payment** (₦5,000 one-time)
- [ ] **Payment callback handling** (verify payments, update database)
- [ ] **Payment history page** for users
- [ ] **Invoice generation** and email sending

**Files to Update:**
- `frontend/src/pages/PricingPage.tsx` (line 110: TODO)
- `frontend/src/pages/CreatePropertyPage.tsx` (line 143: TODO)
- Create `frontend/src/services/payment.ts`
- Create `frontend/src/pages/PaymentHistoryPage.tsx`

---

### 2. Database Setup (Required)
- [ ] **Run `database/ADD_ADMIN_AGENT_POLICY.sql`** in Supabase
  - Fixes 406 errors on agents table
  - Allows admin to verify users
- [ ] **Run `database/MONETIZATION_SCHEMA.sql`** in Supabase
  - Creates subscriptions, payments, featured_listings tables
  - Enables monetization features

**Status**: SQL files ready, just need to execute in Supabase Dashboard

---

### 3. Contact Form Implementation
- [ ] **Property contact form** - Submit to backend API
- [ ] **Agent contact form** - Submit to backend API
- [ ] **Email notifications** when contact form submitted
- [ ] **Contact history** in user dashboard

**Files to Update:**
- `frontend/src/pages/PropertyDetailPage.tsx` (line 120: TODO)
- `frontend/src/pages/AgentDetailPage.tsx` (line 44: TODO)
- `backend/src/routes/contacts.ts` (needs implementation)

---

## 🟡 High Priority (Important for User Experience)

### 4. Subscription Management
- [ ] **Subscription dashboard page**
  - View current plan
  - Upgrade/downgrade options
  - Billing history
  - Cancel subscription
- [ ] **Subscription expiry notifications**
- [ ] **Auto-renewal handling**
- [ ] **Feature restrictions** based on subscription level

**Files to Create:**
- `frontend/src/pages/SubscriptionPage.tsx`
- `frontend/src/hooks/useSubscription.ts`

---

### 5. Featured Listings Management
- [ ] **Featured listings page** in seller dashboard
- [ ] **Activate/deactivate featured status**
- [ ] **Featured listing expiry notifications**
- [ ] **Priority sorting** in property listings (featured first)
- [ ] **Featured badge** on property cards

**Files to Update:**
- `frontend/src/pages/PropertyListingPage.tsx` (sort featured first)
- `frontend/src/components/PropertyCard.tsx` (add featured badge)
- `frontend/src/pages/SellerDashboard.tsx` (featured management)

---

### 6. Admin Settings Implementation
- [ ] **Save settings to database**
- [ ] **Load settings from database**
- [ ] **Settings categories:**
  - Platform settings (name, logo, etc.)
  - Email settings (SMTP configuration)
  - Payment settings (Paystack keys)
  - Verification settings (auto-approve thresholds)

**Files to Update:**
- `frontend/src/pages/AdminSettingsPage.tsx` (line 21: TODO)
- `backend/src/routes/admin.ts` (add settings endpoints)

---

## 🟢 Medium Priority (Nice to Have)

### 7. Maps Integration
- [ ] **Google Maps / Leaflet integration**
- [ ] **Property markers on map**
- [ ] **Map view page** for properties
- [ ] **Location search** with autocomplete
- [ ] **Nearby amenities** display
- [ ] **Directions** integration

**Files to Create:**
- `frontend/src/pages/MapViewPage.tsx`
- `frontend/src/components/PropertyMap.tsx`

---

### 8. Advanced Search Features
- [ ] **Search autocomplete/suggestions**
- [ ] **Saved searches**
- [ ] **Search history**
- [ ] **Price range slider**
- [ ] **Map-based search**
- [ ] **AI-powered recommendations**

**Files to Update:**
- `frontend/src/pages/PropertyListingPage.tsx`
- Create `frontend/src/components/SearchAutocomplete.tsx`

---

### 9. Messaging System
- [ ] **In-app messaging** between users
- [ ] **Message notifications**
- [ ] **Message history**
- [ ] **Read receipts**
- [ ] **File sharing** in messages

**Database:**
- Create `messages` table
- Add RLS policies

**Files to Create:**
- `frontend/src/pages/MessagesPage.tsx`
- `frontend/src/components/MessageThread.tsx`
- `backend/src/routes/messages.ts`

---

### 10. Reviews & Ratings
- [ ] **Property reviews** system
- [ ] **Agent reviews** system
- [ ] **Rating display** (stars)
- [ ] **Review moderation** (admin)
- [ ] **Review verification** (only verified users can review)

**Database:**
- `reviews` table exists but needs frontend implementation

**Files to Create:**
- `frontend/src/pages/ReviewPage.tsx`
- `frontend/src/components/ReviewCard.tsx`
- `frontend/src/components/StarRating.tsx`

---

### 11. Property Comparison
- [ ] **Compare properties** side-by-side
- [ ] **Comparison page**
- [ ] **Save comparisons**
- [ ] **Share comparisons**

**Files to Create:**
- `frontend/src/pages/ComparePropertiesPage.tsx`
- `frontend/src/components/ComparisonTable.tsx`

---

### 12. Virtual Tours
- [ ] **360° photo support**
- [ ] **Video tour upload**
- [ ] **Virtual tour viewer**
- [ ] **Embed YouTube/Vimeo videos**

**Files to Create:**
- `frontend/src/components/VirtualTour.tsx`
- Update `CreatePropertyPage.tsx` for video uploads

---

## 🔵 Low Priority (Future Enhancements)

### 13. Analytics & Reporting
- [ ] **Property view analytics** for sellers
- [ ] **Agent performance metrics**
- [ ] **Platform-wide analytics** for admin
- [ ] **Price trends** visualization
- [ ] **Market insights** dashboard

**Files to Create:**
- `frontend/src/pages/AnalyticsPage.tsx`
- `frontend/src/components/Charts.tsx` (using Chart.js or Recharts)

---

### 14. Mobile App
- [ ] **React Native app** (iOS & Android)
- [ ] **Push notifications**
- [ ] **Offline mode**
- [ ] **Camera integration** for property photos

---

### 15. Advanced Features
- [ ] **Mortgage calculator**
- [ ] **Property valuation tool**
- [ ] **Price history tracking**
- [ ] **Neighborhood insights**
- [ ] **School ratings** integration
- [ ] **Crime statistics** by area

---

## 🛠️ Technical Debt

### 16. Code Quality
- [ ] **Unit tests** for critical functions
- [ ] **Integration tests** for API endpoints
- [ ] **E2E tests** for user flows
- [ ] **Code splitting** (reduce bundle size)
- [ ] **Performance optimization**
- [ ] **Accessibility** improvements (ARIA labels, keyboard navigation)

---

### 17. Documentation
- [ ] **API documentation** (Swagger/OpenAPI)
- [ ] **Component documentation** (Storybook)
- [ ] **User guide** for sellers/agents
- [ ] **Admin manual**
- [ ] **Developer onboarding guide**

---

## 🚀 Deployment & Infrastructure

### 18. Production Setup
- [ ] **Backend deployment** (Vercel/Railway)
- [ ] **Environment variables** configuration
- [ ] **Database backups** automation
- [ ] **Monitoring** (Sentry, LogRocket)
- [ ] **Error tracking** setup
- [ ] **Performance monitoring** (Vercel Analytics)

---

## 📊 Summary

### Completed ✅
- Core authentication
- Property CRUD operations
- Agent verification system
- Admin dashboard
- Basic search and filters
- Favorites system
- Enhanced landing page
- Monetization infrastructure
- Shortlet & Airbnb support

### Critical Remaining 🔴
1. **Paystack payment integration** (highest priority)
2. **Database policies** (run SQL scripts)
3. **Contact form** implementation

### High Priority 🟡
4. Subscription management UI
5. Featured listings management
6. Admin settings persistence

### Medium Priority 🟢
7. Maps integration
8. Advanced search
9. Messaging system
10. Reviews & ratings

---

## 🎯 Recommended Next Steps

1. **This Week:**
   - Run database SQL scripts
   - Integrate Paystack payments
   - Implement contact forms

2. **Next Week:**
   - Subscription management
   - Featured listings UI
   - Admin settings API

3. **This Month:**
   - Maps integration
   - Messaging system
   - Reviews system

---

**Focus on monetization first - that's how you make money!** 💰

