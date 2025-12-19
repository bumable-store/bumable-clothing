-- FIX SUPABASE SECURITY WARNING: Function Search Path Mutable
-- This fixes the security warning for update_updated_at_column function
-- Run this in your Supabase SQL Editor

-- Drop and recreate the function with proper security settings
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

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

-- Recreate the trigger for orders table
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE 'Security fix applied successfully! Function update_updated_at_column now has fixed search_path.';
END $$;
