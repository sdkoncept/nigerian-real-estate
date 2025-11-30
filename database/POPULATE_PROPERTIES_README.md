# Property Population Script

## Overview

This script populates your Nigerian Real Estate Platform with sample properties across 8 major locations:

- **ABUJA** (FCT) - 5 properties (4 regular + 1 Airbnb)
- **LAGOS** (Lagos State) - 7 properties (5 regular + 2 Airbnb)
- **PORT HARCOURT** (Rivers State) - 4 properties (3 regular + 1 Airbnb)
- **BENIN CITY** (Edo State) - 3 properties (2 regular + 1 Airbnb)
- **EDO STATE** (Other locations) - 1 property
- **DELTA STATE** - 3 properties (2 regular + 1 Airbnb)
- **KADUNA** (Kaduna State) - 4 properties (3 regular + 1 Airbnb)
- **KANO** (Kano State) - 4 properties (3 regular + 1 Airbnb)

**Total: 31 properties** (23 regular + 8 Airbnb)

## Property Types Included

- **Houses** - Duplexes, bungalows, villas
- **Apartments** - Flats, condos
- **Commercial** - Office spaces, shops
- **Land** - Plots for sale
- **Shortlets** - Short-term stays

## Listing Types

- **Sale** - Properties for purchase
- **Rent** - Long-term rentals
- **Short Stay** - Shortlets and temporary stays
- **Airbnb** - Vacation rentals and holiday accommodations
- **Commercial** - Business spaces

## How to Use

### Step 1: Update Database Constraints (REQUIRED)

**You MUST run this before populating properties:**

1. Open Supabase SQL Editor
2. Run `UPDATE_ALL_CONSTRAINTS.sql` first
   - This updates both `property_type` and `listing_type` constraints
   - Adds support for 'Shortlet' and 'Airbnb' property types
   - Adds support for 'short_stay' and 'airbnb' listing types
3. You should see both constraints verified at the end

**This is required if your database was created with an older schema.**

### Step 2: Ensure You Have a Seller/Agent Account

The script will automatically use the first seller or agent account found in your `profiles` table. If you don't have one yet:

1. Sign up as a seller or agent on your platform
2. Or manually set a user ID in the script

### Step 3: Run the Script

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Click **"New Query"**
4. Copy and paste the entire contents of `POPULATE_PROPERTIES.sql`
5. Click **"Run"** (or press Ctrl+Enter)

### Step 4: Verify Properties

After running, you should see a summary table showing:
- Property count per city/state
- Breakdown by listing type (sale, rent, shortlet)
- Verification status count

## Property Details

### Abuja Properties
- Luxury 5-Bedroom Duplex in Maitama (₦85M, Sale, Featured)
- 3-Bedroom Apartment in Wuse 2 (₦45M, Sale)
- 4-Bedroom Semi-Detached in Garki (₦2.5M/month, Rent)
- Luxury Shortlet in Asokoro (₦45K/night, Short Stay, Featured)

### Lagos Properties
- 5-Bedroom Luxury Villa in Lekki Phase 1 (₦120M, Sale, Featured)
- 3-Bedroom Apartment in Victoria Island (₦65M, Sale)
- 2-Bedroom Flat in Ikeja (₦1.2M/month, Rent)
- Luxury Shortlet in Ikoyi (₦55K/night, Short Stay, Featured)
- Office Space in Lekki (₦3.5M/month, Commercial Rent)

### Port Harcourt Properties
- 4-Bedroom Duplex in GRA Phase 2 (₦55M, Sale)
- 3-Bedroom Bungalow in Woji (₦1.8M/month, Rent)
- Executive Shortlet in Trans Amadi (₦35K/night, Short Stay)

### Benin City Properties
- 4-Bedroom Duplex in GRA (₦42M, Sale)
- 3-Bedroom Flat in Ugbowo (₦800K/month, Rent)

### Edo State Properties
- Land for Sale in Auchi (₦15M, 500sqm)

### Delta State Properties
- 5-Bedroom Mansion in Asaba (₦75M, Sale, Featured)
- 3-Bedroom Apartment in Warri (₦1.5M/month, Rent)

### Kaduna Properties
- 4-Bedroom Duplex in Barnawa (₦48M, Sale)
- 3-Bedroom Bungalow in Malali (₦900K/month, Rent)
- Executive Shortlet in Kaduna North (₦30K/night, Short Stay)

### Kano Properties
- 5-Bedroom Duplex in GRA (₦65M, Sale, Featured)
- 4-Bedroom House in Nassarawa (₦1.2M/month, Rent)
- Shop Space in Sabon Gari (₦250K/month, Commercial Rent)
- Traditional Airbnb House in GRA (₦40K/night, Airbnb)

### Airbnb Properties (New)
- **Abuja**: Luxury Airbnb Apartment in Wuse 2 (₦55K/night, Featured)
- **Lagos**: Modern Airbnb Studio in Lekki (₦45K/night, Featured)
- **Lagos**: Spacious Airbnb Villa in Victoria Island (₦120K/night, Featured)
- **Port Harcourt**: Cozy Airbnb Apartment in GRA (₦40K/night)
- **Benin City**: Modern Airbnb Flat in GRA (₦35K/night)
- **Delta State**: Luxury Airbnb Mansion in Asaba (₦150K/night, Featured)
- **Kaduna**: Executive Airbnb Apartment in Barnawa (₦35K/night)
- **Kano**: Traditional Airbnb House in GRA (₦40K/night)

## Features

- ✅ All properties have realistic Nigerian prices (in Naira)
- ✅ Mix of verified and pending properties
- ✅ Some properties marked as featured
- ✅ Realistic property descriptions
- ✅ Proper location data (state, city, area)
- ✅ Images from Unsplash (placeholder URLs)
- ✅ Features and amenities arrays
- ✅ Various property types and sizes

## Customization

You can modify the script to:
- Change prices
- Add more properties
- Modify descriptions
- Change verification status
- Add more locations
- Use your own image URLs

## Notes

- **Images**: Currently using Unsplash placeholder URLs. Replace with your own property images.
- **User ID**: Script automatically finds first seller/agent. To use a specific user, replace the subquery with the UUID.
- **Verification**: Some properties are pre-verified, others are pending (realistic scenario).
- **Featured**: Some high-end properties are marked as featured.

## Troubleshooting

### Error: "violates check constraint 'properties_listing_type_check'" or "properties_property_type_check"
- **Solution**: Run `UPDATE_ALL_CONSTRAINTS.sql` first. This updates both constraints to support Shortlet and Airbnb properties.

### Error: "null value in column 'created_by' violates not-null constraint"
- **Solution**: Create at least one seller or agent account first, or modify the script to use NULL (if your schema allows it).

### Error: "relation 'public.properties' does not exist"
- **Solution**: Make sure you've run the main schema.sql file first to create the tables.

### Properties not showing up
- Check that `is_active = true` for all properties
- Verify RLS policies allow viewing properties
- Check that you're logged in (if RLS requires authentication)

## Next Steps

After populating properties:
1. Review properties in your admin dashboard
2. Verify property images (replace placeholder URLs)
3. Adjust prices if needed
4. Add more properties as your platform grows
5. Mark properties as verified through admin panel

---

**Happy listing!** 🏠

