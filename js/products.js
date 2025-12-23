// BUMABLE Product Management - Production Version

class ProductManager {
    constructor() {
        // Products are now managed in Supabase
        this.products = [];
        this.loading = true;
        this.initialized = false;
        this.cacheTTL = 10 * 60 * 1000; // 10 minutes
        
        // Initialize products from Supabase
        this.init();
    }

    async init() {
        window.Logger?.time('Product loading');
        
        // Setup real-time product subscription first
        this.setupRealtimeSync();
        
        // Try to get from cache first
        const cachedProducts = window.CacheManager?.get('products');
        if (cachedProducts && cachedProducts.length > 0) {
            this.products = cachedProducts;
            this.loading = false;
            this.initialized = true;
            window.Logger?.success(`Loaded ${this.products.length} products from cache`);
            window.Logger?.timeEnd('Product loading');
            return;
        }

        // If not in cache, fetch from Supabase
        if (window.supabaseDB && window.supabaseDB.client) {
            try {
                this.loading = true;
                const result = await window.supabaseDB.getAllProducts();
                const dbProducts = result.products || [];
                
                if (dbProducts && dbProducts.length > 0) {
                    // Map snake_case database fields to camelCase
                    this.products = dbProducts.map(p => ({
                        id: p.product_id || p.id,
                        name: p.name,
                        regularPrice: p.regular_price,
                        salePrice: p.sale_price,
                        onSale: p.on_sale,
                        image: p.image_url,
                        category: p.category,
                        description: p.description,
                        inStock: p.in_stock,
                        stockCount: p.stock_count,
                        availableSizes: p.available_sizes
                    }));
                    
                    // Cache the products
                    window.CacheManager?.set('products', this.products, this.cacheTTL);
                    
                    window.Logger?.success(`Loaded ${this.products.length} products from Supabase`);
                } else {
                    // Fallback to default products if database is empty
                    window.Logger?.warn('No products found in database, using defaults');
                    this.products = this.getThe12Products();
                }
            } catch (error) {
                window.Logger?.error('Error loading products from Supabase:', error);
                // Fallback to default products on error
                this.products = this.getThe12Products();
            } finally {
                this.loading = false;
                this.initialized = true;
                window.Logger?.timeEnd('Product loading');
            }
        } else {
            window.Logger?.warn('Supabase not configured, using default products');
            this.products = this.getThe12Products();
            this.loading = false;
            this.initialized = true;
            window.Logger?.timeEnd('Product loading');
        }
    }

    // Setup real-time product synchronization
    setupRealtimeSync() {
        if (!window.supabaseDB || !window.supabaseDB.client) {
            window.Logger?.warn('Supabase not available for real-time sync');
            return;
        }

        try {
            const channel = window.supabaseDB.client
                .channel('products-realtime')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'products'
                    },
                    async (payload) => {
                        window.Logger?.info('Product update received:', payload.eventType);
                        
                        // Refresh products from database
                        await this.refreshProducts();
                        
                        // Clear cache to force reload
                        window.CacheManager?.delete('products');
                        
                        // Notify user of changes
                        if (payload.eventType === 'INSERT') {
                            window.Logger?.success(`New product added: ${payload.new.name}`);
                        } else if (payload.eventType === 'UPDATE') {
                            window.Logger?.info(`Product updated: ${payload.new.name}`);
                        } else if (payload.eventType === 'DELETE') {
                            window.Logger?.info(`Product deleted`);
                        }
                        
                        // Trigger page refresh if we're on shop page
                        if (window.location.pathname.includes('shop') && typeof displayProducts === 'function') {
                            displayProducts();
                        }
                    }
                )
                .subscribe();

