-- Fix Supabase Security Issues
-- This script addresses RLS and SECURITY DEFINER issues found in the database

-- =============================================================================
-- PART 1: Fix SECURITY DEFINER Views
-- =============================================================================

-- Drop and recreate user_stats view without SECURITY DEFINER
DROP VIEW IF EXISTS public.user_stats CASCADE;

CREATE VIEW public.user_stats 
WITH (security_invoker = true)
AS
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    COUNT(DISTINCT o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_spent,
    MIN(o.created_at) as first_order_date,
    MAX(o.created_at) as last_order_date
FROM public.users u
LEFT JOIN public.orders o ON u.email = o.customer_email
GROUP BY u.id, u.email, u.first_name, u.last_name;

-- Drop and recreate order_summaries view without SECURITY DEFINER
DROP VIEW IF EXISTS public.order_summaries CASCADE;

CREATE VIEW public.order_summaries 
WITH (security_invoker = true)
AS
SELECT 
    o.id,
    o.order_number,
    o.customer_email,
    o.customer_name,
    o.customer_phone,
    o.total_amount,
    o.order_status,
    o.payment_method,
    o.created_at,
    COUNT(oi.id) as item_count,
    SUM(oi.quantity) as total_items
FROM public.orders o
LEFT JOIN public.order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.customer_email, o.customer_name, o.customer_phone, 
         o.total_amount, o.order_status, o.payment_method, o.created_at;

-- =============================================================================
-- PART 2: Enable Row Level Security (RLS) on All Tables
-- =============================================================================

-- Enable RLS on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Enable RLS on order_items table
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Enable RLS on contacts table
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_activities table
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Enable RLS on product_views table
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;

-- Enable RLS on newsletter_subscribers table
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Enable RLS on cart_abandonment table
ALTER TABLE public.cart_abandonment ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- PART 3: Create RLS Policies
-- =============================================================================

-- Policy for orders: Users can view their own orders, admins can view all
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT
    USING (
        (SELECT auth.role()) = 'authenticated' AND (
            customer_email = (SELECT auth.jwt() ->> 'email')
            OR (SELECT auth.jwt() ->> 'role') = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can insert orders" ON public.orders;
CREATE POLICY "Admins can insert orders" ON public.orders
    FOR INSERT
    WITH CHECK (true); -- Allow all inserts (for checkout process)

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders" ON public.orders
    FOR UPDATE
    USING ((SELECT auth.jwt() ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
CREATE POLICY "Admins can delete orders" ON public.orders
    FOR DELETE
    USING ((SELECT auth.jwt() ->> 'role') = 'admin');

-- Policy for order_items: Follow orders table permissions
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
            AND (
                o.customer_email = (SELECT auth.jwt() ->> 'email')
                OR (SELECT auth.jwt() ->> 'role') = 'admin'
            )
        )
    );

DROP POLICY IF EXISTS "Allow insert order items" ON public.order_items;
CREATE POLICY "Allow insert order items" ON public.order_items
    FOR INSERT
    WITH CHECK (true); -- Allow all inserts (for checkout process)

DROP POLICY IF EXISTS "Admins can update order items" ON public.order_items;
CREATE POLICY "Admins can update order items" ON public.order_items
    FOR UPDATE
    USING ((SELECT auth.jwt() ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins can delete order items" ON public.order_items;
CREATE POLICY "Admins can delete order items" ON public.order_items
    FOR DELETE
    USING ((SELECT auth.jwt() ->> 'role') = 'admin');

-- Policy for contacts: Admins can view all, users can insert
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contacts;
CREATE POLICY "Anyone can submit contact form" ON public.contacts
    FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view contacts" ON public.contacts;
CREATE POLICY "Admins can view contacts" ON public.contacts
    FOR SELECT
    USING ((SELECT auth.jwt() ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins can update contacts" ON public.contacts;
CREATE POLICY "Admins can update contacts" ON public.contacts
    FOR UPDATE
    USING ((SELECT auth.jwt() ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins can delete contacts" ON public.contacts;
CREATE POLICY "Admins can delete contacts" ON public.contacts
    FOR DELETE
    USING ((SELECT auth.jwt() ->> 'role') = 'admin');

-- Policy for users: Users can view/update own profile, admins can view all
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT
    USING (
        (SELECT auth.role()) = 'authenticated' AND (
            email = (SELECT auth.jwt() ->> 'email')
            OR (SELECT auth.jwt() ->> 'role') = 'admin'
        )
    );

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT
    WITH CHECK (email = (SELECT auth.jwt() ->> 'email'));

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE
    USING (
        email = (SELECT auth.jwt() ->> 'email')
        OR (SELECT auth.jwt() ->> 'role') = 'admin'
    );

DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
CREATE POLICY "Admins can delete users" ON public.users
    FOR DELETE
    USING ((SELECT auth.jwt() ->> 'role') = 'admin');

-- Policy for user_activities: Track user actions
DROP POLICY IF EXISTS "Users can view own activities" ON public.user_activities;
CREATE POLICY "Users can view own activities" ON public.user_activities
    FOR SELECT
    USING (
        (SELECT auth.role()) = 'authenticated' AND (
            user_email = (SELECT auth.jwt() ->> 'email')
            OR (SELECT auth.jwt() ->> 'role') = 'admin'
        )
    );

DROP POLICY IF EXISTS "Allow insert activities" ON public.user_activities;
CREATE POLICY "Allow insert activities" ON public.user_activities
    FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can delete activities" ON public.user_activities;
CREATE POLICY "Admins can delete activities" ON public.user_activities
    FOR DELETE
    USING ((SELECT auth.jwt() ->> 'role') = 'admin');

-- Policy for product_views: Public read, authenticated insert
DROP POLICY IF EXISTS "Anyone can view product views" ON public.product_views;
CREATE POLICY "Anyone can view product views" ON public.product_views
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow insert product views" ON public.product_views;
CREATE POLICY "Allow insert product views" ON public.product_views
    FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can delete product views" ON public.product_views;
CREATE POLICY "Admins can delete product views" ON public.product_views
    FOR DELETE
    USING ((SELECT auth.jwt() ->> 'role') = 'admin');

-- Policy for newsletter_subscribers: Anyone can subscribe, admins manage
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers
    FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can view subscribers" ON public.newsletter_subscribers
    FOR SELECT
    USING ((SELECT auth.jwt() ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins can update subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can update subscribers" ON public.newsletter_subscribers
    FOR UPDATE
    USING ((SELECT auth.jwt() ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins can delete subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can delete subscribers" ON public.newsletter_subscribers
    FOR DELETE
    USING ((SELECT auth.jwt() ->> 'role') = 'admin');

-- Policy for cart_abandonment: Track abandoned carts
DROP POLICY IF EXISTS "Admins can view abandoned carts" ON public.cart_abandonment;
CREATE POLICY "Admins can view abandoned carts" ON public.cart_abandonment
    FOR SELECT
    USING ((SELECT auth.jwt() ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Allow insert cart abandonment" ON public.cart_abandonment;
CREATE POLICY "Allow insert cart abandonment" ON public.cart_abandonment
    FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update cart abandonment" ON public.cart_abandonment;
CREATE POLICY "Admins can update cart abandonment" ON public.cart_abandonment
    FOR UPDATE
    USING ((SELECT auth.jwt() ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins can delete cart abandonment" ON public.cart_abandonment;
CREATE POLICY "Admins can delete cart abandonment" ON public.cart_abandonment
    FOR DELETE
    USING ((SELECT auth.jwt() ->> 'role') = 'admin');

-- =============================================================================
-- PART 4: Grant Necessary Permissions
-- =============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT SELECT ON public.user_stats TO anon, authenticated;
GRANT SELECT ON public.order_summaries TO anon, authenticated;

-- Grant permissions for anonymous users (for public operations)
GRANT SELECT, INSERT ON public.contacts TO anon;
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT INSERT ON public.cart_abandonment TO anon;
GRANT INSERT ON public.product_views TO anon;

-- =============================================================================
-- PART 5: Fix Function Search Paths (Security Warning)
-- =============================================================================

-- Recreate update_updated_at_column function with fixed search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Recreate generate_order_number function with fixed search_path
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    new_order_number TEXT;
BEGIN
    new_order_number := 'BUMP-' || TO_CHAR(NOW(), 'YYYY') || '-' || 
                        LPAD(nextval('orders_id_seq')::TEXT, 6, '0');
    RETURN new_order_number;
END;
$$;

-- Recreate set_order_number function with fixed search_path
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$;

-- =============================================================================
-- COMPLETED
-- =============================================================================

-- To apply this migration:
-- 1. Copy this entire SQL content
-- 2. Go to Supabase Dashboard > SQL Editor
-- 3. Paste and run this script
-- 4. Verify all security issues are resolved in Database > Advisors
