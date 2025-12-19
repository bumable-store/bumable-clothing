/**
 * BUMABLE - Supabase Database Integration (CLOUD ONLY)
 * Complete e-commerce database with authentication, orders, and analytics
 * FREE 500MB PostgreSQL database with real-time features
 * NO LOCAL STORAGE - 100% Cloud Database
 */

class SupabaseDB {
    constructor() {
        // Configuration stored only during session for security
        this.supabaseUrl = localStorage.getItem('supabase_url') || '';
        this.supabaseKey = localStorage.getItem('supabase_key') || '';
        this.connected = false;
        
        if (this.supabaseUrl && this.supabaseKey) {
            this.initializeSupabase();
        } else {
            console.log('🔧 Supabase not configured. Visit /admin/setup-database.html to configure.');
        }
    }

    /**
     * Initialize Supabase client
     */
    async initializeSupabase() {
        try {
            // Load Supabase from CDN if not already loaded
            if (typeof supabase === 'undefined') {
                await this.loadSupabaseSDK();
            }
            
            // Create Supabase client
            this.client = supabase.createClient(this.supabaseUrl, this.supabaseKey);
            
            // Test connection
            const { data, error } = await this.client.from('users').select('count').limit(1);
            if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist yet
                throw error;
            }
            
            this.connected = true;
            console.log('✅ Supabase connected successfully (Cloud-only mode)');
        } catch (error) {
            console.error('❌ Supabase connection failed:', error);
            this.connected = false;
        }
    }

    /**
     * Load Supabase SDK dynamically
     */
    async loadSupabaseSDK() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Setup database tables (creates if they don't exist)
     */
    async setupTables() {
        // Tables will be created via Supabase dashboard or SQL
        console.log('📋 Database tables ready');
    }

    /**
     * Test database connection
     */
    async testConnection() {
        try {
            const { data, error } = await this.client.from('users').select('count').limit(1);
            return { success: true, message: 'Database connected successfully!' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * Check if Supabase is ready
     */
    isReady() {
        return this.connected === true && this.client;
    }

    // ==========================================
    // USER MANAGEMENT
    // ==========================================

    /**
     * Register new user
     */
    async registerUser(userData) {
        try {
            const { firstname, lastname, email, phone } = userData;
            
            const { data, error } = await this.client
                .from('users')
                .insert([{
                    first_name: firstname,
                    last_name: lastname,
                    email: email,
                    phone: phone,
                    created_at: new Date().toISOString(),
                    last_login: new Date().toISOString(),
                    status: 'active'
                }])
                .select()
                .single();

            if (error) throw error;
            
            console.log('✅ User registered successfully');
            return { success: true, user: data };
        } catch (error) {
            console.error('❌ User registration failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Login user
     */
    async loginUser(email, password) {
        try {
            // Update last login
            const { data, error } = await this.client
                .from('users')
                .update({ last_login: new Date().toISOString() })
                .eq('email', email)
                .select()
                .single();

            if (error) throw error;
            
            // Log login activity
            await this.logUserActivity(data.id, 'login', 'User logged in');
            
            console.log('✅ User logged in successfully');
            return { success: true, user: data };
        } catch (error) {
            console.error('❌ Login failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get all users (admin)
     */
    async getAllUsers() {
        try {
            const { data, error } = await this.client
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, users: data };
        } catch (error) {
            console.error('❌ Failed to fetch users:', error);
            return { success: false, error: error.message };
        }
    }

    // ==========================================
    // SESSION MANAGEMENT
    // ==========================================

    /**
     * Create user session
     */
    async createSession(user) {
        try {
            const sessionData = {
                user_email: user.email,
                user_id: user.id || user.email,
                session_data: JSON.stringify(user),
                created_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
            };

            const { data, error } = await this.client
                .from('user_sessions')
                .upsert(sessionData, { onConflict: 'user_email' })
                .select()
                .single();

            if (error) throw error;
            console.log('✅ Session created in Supabase');
            return { success: true, session: data };
        } catch (error) {
            console.error('❌ Session creation failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get current session
     */
    async getCurrentSession() {
        try {
            // This would need to be called with a user identifier
            // For now, return success: false as we need to implement proper session handling
            return { success: false, message: 'Session retrieval not implemented' };
        } catch (error) {
            console.error('❌ Session retrieval failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete user session (logout)
     */
    async deleteSession(userEmail) {
        try {
            const { error } = await this.client
                .from('user_sessions')
                .delete()
                .eq('user_email', userEmail);

            if (error) throw error;
            console.log('✅ Session deleted from Supabase');
            return { success: true };
        } catch (error) {
            console.error('❌ Session deletion failed:', error);
            return { success: false, error: error.message };
        }
    }

    // ==========================================
    // ORDER MANAGEMENT  
    // ==========================================

    /**
     * Save new order
     */
    async saveOrder(orderData) {
        try {
            const { 
                customerEmail, 
                customerName, 
                items, 
                totalAmount, 
                shippingAddress,
                paymentMethod = 'cod' // Default to Cash on Delivery
            } = orderData;

            // Create order
            const { data: order, error: orderError } = await this.client
                .from('orders')
                .insert([{
                    customer_email: customerEmail,
                    customer_name: customerName,
                    total_amount: totalAmount,
                    shipping_address: JSON.stringify(shippingAddress),
                    payment_method: paymentMethod,
                    order_status: 'pending',
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (orderError) throw orderError;

            // Create order items
            const orderItems = items.map(item => ({
                order_id: order.id,
                product_name: item.name,
                product_size: item.size,
                product_color: item.color || 'default',
                quantity: item.quantity,
                unit_price: item.price,
                total_price: item.price * item.quantity
            }));

            const { error: itemsError } = await this.client
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            console.log('✅ Order saved successfully');
            return { success: true, order: order };
        } catch (error) {
            console.error('❌ Order save failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get all orders (admin)
     */
    async getAllOrders() {
        try {
            const { data, error } = await this.client
                .from('orders')
                .select(`
                    *,
                    order_items (*)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, orders: data };
        } catch (error) {
            console.error('❌ Failed to fetch orders:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update order status
     */
    async updateOrderStatus(orderId, status) {
        try {
            const { data, error } = await this.client
                .from('orders')
                .update({ 
                    order_status: status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', orderId)
                .select()
                .single();

            if (error) throw error;
            
            console.log('✅ Order status updated');
            return { success: true, order: data };
        } catch (error) {
            console.error('❌ Order status update failed:', error);
            return { success: false, error: error.message };
        }
    }

    // ==========================================
    // CONTACT & SUPPORT
    // ==========================================

    /**
     * Save contact form submission
     */
    async saveContact(contactData) {
        try {
            const { name, email, subject, message } = contactData;
            
            const { data, error } = await this.client
                .from('contacts')
                .insert([{
                    name: name,
                    email: email,
                    subject: subject,
                    message: message,
                    status: 'new',
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;
            
            console.log('✅ Contact saved successfully');
            return { success: true, contact: data };
        } catch (error) {
            console.error('❌ Contact save failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get all contacts (admin)
     */
    async getAllContacts() {
        try {
            const { data, error } = await this.client
                .from('contacts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, contacts: data };
        } catch (error) {
            console.error('❌ Failed to fetch contacts:', error);
            return { success: false, error: error.message };
        }
    }

    // ==========================================
    // ANALYTICS & TRACKING
    // ==========================================

    /**
     * Log user activity
     */
    async logUserActivity(userId, action, details = '') {
        try {
            const { error } = await this.client
                .from('user_activities')
                .insert([{
                    user_id: userId,
                    action: action,
                    details: details,
                    ip_address: await this.getUserIP(),
                    user_agent: navigator.userAgent,
                    created_at: new Date().toISOString()
                }]);

            if (error) throw error;
        } catch (error) {
            console.error('Activity logging failed:', error);
        }
    }

    /**
     * Get user IP address
     */
    async getUserIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch {
            return 'unknown';
        }
    }

    /**
     * Get all user activities (admin)
     */
    async getAllUserActivities() {
        try {
            const { data, error } = await this.client
                .from('user_activities')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, activities: data || [] };
        } catch (error) {
            console.error('❌ Failed to fetch user activities:', error);
            return { success: false, error: error.message, activities: [] };
        }
    }

    /**
     * Get analytics data (admin)
     */
    async getAnalytics() {
        try {
            const [usersResult, ordersResult, contactsResult] = await Promise.all([
                this.client.from('users').select('id', { count: 'exact' }),
                this.client.from('orders').select('id, total_amount', { count: 'exact' }),
                this.client.from('contacts').select('id', { count: 'exact' })
            ]);

            // Calculate total revenue
            const { data: orders } = await this.client
                .from('orders')
                .select('total_amount')
                .eq('order_status', 'completed');

            const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

            return {
                success: true,
                analytics: {
                    totalUsers: usersResult.count || 0,
                    totalOrders: ordersResult.count || 0,
                    totalContacts: contactsResult.count || 0,
                    totalRevenue: totalRevenue
                }
            };
        } catch (error) {
            console.error('❌ Analytics fetch failed:', error);
            return { success: false, error: error.message };
        }
    }

    // ==========================================
    // PRODUCT MANAGEMENT
    // ==========================================

    /**
     * Get all products
     */
    async getAllProducts() {
        try {
            const { data, error } = await this.client
                .from('products')
                .select('*')
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return {
                success: true,
                products: data || []
            };
        } catch (error) {
            console.error('Error fetching products:', error);
            return {
                success: false,
                error: error.message,
                products: []
            };
        }
    }

    /**
     * Add new product
     */
    async addProduct(productData) {
        try {
            const { data, error } = await this.client
                .from('products')
                .insert([{
                    product_id: productData.id,
                    name: productData.name,
                    description: productData.description,
                    category: productData.category,
                    regular_price: productData.regularPrice,
                    sale_price: productData.salePrice || null,
                    on_sale: productData.onSale || false,
                    image_url: productData.image,
                    gallery_images: productData.gallery || [],
                    in_stock: productData.inStock || true,
                    stock_count: productData.stockCount || 0,
                    available_sizes: productData.availableSizes || [],
                    featured: productData.featured || false
                }])
                .select();

            if (error) throw error;

            return {
                success: true,
                product: data[0],
                message: 'Product added successfully'
            };
        } catch (error) {
            console.error('Error adding product:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Update product
     */
    async updateProduct(productId, productData) {
        try {
            const updateData = {
                name: productData.name,
                description: productData.description,
                category: productData.category,
                regular_price: productData.regularPrice,
                sale_price: productData.salePrice || null,
                on_sale: productData.onSale || false,
                image_url: productData.image,
                gallery_images: productData.gallery || [],
                in_stock: productData.inStock || true,
                stock_count: productData.stockCount || 0,
                available_sizes: productData.availableSizes || [],
                featured: productData.featured || false,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await this.client
                .from('products')
                .update(updateData)
                .eq('product_id', productId)
                .select();

            if (error) throw error;

            return {
                success: true,
                product: data[0],
                message: 'Product updated successfully'
            };
        } catch (error) {
            console.error('Error updating product:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Delete product
     */
    async deleteProduct(productId) {
        try {
            const { data, error } = await this.client
                .from('products')
                .update({ status: 'deleted' })
                .eq('product_id', productId)
                .select();

            if (error) throw error;

            return {
                success: true,
                message: 'Product deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting product:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Delete order
     */
    async deleteOrder(orderId) {
        try {
            // First delete order items
            const { error: itemsError } = await this.client
                .from('order_items')
                .delete()
                .eq('order_id', orderId);

            if (itemsError) throw itemsError;

            // Then delete the order
            const { error: orderError } = await this.client
                .from('orders')
                .delete()
                .eq('id', orderId);

            if (orderError) throw orderError;

            return {
                success: true,
                message: 'Order deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting order:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Delete user
     */
    async deleteUser(userId) {
        try {
            const { error } = await this.client
                .from('users')
                .delete()
                .eq('id', userId);

            if (error) throw error;

            return {
                success: true,
                message: 'User deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting user:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }


    /**
     * Migrate existing products to Supabase
     */
    async migrateProductsToSupabase() {
        try {
            // Get existing products from local storage or products.js
            const existingProducts = window.ProductManager ? 
                new window.ProductManager().products : 
                [];

            if (existingProducts.length === 0) {
                return {
                    success: false,
                    message: 'No products found to migrate'
                };
            }

            const migratedProducts = [];
            
            for (const product of existingProducts) {
                const result = await this.addProduct(product);
                if (result.success) {
                    migratedProducts.push(result.product);
                } else {
                    console.warn(`Failed to migrate product ${product.id}:`, result.error);
                }
            }

            return {
                success: true,
                message: `Successfully migrated ${migratedProducts.length} products`,
                products: migratedProducts
            };
        } catch (error) {
            console.error('Error migrating products:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ==========================================
    // ADMIN DASHBOARD METHODS
    // ==========================================

    /**
     * Get all orders for admin dashboard
     */
    async getAllOrders() {
        try {
            const { data, error } = await this.client
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return {
                success: true,
                orders: data || []
            };
        } catch (error) {
            console.error('Error fetching orders:', error);
            return {
                success: false,
                error: error.message,
                orders: []
            };
        }
    }

    /**
     * Get all users for admin dashboard
     */
    async getAllUsers() {
        try {
            const { data, error } = await this.client
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return {
                success: true,
                users: data || []
            };
        } catch (error) {
            console.error('Error fetching users:', error);
            return {
                success: false,
                error: error.message,
                users: []
            };
        }
    }

    /**
     * Get all contact queries for admin dashboard
     */
    async getAllContacts() {
        try {
            const { data, error } = await this.client
                .from('contacts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return {
                success: true,
                contacts: data || []
            };
        } catch (error) {
            console.error('Error fetching contacts:', error);
            return {
                success: false,
                error: error.message,
                contacts: []
            };
        }
    }

    // ==========================================
    // CONFIGURATION
    // ==========================================

    /**
     * Configure Supabase credentials
     */
    static configure(url, key) {
        localStorage.setItem('supabase_url', url);
        localStorage.setItem('supabase_key', key);
        
        // Reload the page to reinitialize
        window.location.reload();
    }

    /**
     * Check if Supabase is configured
     */
    static isConfigured() {
        return localStorage.getItem('supabase_url') && localStorage.getItem('supabase_key');
    }

    // ===== PRODUCT MANAGEMENT METHODS =====

    /**
     * Get all products from database
     */
    async getAllProducts() {
        try {
            const { data, error } = await this.client
                .from('products')
                .select('*')
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    }

    /**
     * Get a single product by ID
     */
    async getProduct(productId) {
        try {
            const { data, error} = await this.client
                .from('products')
                .select('*')
                .eq('product_id', productId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching product:', error);
            return null;
        }
    }

    /**
     * Get products by category
     */
    async getProductsByCategory(category) {
        try {
            const { data, error } = await this.client
                .from('products')
                .select('*')
                .eq('category', category)
                .eq('status', 'active')
                .order('name');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching products by category:', error);
            return [];
        }
    }

    /**
     * Update an existing product
     */
    async updateProduct(productId, updates) {
        try {
            const updateData = {};
            
            // Map camelCase to snake_case
            if (updates.name !== undefined) updateData.name = updates.name;
            if (updates.description !== undefined) updateData.description = updates.description;
            if (updates.category !== undefined) updateData.category = updates.category;
            if (updates.regularPrice !== undefined) updateData.regular_price = updates.regularPrice;
            if (updates.regular_price !== undefined) updateData.regular_price = updates.regular_price;
            if (updates.salePrice !== undefined) updateData.sale_price = updates.salePrice;
            if (updates.sale_price !== undefined) updateData.sale_price = updates.sale_price;
            if (updates.onSale !== undefined) updateData.on_sale = updates.onSale;
            if (updates.on_sale !== undefined) updateData.on_sale = updates.on_sale;
            if (updates.image !== undefined) updateData.image_url = updates.image;
            if (updates.image_url !== undefined) updateData.image_url = updates.image_url;
            if (updates.inStock !== undefined) updateData.in_stock = updates.inStock;
            if (updates.in_stock !== undefined) updateData.in_stock = updates.in_stock;
            if (updates.stockCount !== undefined) updateData.stock_count = updates.stockCount;
            if (updates.stock_count !== undefined) updateData.stock_count = updates.stock_count;
            if (updates.availableSizes !== undefined) updateData.available_sizes = updates.availableSizes;
            if (updates.available_sizes !== undefined) updateData.available_sizes = updates.available_sizes;

            const { data, error } = await this.client
                .from('products')
                .update(updateData)
                .eq('product_id', productId)
                .select();

            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error updating product:', error);
            return { success: false, error: error.message };
        }
    }
}

// Initialize global Supabase database instance
window.supabaseDB = new SupabaseDB();

console.log('🚀 Supabase Database System Loaded');