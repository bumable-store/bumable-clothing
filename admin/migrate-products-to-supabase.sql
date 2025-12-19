-- Migrate Product Data to Supabase
-- This script inserts all 12 Bumable products into the database

-- Clear existing products (if any)
TRUNCATE TABLE public.products CASCADE;

-- Insert all 12 products
INSERT INTO public.products (
    product_id,
    name,
    description,
    category,
    regular_price,
    sale_price,
    on_sale,
    image_url,
    in_stock,
    stock_count,
    available_sizes,
    featured,
    status
) VALUES
-- Product 1: Bumable Brief – Cheery Red
('bumable-brief-cheery-red', 'Bumable Brief – Cheery Red', 'Classic Bumable brief in cheery red', 'briefs', 499, 199, true, '../images/hero-product-1.jpg', true, 50, ARRAY['S','M','L','XL','XXL'], true, 'active'),

-- Product 2: Bumable Brief – Misty Grey
('bumable-brief-misty-grey', 'Bumable Brief – Misty Grey', 'Comfortable brief in misty grey', 'briefs', 499, 199, true, '../images/hero-product-2.jpg', true, 45, ARRAY['S','M','L','XL','XXL'], true, 'active'),

-- Product 3: Bumable Sports Brief – Fit Green
('bumable-sports-brief-fit-green', 'Bumable Sports Brief – Fit Green', 'Sports brief in fit green for active lifestyle', 'sports', 599, 249, true, '../images/products/sports/sports-1-main.jpg', true, 40, ARRAY['S','M','L','XL','XXL'], false, 'active'),

-- Product 4: Bumable Sports Brief – Energetic Orange
('bumable-sports-brief-energetic-orange', 'Bumable Sports Brief – Energetic Orange', 'Energetic orange sports brief', 'sports', 599, 249, true, '../images/products/sports/sports-2-main.jpg', true, 35, ARRAY['S','M','L','XL','XXL'], false, 'active'),

-- Product 5: Tie & Dye Brief
('tie-and-dye-brief', 'Tie & Dye Brief', 'Unique tie-dye pattern brief with vibrant colors', 'tie-dye', 599, 249, true, '../images/products/tie-dye/tie-dye-1-main.jpg', true, 30, ARRAY['S','M','L','XL','XXL'], false, 'active'),

-- Product 6: Tie and Dye Trunks
('tie-and-dye-trunks', 'Tie and Dye Trunks', 'Colorful tie-dye trunks with artistic designs', 'tie-dye', 599, 249, true, '../images/products/tie-dye/tie-dye-2-main.jpg', true, 25, ARRAY['S','M','L','XL','XXL'], false, 'active'),

-- Product 7: Solid Trunks – Frozen Navy
('solid-trunks-frozen-navy', 'Solid Trunks – Frozen Navy', 'Solid navy trunks', 'trunks', 499, 199, true, '../images/products/solid/solid-navy-main.jpg', true, 35, ARRAY['S','M','L','XL','XXL'], false, 'active'),

-- Product 8: Solid Trunks – Frozen Grey
('solid-trunks-frozen-grey', 'Solid Trunks – Frozen Grey', 'Solid grey trunks', 'trunks', 499, 199, true, '../images/products/solid/solid-2-main.jpg', true, 42, ARRAY['S','M','L','XL','XXL'], false, 'active'),

-- Product 9: Solid Trunks – Frozen Black
('solid-trunks-frozen-black', 'Solid Trunks – Frozen Black', 'Solid black trunks', 'trunks', 499, 199, true, '../images/products/solid/solid-3-main.jpg', true, 38, ARRAY['S','M','L','XL','XXL'], false, 'active'),

-- Product 10: Solid Trunks – Frozen Green
('solid-trunks-frozen-green', 'Solid Trunks – Frozen Green', 'Solid green trunks', 'trunks', 499, 199, true, '../images/products/solid/solid-4-main.jpg', true, 33, ARRAY['S','M','L','XL','XXL'], false, 'active'),

-- Product 11: Solid Trunks – Frozen Burgundy
('solid-trunks-frozen-burgundy', 'Solid Trunks – Frozen Burgundy', 'Solid burgundy trunks', 'trunks', 499, 199, true, '../images/products/solid/solid-5-main.jpg', true, 29, ARRAY['S','M','L','XL','XXL'], false, 'active'),

-- Product 12: Bumable Brief – Ocean Blue
('bumable-brief-ocean-blue', 'Bumable Brief – Ocean Blue', 'Classic brief in ocean blue', 'briefs', 499, 199, true, '../images/hero-product-3.jpg', true, 48, ARRAY['S','M','L','XL','XXL'], true, 'active');

-- Create index for faster product queries
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_on_sale ON public.products(on_sale) WHERE on_sale = true;

-- Verify insertion
SELECT COUNT(*) as total_products FROM public.products;
SELECT 'Products migrated successfully! 🎉' as message;