            window.Logger?.success('Real-time product sync enabled');
        } catch (error) {
            window.Logger?.error('Failed to setup real-time sync:', error);
        }
    }

    // Refresh products from database
    async refreshProducts() {
        try {
            const result = await window.supabaseDB.getAllProducts();
            const dbProducts = result.products || [];
            
            if (dbProducts && dbProducts.length > 0) {
                this.products = dbProducts.map(p => ({
                    id: p.product_id || p.id,
                    name: p.name,
                    regularPrice: p.regular_price,
                    salePrice: p.sale_price,
                    onSale: p.on_sale,
                    image: p.image_url,
                    category: p.category,
                    description: p.description,
                    inStock: p.in_stock,
                    stockCount: p.stock_count,
                    availableSizes: p.available_sizes
                }));
                
                // Update cache
                window.CacheManager?.set('products', this.products, this.cacheTTL);
                window.Logger?.success(`Refreshed ${this.products.length} products`);
            }
        } catch (error) {
            window.Logger?.error('Error refreshing products:', error);
        }
    }

    async waitForInit() {
        if (this.initialized) return;
        return new Promise(resolve => {
            const checkInit = setInterval(() => {
                if (this.initialized) {
                    clearInterval(checkInit);
                    resolve();
                }
            }, 100);
        });
    }

    getThe12Products() {
        return [
            {id:'bumable-brief-cheery-red',name:'Bumable Brief – Cheery Red',regularPrice:499,salePrice:199,onSale:true,image:'../images/hero-product-1.jpg',category:'briefs',description:'Classic Bumable brief in cheery red',inStock:true,stockCount:50,availableSizes:['S','M','L','XL','XXL']},
            {id:'bumable-brief-olive',name:'Bumable Brief – Olive',regularPrice:499,salePrice:199,onSale:true,image:'../images/hero-product-2.jpg',category:'briefs',description:'Classic Bumable brief in olive',inStock:true,stockCount:45,availableSizes:['S','M','L','XL','XXL']},
            {id:'bumable-brief-lt-grey',name:'Bumable Brief – Lt Grey',regularPrice:499,salePrice:199,onSale:true,image:'../images/hero-product-1.jpg',category:'briefs',description:'Classic Bumable brief in light grey',inStock:true,stockCount:55,availableSizes:['S','M','L','XL','XXL']},
            {id:'bumable-brief-navy',name:'Bumable Brief – Navy',regularPrice:499,salePrice:199,onSale:true,image:'../images/hero-product-2.jpg',category:'briefs',description:'Classic Bumable brief in navy',inStock:true,stockCount:40,availableSizes:['S','M','L','XL','XXL']},
            {id:'bumable-brief-black',name:'Bumable Brief – Black',regularPrice:499,salePrice:199,onSale:true,image:'../images/hero-product-1.jpg',category:'briefs',description:'Classic Bumable brief in black',inStock:true,stockCount:60,availableSizes:['S','M','L','XL','XXL']},
            {id:'tie-and-dye-brief',name:'Tie and Dye Brief',regularPrice:599,salePrice:249,onSale:true,image:'../images/products/tie-dye/tie-dye-1-main.jpg',category:'tie-dye',description:'Vibrant tie-dye brief with unique patterns',inStock:true,stockCount:30,availableSizes:['S','M','L','XL','XXL']},
            {id:'tie-and-dye-trunks',name:'Tie and Dye Trunks',regularPrice:599,salePrice:249,onSale:true,image:'../images/products/tie-dye/tie-dye-2-main.jpg',category:'tie-dye',description:'Colorful tie-dye trunks with artistic designs',inStock:true,stockCount:25,availableSizes:['S','M','L','XL','XXL']},
            {id:'solid-trunks-frozen-navy',name:'Solid Trunks – Frozen Navy',regularPrice:499,salePrice:199,onSale:true,image:'../images/products/solid/solid-navy-main.jpg',category:'trunks',description:'Solid navy trunks',inStock:true,stockCount:35,availableSizes:['S','M','L','XL','XXL']},
            {id:'solid-trunks-frozen-grey',name:'Solid Trunks – Frozen Grey',regularPrice:499,salePrice:199,onSale:true,image:'../images/products/solid/solid-2-main.jpg',category:'trunks',description:'Solid grey trunks',inStock:true,stockCount:42,availableSizes:['S','M','L','XL','XXL']},
            {id:'solid-trunks-frozen-black',name:'Solid Trunks – Frozen Black',regularPrice:499,salePrice:199,onSale:true,image:'../images/products/solid/solid-3-main.jpg',category:'trunks',description:'Solid black trunks',inStock:true,stockCount:38,availableSizes:['S','M','L','XL','XXL']},
            {id:'solid-trunks-frozen-green',name:'Solid Trunks – Frozen Green',regularPrice:499,salePrice:199,onSale:true,image:'../images/products/solid/solid-4-main.jpg',category:'trunks',description:'Solid green trunks',inStock:true,stockCount:33,availableSizes:['S','M','L','XL','XXL']},
            {id:'solid-trunks-frozen-burgundy',name:'Solid Trunks – Frozen Burgundy',regularPrice:499,salePrice:199,onSale:true,image:'../images/products/solid/solid-5-main.jpg',category:'trunks',description:'Solid burgundy trunks',inStock:true,stockCount:29,availableSizes:['S','M','L','XL','XXL']}
        ];
    }

    async getAllProducts() { 
        await this.waitForInit();
        return this.products; 
    }
    
    async getProduct(id) { 
        await this.waitForInit();
        return this.products.find(p => p.id === id); 
    }
    
    async getProductsByCategory(category) { 
        await this.waitForInit();
        return this.products.filter(p => p.category === category); 
    }
    
    getCurrentPrice(product) {
        return product.salePrice || product.regularPrice;
    }
    
    getDiscountPercentage(product) {
        if (!product.onSale || !product.salePrice) return 0;
        return Math.round((1 - product.salePrice / product.regularPrice) * 100);
    }
    
    async updateProduct(id, updates) {
        const index = this.products.findIndex(p => p.id === id);
        if (index === -1) return false;

        // Update in Supabase if configured
        if (window.supabaseDB && window.supabaseDB.client) {
            try {
                const result = await window.supabaseDB.updateProduct(id, updates);
                if (result.success) {
                    // Update local cache with database response
                    if (result.data) {
                        this.products[index] = {
                            id: result.data.product_id,
                            name: result.data.name,
                            regularPrice: result.data.regular_price,
                            salePrice: result.data.sale_price,
                            onSale: result.data.on_sale,
                            image: result.data.image_url,
                            category: result.data.category,
                            description: result.data.description,
                            inStock: result.data.in_stock,
                            stockCount: result.data.stock_count,
                            availableSizes: result.data.available_sizes
                        };
                    }
                    console.log('✅ Product updated in Supabase and synced across all devices');
                    return true;
                } else {
                    console.error('❌ Failed to update product in Supabase:', result.error);
                    return false;
                }
            } catch (error) {
                console.error('❌ Error updating product:', error);
                return false;
            }
        } else {
            // Fallback to local update only
            this.products[index] = {...this.products[index], ...updates};
            console.warn('⚠️ Product updated locally only (Supabase not configured)');
            return true;
        }
    }

    saveToStorage() {
        // Deprecated - products are now stored in Supabase only
        console.log('Products are managed in Supabase cloud database');
    }

    resetToDefaults() {
        this.products = this.getThe12Products();
        // Products are managed in Supabase - no localStorage to remove
    }
}

// Initialize product manager when script loads
if (typeof window !== 'undefined') {
    // Initialize ProductManager globally
    window.ProductManager = ProductManager;
    window.productManager = new ProductManager();
}