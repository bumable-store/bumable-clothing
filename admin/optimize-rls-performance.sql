-- Optimize RLS Performance - Fix Auth Function Re-evaluation
-- This script fixes all performance warnings by optimizing RLS policies

-- =============================================================================
-- PART 1: Drop All Existing Policies
-- =============================================================================

-- Drop all policies on orders table
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;

-- Drop all policies on order_items table
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can update order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can delete order items" ON public.order_items;

-- Drop all policies on contacts table
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contacts;
DROP POLICY IF EXISTS "Admins can view contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins can update contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins can delete contacts" ON public.contacts;

-- Drop all policies on users table
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;

-- Drop all policies on user_activities table
DROP POLICY IF EXISTS "Users can view own activities" ON public.user_activities;
DROP POLICY IF EXISTS "Allow insert activities" ON public.user_activities;
DROP POLICY IF EXISTS "Admins can delete activities" ON public.user_activities;

-- Drop all policies on product_views table
DROP POLICY IF EXISTS "Anyone can view product views" ON public.product_views;
DROP POLICY IF EXISTS "Allow insert product views" ON public.product_views;
DROP POLICY IF EXISTS "Admins can delete product views" ON public.product_views;

-- Drop all policies on newsletter_subscribers table
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can view subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can update subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can delete subscribers" ON public.newsletter_subscribers;

-- Drop all policies on cart_abandonment table
DROP POLICY IF EXISTS "Admins can view abandoned carts" ON public.cart_abandonment;
DROP POLICY IF EXISTS "Allow insert cart abandonment" ON public.cart_abandonment;
DROP POLICY IF EXISTS "Admins can update cart abandonment" ON public.cart_abandonment;
DROP POLICY IF EXISTS "Admins can delete cart abandonment" ON public.cart_abandonment;

-- =============================================================================
-- PART 2: Create Optimized Policies with SELECT Wrappers
-- =============================================================================

-- Orders table policies (optimized)
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT
    USING (
        customer_email = (SELECT auth.jwt()) ->> 'email'
        OR (SELECT auth.jwt()) ->> 'role' = 'admin'
    );

CREATE POLICY "Admins can insert orders" ON public.orders
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can update orders" ON public.orders
    FOR UPDATE
    USING ((SELECT auth.jwt()) ->> 'role' = 'admin');

CREATE POLICY "Admins can delete orders" ON public.orders
    FOR DELETE
    USING ((SELECT auth.jwt()) ->> 'role' = 'admin');

-- Order items table policies (optimized)
CREATE POLICY "Users can view own order items" ON public.order_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
            AND (
                o.customer_email = (SELECT auth.jwt()) ->> 'email'
                OR (SELECT auth.jwt()) ->> 'role' = 'admin'
            )
        )
    );

CREATE POLICY "Allow insert order items" ON public.order_items
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can update order items" ON public.order_items
    FOR UPDATE
    USING ((SELECT auth.jwt()) ->> 'role' = 'admin');

CREATE POLICY "Admins can delete order items" ON public.order_items
    FOR DELETE
    USING ((SELECT auth.jwt()) ->> 'role' = 'admin');

-- Contacts table policies (optimized)
CREATE POLICY "Anyone can submit contact form" ON public.contacts
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can view contacts" ON public.contacts
    FOR SELECT
    USING ((SELECT auth.jwt()) ->> 'role' = 'admin');

CREATE POLICY "Admins can update contacts" ON public.contacts
    FOR UPDATE
    USING ((SELECT auth.jwt()) ->> 'role' = 'admin');

CREATE POLICY "Admins can delete contacts" ON public.contacts
    FOR DELETE
    USING ((SELECT auth.jwt()) ->> 'role' = 'admin');

-- Users table policies (optimized)
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT
    USING (
        email = (SELECT auth.jwt()) ->> 'email'
        OR (SELECT auth.jwt()) ->> 'role' = 'admin'
    );

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT
    WITH CHECK (email = (SELECT auth.jwt()) ->> 'email');

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE
    USING (
        email = (SELECT auth.jwt()) ->> 'email'
        OR (SELECT auth.jwt()) ->> 'role' = 'admin'
    );

CREATE POLICY "Admins can delete users" ON public.users
    FOR DELETE
    USING ((SELECT auth.jwt()) ->> 'role' = 'admin');

-- User activities table policies (optimized)
CREATE POLICY "Users can view own activities" ON public.user_activities
    FOR SELECT
    USING (
        user_email = (SELECT auth.jwt()) ->> 'email'
        OR (SELECT auth.jwt()) ->> 'role' = 'admin'
    );

CREATE POLICY "Allow insert activities" ON public.user_activities
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can delete activities" ON public.user_activities
    FOR DELETE
    USING ((SELECT auth.jwt()) ->> 'role' = 'admin');

-- Product views table policies (optimized)
CREATE POLICY "Anyone can view product views" ON public.product_views
    FOR SELECT
    USING (true);

CREATE POLICY "Allow insert product views" ON public.product_views
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can delete product views" ON public.product_views
    FOR DELETE
    USING ((SELECT auth.jwt()) ->> 'role' = 'admin');

-- Newsletter subscribers table policies (optimized)
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can view subscribers" ON public.newsletter_subscribers
    FOR SELECT
    USING ((SELECT auth.jwt()) ->> 'role' = 'admin');

CREATE POLICY "Admins can update subscribers" ON public.newsletter_subscribers
    FOR UPDATE
    USING ((SELECT auth.jwt()) ->> 'role' = 'admin');

CREATE POLICY "Admins can delete subscribers" ON public.newsletter_subscribers
    FOR DELETE
    USING ((SELECT auth.jwt()) ->> 'role' = 'admin');

-- Cart abandonment table policies (optimized)
CREATE POLICY "Admins can view abandoned carts" ON public.cart_abandonment
    FOR SELECT
    USING ((SELECT auth.jwt()) ->> 'role' = 'admin');

CREATE POLICY "Allow insert cart abandonment" ON public.cart_abandonment
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can update cart abandonment" ON public.cart_abandonment
    FOR UPDATE
    USING ((SELECT auth.jwt()) ->> 'role' = 'admin');

CREATE POLICY "Admins can delete cart abandonment" ON public.cart_abandonment
    FOR DELETE
    USING ((SELECT auth.jwt()) ->> 'role' = 'admin');

-- =============================================================================
-- PART 3: Add Missing Indexes for Foreign Keys
-- =============================================================================

-- Index for order_items.order_id foreign key
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- Index for user_activities.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);

-- =============================================================================
-- COMPLETED
-- =============================================================================

SELECT 'RLS Performance Optimization Completed! ✅' as message;
