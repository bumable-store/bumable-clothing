# Product Synchronization - Setup Guide

## Overview
Your product management system has been upgraded to use **Supabase cloud database** instead of hardcoded JavaScript arrays. This enables **real-time synchronization** across all devices.

## ✅ What's Been Done

### 1. Database Integration (`js/supabase-db.js`)
Added product management methods to SupabaseDB class:
- `getAllProducts()` - Fetch all active products
- `getProduct(productId)` - Get single product by ID
- `getProductsByCategory(category)` - Filter products by category
- `updateProduct(productId, updates)` - Update product (syncs to database)

**Field Mapping**: Automatically handles camelCase (JavaScript) ↔ snake_case (PostgreSQL)
- `regularPrice` ↔ `regular_price`
- `salePrice` ↔ `sale_price`
- `onSale` ↔ `on_sale`
- `imageUrl` ↔ `image_url`
- `inStock` ↔ `in_stock`
- `stockCount` ↔ `stock_count`
- `availableSizes` ↔ `available_sizes`

### 2. Product Manager Refactored (`js/products.js`)
- **Constructor**: Now initializes empty, then loads from Supabase
- **Async Methods**: All product methods are now async (await required)
- **Fallback**: Uses default 12 products if database is empty or unavailable
- **Auto-sync**: When you update a product in admin, it saves to Supabase immediately

### 3. Frontend Updates
Updated all pages to handle async product loading:
- ✅ `index.html` - Homepage product grid
- ✅ `shop/index.html` - Shop page, product cards, add to cart
- ✅ `admin/index.html` - Admin product management

### 4. Migration Script (`admin/migrate-products-to-supabase.sql`)
SQL script ready to populate your database with all 12 products:
- 5 Bumable Briefs (Cheery Red, Olive, Lt Grey, Navy, Black)
- 2 Tie & Dye items (Brief, Trunks)
- 5 Solid Trunks (Frozen Navy, Grey, Black, Green, Burgundy)

## 🚀 Setup Steps

### Step 1: Run Migration SQL in Supabase

1. Open Supabase dashboard: https://app.supabase.com
2. Go to your project → **SQL Editor**
3. Click **New query**
4. Open `admin/migrate-products-to-supabase.sql`
5. Copy entire contents
6. Paste into Supabase SQL Editor
7. Click **Run** ▶️

**Expected Output:**
```
TRUNCATE products CASCADE
INSERT INTO products (12 rows)
CREATE INDEX idx_products_category
CREATE INDEX idx_products_status
CREATE INDEX idx_products_on_sale
CREATE INDEX idx_products_in_stock
```

### Step 2: Configure Supabase Connection (If Not Already Done)

