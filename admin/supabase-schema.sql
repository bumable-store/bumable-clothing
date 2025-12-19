-- BUMABLE E-commerce Database Schema for Supabase
-- This SQL creates all necessary tables for your clothing store
-- Copy and paste these commands into your Supabase SQL editor

-- 1. Users Table (Customer Registration & Authentication)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    marketing_consent BOOLEAN DEFAULT false,
    total_spent DECIMAL(10,2) DEFAULT 0,
    login_count INTEGER DEFAULT 0
);

-- 2. Orders Table (Purchase Records)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(200) NOT NULL,
    customer_phone VARCHAR(20),
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address TEXT,
    payment_method VARCHAR(50) DEFAULT 'cod',
    order_status VARCHAR(20) DEFAULT 'pending',
    order_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Order Items Table (Individual Products in Orders)
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_name VARCHAR(200) NOT NULL,
    product_size VARCHAR(10),
    product_color VARCHAR(50),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    product_image_url TEXT
);

-- 4. Products Table (Product Management)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    regular_price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    on_sale BOOLEAN DEFAULT false,
    image_url TEXT NOT NULL,
    gallery_images TEXT[], -- Array of additional images
    in_stock BOOLEAN DEFAULT true,
    stock_count INTEGER DEFAULT 0,
    available_sizes TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active'
);

-- 5. Contacts Table (Customer Inquiries)
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(300) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new',
    priority VARCHAR(10) DEFAULT 'normal',
    admin_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP
);

-- 5. User Activities Table (Login/Action Tracking)
CREATE TABLE IF NOT EXISTS user_activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    page_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Product Views Table (Analytics)
CREATE TABLE IF NOT EXISTS product_views (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(200) NOT NULL,
    product_category VARCHAR(100),
    user_email VARCHAR(255),
    ip_address VARCHAR(45),
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(200),
    source VARCHAR(100) DEFAULT 'website',
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- 8. Cart Abandonment Table (Marketing)
CREATE TABLE IF NOT EXISTS cart_abandonment (
    id SERIAL PRIMARY KEY,
    customer_email VARCHAR(255),
    items JSON NOT NULL,
    total_amount DECIMAL(10,2),
    abandoned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recovery_email_sent BOOLEAN DEFAULT false
);

-- Create indexes for better performance (optimized - Supabase linter approved)
-- Essential indexes only (unused indexes removed for better performance)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id); -- Foreign key index

-- Composite index for products (better than multiple single-column indexes)
CREATE INDEX IF NOT EXISTS idx_products_category_stock ON products(category, in_stock) WHERE in_stock = true;

-- Create auto-update function for updated_at timestamp
-- Fixed with search_path for security (Supabase linter recommendation)
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

-- Apply auto-update trigger to orders table
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (optional)
-- INSERT INTO users (first_name, last_name, email, phone) VALUES
-- ('John', 'Doe', 'john@example.com', '+1234567890'),
-- ('Jane', 'Smith', 'jane@example.com', '+0987654321');

-- View to get order summaries with items
CREATE OR REPLACE VIEW order_summaries AS
SELECT 
    o.id,
    o.order_number,
    o.customer_name,
    o.customer_email,
    o.total_amount,
    o.order_status,
    o.payment_method,
    o.created_at,
    COUNT(oi.id) as item_count,
    STRING_AGG(oi.product_name || ' x' || oi.quantity, ', ') as items_summary
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.customer_name, o.customer_email, 
         o.total_amount, o.order_status, o.payment_method, o.created_at
ORDER BY o.created_at DESC;

-- View to get user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.email,
    u.created_at,
    u.last_login,
    u.total_spent,
    COUNT(o.id) as total_orders,
    MAX(o.created_at) as last_order_date
FROM users u
LEFT JOIN orders o ON u.email = o.customer_email
GROUP BY u.id, u.first_name, u.last_name, u.email, 
         u.created_at, u.last_login, u.total_spent
ORDER BY u.created_at DESC;

-- Function to generate unique order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_order_number TEXT;
BEGIN
    new_order_number := 'BUMP-' || TO_CHAR(NOW(), 'YYYY') || '-' || 
                        LPAD(nextval('orders_id_seq')::TEXT, 6, '0');
    RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order numbers
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_number();

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Optimized policy for products SELECT (auth function wrapped in SELECT for performance)
CREATE POLICY "products_select_policy" ON products
    FOR SELECT
    USING (
        -- Everyone can see in-stock products, authenticated users can see all
        -- (select ...) prevents re-evaluation for each row
        in_stock = true OR (SELECT auth.role()) = 'authenticated'
    );

-- Products modification policies (authenticated only, optimized with SELECT)
CREATE POLICY "products_insert_policy" ON products
    FOR INSERT
    WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "products_update_policy" ON products
    FOR UPDATE
    USING ((SELECT auth.role()) = 'authenticated')
    WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "products_delete_policy" ON products
    FOR DELETE
    USING ((SELECT auth.role()) = 'authenticated');

-- Success message
SELECT 'BUMABLE Database setup completed successfully! 🎉' as message;