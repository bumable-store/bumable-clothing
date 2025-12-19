-- =============================================================================
-- BUMABLE CLOTHING - PRODUCTS TABLE SETUP
-- =============================================================================
-- This script creates the products table and populates it with initial data
-- Run this in Supabase SQL Editor
-- =============================================================================

-- Step 1: Create products table
CREATE TABLE IF NOT EXISTS public.products (
    product_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    regular_price INTEGER NOT NULL,
    sale_price INTEGER,
    on_sale BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    in_stock BOOLEAN DEFAULT TRUE,
    stock_count INTEGER DEFAULT 0,
    available_sizes TEXT[] DEFAULT ARRAY['S', 'M', 'L', 'XL', 'XXL'],
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create trigger for products table
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 4: Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies

-- Policy: Anyone can view active products (for public shop)
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view active products"
    ON public.products
    FOR SELECT
    USING (status = 'active');

-- Policy: Authenticated users can view all products (for admin)
DROP POLICY IF EXISTS "Authenticated users can view all products" ON public.products;
CREATE POLICY "Authenticated users can view all products"
    ON public.products
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Authenticated users can insert products
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
CREATE POLICY "Authenticated users can insert products"
    ON public.products
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Authenticated users can update products
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
CREATE POLICY "Authenticated users can update products"
    ON public.products
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy: Authenticated users can delete products
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.products;
CREATE POLICY "Authenticated users can delete products"
    ON public.products
    FOR DELETE
    TO authenticated
    USING (true);

-- Step 6: Insert initial 12 products
TRUNCATE TABLE public.products CASCADE;

INSERT INTO public.products (
    product_id, name, description, category,
    regular_price, sale_price, on_sale,
    image_url, in_stock, stock_count, available_sizes
) VALUES
-- Bumable Briefs (5 products)
(
    'bumable-brief-cheery-red',
    'Bumable Brief – Cheery Red',
    'Classic Bumable brief in cheery red',
    'briefs',
    499, 199, true,
    '../images/hero-product-1.jpg',
    true, 50,
    ARRAY['S', 'M', 'L', 'XL', 'XXL']
),
(
    'bumable-brief-olive',
    'Bumable Brief – Olive',
    'Classic Bumable brief in olive',
    'briefs',
    499, 199, true,
    '../images/hero-product-2.jpg',
    true, 45,
    ARRAY['S', 'M', 'L', 'XL', 'XXL']
),
(
    'bumable-brief-lt-grey',
    'Bumable Brief – Lt Grey',
    'Classic Bumable brief in light grey',
    'briefs',
    499, 199, true,
    '../images/hero-product-1.jpg',
    true, 55,
    ARRAY['S', 'M', 'L', 'XL', 'XXL']
),
(
    'bumable-brief-navy',
    'Bumable Brief – Navy',
    'Classic Bumable brief in navy',
    'briefs',
    499, 199, true,
    '../images/hero-product-2.jpg',
    true, 40,
    ARRAY['S', 'M', 'L', 'XL', 'XXL']
),
(
    'bumable-brief-black',
    'Bumable Brief – Black',
    'Classic Bumable brief in black',
    'briefs',
    499, 199, true,
    '../images/hero-product-1.jpg',
    true, 60,
    ARRAY['S', 'M', 'L', 'XL', 'XXL']
),

-- Tie & Dye Collection (2 products)
(
    'tie-and-dye-brief',
    'Tie and Dye Brief',
    'Vibrant tie-dye brief with unique patterns',
    'tie-dye',
    599, 249, true,
    '../images/products/tie-dye/tie-dye-1-main.jpg',
    true, 30,
    ARRAY['S', 'M', 'L', 'XL', 'XXL']
),
(
    'tie-and-dye-trunks',
    'Tie and Dye Trunks',
    'Colorful tie-dye trunks with artistic designs',
    'tie-dye',
    599, 249, true,
    '../images/products/tie-dye/tie-dye-2-main.jpg',
    true, 25,
    ARRAY['S', 'M', 'L', 'XL', 'XXL']
),

-- Solid Trunks Collection (5 products)
(
    'solid-trunks-frozen-navy',
    'Solid Trunks – Frozen Navy',
    'Solid navy trunks',
    'trunks',
    499, 199, true,
    '../images/products/solid/solid-navy-main.jpg',
    true, 35,
    ARRAY['S', 'M', 'L', 'XL', 'XXL']
),
(
    'solid-trunks-frozen-grey',
    'Solid Trunks – Frozen Grey',
    'Solid grey trunks',
    'trunks',
    499, 199, true,
    '../images/products/solid/solid-2-main.jpg',
    true, 42,
    ARRAY['S', 'M', 'L', 'XL', 'XXL']
),
(
    'solid-trunks-frozen-black',
    'Solid Trunks – Frozen Black',
    'Solid black trunks',
    'trunks',
    499, 199, true,
    '../images/products/solid/solid-3-main.jpg',
    true, 38,
    ARRAY['S', 'M', 'L', 'XL', 'XXL']
),
(
    'solid-trunks-frozen-green',
    'Solid Trunks – Frozen Green',
    'Solid green trunks',
    'trunks',
    499, 199, true,
    '../images/products/solid/solid-4-main.jpg',
    true, 33,
    ARRAY['S', 'M', 'L', 'XL', 'XXL']
),
(
    'solid-trunks-frozen-burgundy',
    'Solid Trunks – Frozen Burgundy',
    'Solid burgundy trunks',
    'trunks',
    499, 199, true,
    '../images/products/solid/solid-5-main.jpg',
    true, 29,
    ARRAY['S', 'M', 'L', 'XL', 'XXL']
);

-- Step 7: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_on_sale ON public.products(on_sale);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON public.products(in_stock);

-- Step 8: Verify data was inserted
SELECT 
    COUNT(*) as total_products,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_products,
    COUNT(CASE WHEN on_sale THEN 1 END) as products_on_sale
FROM public.products;

-- Step 9: Show all products
SELECT 
    product_id,
    name,
    category,
    regular_price,
    sale_price,
    on_sale,
    in_stock,
    stock_count
FROM public.products
ORDER BY category, name;

-- =============================================================================
-- SETUP COMPLETE!
-- =============================================================================
-- Expected Output:
-- - 12 products inserted
-- - 12 active products
-- - 12 products on sale
-- 
-- Next Steps:
-- 1. Refresh your website (http://localhost:8000)
-- 2. Check browser console for: "✅ Loaded 12 products from Supabase"
-- 3. Test product updates in admin panel
-- =============================================================================