1. Open your website (http://localhost:8000)
2. Go to Admin Panel
3. Click **Setup** or **Database Configuration**
4. Enter your Supabase credentials:
   - **Supabase URL**: `https://[your-project-ref].supabase.co`
   - **Supabase Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
5. Click **Save Configuration**

### Step 3: Verify Products Loaded

1. Open browser console (F12)
2. Refresh any page
3. Look for: `✅ Loaded 12 products from Supabase`

If you see this, products are loading successfully!

### Step 4: Test Cross-Device Sync

**Test 1: Update Product Price**
1. Open Admin Panel on Device 1 (e.g., laptop)
2. Update a product price (e.g., Bumable Brief - Cheery Red: ₹199 → ₹249)
3. Save changes
4. Open Shop page on Device 2 (e.g., phone)
5. Refresh page
6. ✅ New price should appear immediately

**Test 2: Update Product Image**
1. Open Admin Panel
2. Navigate to Product Management
3. Click on a product (e.g., Solid Trunks - Frozen Navy)
4. Update image URL
5. Save changes
6. Open Shop on another device
7. Refresh page
8. ✅ New image should appear

**Test 3: Stock Management**
1. Admin Panel → Update stock count (e.g., set to 5)
2. Save changes
3. Shop page on another device
4. Refresh
5. ✅ Stock count updated

## 📊 How Synchronization Works

### Before (Old System)
```
Admin changes product → Saved to browser localStorage only
Other devices          → Still show old data (no sync)
After page refresh     → Old data still shows (localStorage isolated)
```

### After (New System with Supabase)
```
Admin changes product → Saved to Supabase database
Supabase              → Stores data in cloud (PostgreSQL)
Other devices         → Fetch from Supabase on page load
After page refresh    → New data appears (database is source of truth)
```

## 🎯 Real-Time Update Flow

```mermaid
1. Admin Panel (Device 1)
   ↓ User clicks "Save"
   ↓ adminUpdateProduct() called
   ↓ window.supabaseDB.updateProduct(id, updates)
   
2. Supabase Database
   ↓ Product row updated in `products` table
   ↓ Database triggers fire (if configured)
   
3. Shop Page (Device 2)
   ↓ User refreshes page
   ↓ window.productManager.init() called
   ↓ window.supabaseDB.getAllProducts()
   ↓ Fetches updated data
   ↓ ✅ New product data displayed
```

## 📝 Important Notes

### Async/Await Required
All product methods are now async. When calling them:

**❌ Old Way (Doesn't work anymore):**
```javascript
const products = window.productManager.getAllProducts();
```

**✅ New Way (Required):**
```javascript
const products = await window.productManager.getAllProducts();
```

### Page Refresh Required
Changes don't sync in real-time **within the same page** - user must refresh to see updates from other devices. This is normal for server-fetched data.

If you want true real-time updates (without refresh), you can implement Supabase Realtime subscriptions later.

### Product IDs Must Match
The migration script uses IDs like `bumable-brief-cheery-red`. These match the existing product IDs in your codebase. Don't change them unless you also update references in HTML/JS.

### Database Schema
Your `products` table schema (from `admin/supabase-schema.sql`):
```sql
CREATE TABLE products (
    product_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    regular_price INTEGER,
    sale_price INTEGER,
    on_sale BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    in_stock BOOLEAN DEFAULT TRUE,
    stock_count INTEGER DEFAULT 0,
    available_sizes TEXT[],
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔧 Troubleshooting

### Products Not Loading
**Console shows:** `⚠️ No products found in database, using defaults`

**Solution:** Run the migration SQL script (Step 1 above)

### "Supabase not configured" Warning
**Console shows:** `⚠️ Supabase not configured, using default products`

**Solution:** Complete Step 2 (Configure Supabase Connection)

### Products Update Locally But Not Syncing
**Symptom:** Updates show in admin but not on other devices

**Solution:**
1. Check browser console for errors
2. Verify Supabase connection (Admin → Setup)
3. Check Supabase dashboard → Logs for errors
4. Verify RLS policies allow updates (they should, from previous fixes)

### "Product updated locally only" Warning
**Console shows:** `⚠️ Product updated locally only (Supabase not configured)`

**Solution:** Supabase is not connected. Configure it in Admin panel.

## 🎓 Next Steps (Optional Enhancements)

### 1. Real-Time Subscriptions
Add Supabase Realtime to update products without page refresh:
```javascript
// Subscribe to product changes
window.supabaseDB.client
    .channel('products')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, 
        (payload) => {
            console.log('Product updated in real-time:', payload);
            // Update local cache and re-render
        }
    )
    .subscribe();
```

### 2. Image Upload to Supabase Storage
Instead of using image URLs, upload images directly to Supabase Storage:
```javascript
// Upload product image
const { data, error } = await supabase.storage
    .from('product-images')
    .upload('products/image.jpg', file);
```

### 3. Product Variants
Add color/size variants as separate table:
```sql
CREATE TABLE product_variants (
    variant_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT REFERENCES products(product_id),
    color TEXT,
    size TEXT,
    sku TEXT,
    stock_count INTEGER,
    price_modifier INTEGER
);
```

### 4. Audit Trail
Track who changed what and when:
```sql
CREATE TABLE product_audit (
    audit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT,
    changed_by TEXT,
    changes JSONB,
    changed_at TIMESTAMPTZ DEFAULT NOW()
);
```

## ✅ Summary

Your product system now:
- ✅ Loads products from Supabase cloud database
- ✅ Syncs updates across all devices
- ✅ Has proper camelCase ↔ snake_case field mapping
- ✅ Falls back to defaults if database unavailable
- ✅ Works with existing admin panel (no UI changes needed)

**Time to Sync:** Instant on page refresh (~1-2 seconds to fetch from Supabase)

**Ready to test!** Run the migration SQL and refresh your pages.
