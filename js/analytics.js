/**
 * Analytics & Tracking Manager for BUMABLE
 * Centralized tracking for Google Analytics 4, Facebook Pixel, and custom events
 * 
 * @version 1.0.0
 * @date 2025-12-19
 */

class AnalyticsManager {
    constructor() {
        this.isProduction = !window.Logger?.isDevMode();
        this.gaInitialized = false;
        this.fbInitialized = false;
        
        // Configuration - Replace with your actual IDs
        this.config = {
            googleAnalyticsId: 'G-XXXXXXXXXX', // Replace with your GA4 ID
            facebookPixelId: 'YOUR_PIXEL_ID',   // Replace with your Facebook Pixel ID
            enableInDev: false                   // Set to true to track in development
        };
        
        this.init();
    }

    /**
     * Initialize analytics services
     */
    init() {
        if (!this.shouldTrack()) {
            window.Logger?.log('Analytics disabled in development mode');
            return;
        }

        this.initGoogleAnalytics();
        this.initFacebookPixel();
    }

    /**
     * Check if tracking should be enabled
     */
    shouldTrack() {
        return this.isProduction || this.config.enableInDev;
    }

    /**
     * Initialize Google Analytics 4
     */
    initGoogleAnalytics() {
        try {
            // Load GA4 script
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.googleAnalyticsId}`;
            document.head.appendChild(script);

            // Initialize gtag
            window.dataLayer = window.dataLayer || [];
            window.gtag = function() { dataLayer.push(arguments); };
            window.gtag('js', new Date());
            window.gtag('config', this.config.googleAnalyticsId, {
                'send_page_view': true,
                'cookie_flags': 'SameSite=None;Secure'
            });

            this.gaInitialized = true;
            window.Logger?.success('Google Analytics initialized');
        } catch (error) {
            window.Logger?.error('Failed to initialize Google Analytics:', error);
        }
    }

    /**
     * Initialize Facebook Pixel
     */
    initFacebookPixel() {
        try {
            !function(f,b,e,v,n,t,s) {
                if(f.fbq) return; 
                n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq) f._fbq=n; 
                n.push=n; 
                n.loaded=!0; 
                n.version='2.0';
                n.queue=[]; 
                t=b.createElement(e); 
                t.async=!0;
                t.src=v; 
                s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)
            }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
            
            window.fbq('init', this.config.facebookPixelId);
            window.fbq('track', 'PageView');

            this.fbInitialized = true;
            window.Logger?.success('Facebook Pixel initialized');
        } catch (error) {
            window.Logger?.error('Failed to initialize Facebook Pixel:', error);
        }
    }

    /**
     * Track page view
     */
    trackPageView(pagePath, pageTitle) {
        if (!this.shouldTrack()) return;

        if (this.gaInitialized && window.gtag) {
            window.gtag('event', 'page_view', {
                page_path: pagePath,
                page_title: pageTitle
            });
        }

        if (this.fbInitialized && window.fbq) {
            window.fbq('track', 'PageView');
        }

        window.Logger?.log('Page view tracked:', pagePath);
    }

    /**
     * Track product view
     */
    trackProductView(product) {
        if (!this.shouldTrack()) return;

        const productData = {
            item_id: product.id,
            item_name: product.name,
            item_category: product.category,
            price: product.salePrice || product.regularPrice,
            currency: 'INR'
        };

        // Google Analytics
        if (this.gaInitialized && window.gtag) {
            window.gtag('event', 'view_item', {
                items: [productData]
            });
        }

        // Facebook Pixel
        if (this.fbInitialized && window.fbq) {
            window.fbq('track', 'ViewContent', {
                content_ids: [product.id],
                content_name: product.name,
                content_type: 'product',
                value: product.salePrice || product.regularPrice,
                currency: 'INR'
            });
        }

        window.Logger?.log('Product view tracked:', product.name);
    }

    /**
     * Track add to cart
     */
    trackAddToCart(product, quantity = 1) {
        if (!this.shouldTrack()) return;

        const productData = {
            item_id: product.id,
            item_name: product.name,
            item_category: product.category,
            price: product.salePrice || product.regularPrice,
            quantity: quantity,
            currency: 'INR'
        };

        // Google Analytics
        if (this.gaInitialized && window.gtag) {
            window.gtag('event', 'add_to_cart', {
                items: [productData],
                value: (product.salePrice || product.regularPrice) * quantity,
                currency: 'INR'
            });
        }

        // Facebook Pixel
        if (this.fbInitialized && window.fbq) {
            window.fbq('track', 'AddToCart', {
                content_ids: [product.id],
                content_name: product.name,
                content_type: 'product',
                value: (product.salePrice || product.regularPrice) * quantity,
                currency: 'INR'
            });
        }

        window.Logger?.log('Add to cart tracked:', product.name, 'x', quantity);
    }

    /**
     * Track begin checkout
     */
    trackBeginCheckout(items, total) {
        if (!this.shouldTrack()) return;

        const itemsData = items.map(item => ({
            item_id: item.id,
            item_name: item.name,
            item_category: item.category,
            price: item.price,
            quantity: item.quantity,
            currency: 'INR'
        }));

        // Google Analytics
        if (this.gaInitialized && window.gtag) {
            window.gtag('event', 'begin_checkout', {
                items: itemsData,
                value: total,
                currency: 'INR'
            });
        }

        // Facebook Pixel
        if (this.fbInitialized && window.fbq) {
            window.fbq('track', 'InitiateCheckout', {
                content_ids: items.map(i => i.id),
                contents: items.map(i => ({
                    id: i.id,
                    quantity: i.quantity
                })),
                value: total,
                currency: 'INR'
            });
        }

        window.Logger?.log('Begin checkout tracked, total:', total);
    }

    /**
     * Track purchase/conversion
     */
    trackPurchase(orderId, items, total, shipping = 0, tax = 0) {
        if (!this.shouldTrack()) return;

        const itemsData = items.map(item => ({
            item_id: item.id,
            item_name: item.name,
            item_category: item.category,
            price: item.price,
            quantity: item.quantity,
            currency: 'INR'
        }));

        // Google Analytics
        if (this.gaInitialized && window.gtag) {
            window.gtag('event', 'purchase', {
                transaction_id: orderId,
                value: total,
                tax: tax,
                shipping: shipping,
                currency: 'INR',
                items: itemsData
            });
        }

        // Facebook Pixel
        if (this.fbInitialized && window.fbq) {
            window.fbq('track', 'Purchase', {
                content_ids: items.map(i => i.id),
                contents: items.map(i => ({
                    id: i.id,
                    quantity: i.quantity
                })),
                value: total,
                currency: 'INR'
            });
        }

        window.Logger?.success('Purchase tracked, Order ID:', orderId, 'Total:', total);
    }

    /**
     * Track custom events
     */
    trackEvent(eventName, eventData = {}) {
        if (!this.shouldTrack()) return;

        // Google Analytics
        if (this.gaInitialized && window.gtag) {
            window.gtag('event', eventName, eventData);
        }

        // Facebook Pixel
        if (this.fbInitialized && window.fbq) {
            window.fbq('trackCustom', eventName, eventData);
        }

        window.Logger?.log('Custom event tracked:', eventName, eventData);
    }

    /**
     * Track search
     */
    trackSearch(searchTerm) {
        if (!this.shouldTrack()) return;

        // Google Analytics
        if (this.gaInitialized && window.gtag) {
            window.gtag('event', 'search', {
                search_term: searchTerm
            });
        }

        // Facebook Pixel
        if (this.fbInitialized && window.fbq) {
            window.fbq('track', 'Search', {
                search_string: searchTerm
            });
        }

        window.Logger?.log('Search tracked:', searchTerm);
    }

    /**
     * Update configuration (useful for setting real IDs after initialization)
     */
    updateConfig(config) {
        Object.assign(this.config, config);
        window.Logger?.log('Analytics configuration updated');
    }
}

// Create global analytics instance
window.analyticsManager = new AnalyticsManager();

// Helper functions for easy access
window.trackProductView = (product) => window.analyticsManager.trackProductView(product);
window.trackAddToCart = (product, quantity) => window.analyticsManager.trackAddToCart(product, quantity);
window.trackBeginCheckout = (items, total) => window.analyticsManager.trackBeginCheckout(items, total);
window.trackPurchase = (orderId, items, total, shipping, tax) => window.analyticsManager.trackPurchase(orderId, items, total, shipping, tax);
window.trackEvent = (name, data) => window.analyticsManager.trackEvent(name, data);
window.trackSearch = (term) => window.analyticsManager.trackSearch(term);
