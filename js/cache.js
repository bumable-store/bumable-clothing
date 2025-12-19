/**
 * Cache Manager for Bumable Clothing
 * Provides localStorage-based caching with TTL support
 * Reduces API calls and improves performance
 * 
 * @version 1.0.0
 * @date 2025-12-19
 */

class CacheManager {
    constructor() {
        this.prefix = 'bumable_cache_';
        this.defaultTTL = 10 * 60 * 1000; // 10 minutes in milliseconds
    }

    /**
     * Generate cache key with prefix
     */
    _getKey(key) {
        return this.prefix + key;
    }

    /**
     * Set item in cache with TTL
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttl - Time to live in milliseconds (default: 10 min)
     */
    set(key, value, ttl = this.defaultTTL) {
        try {
            const item = {
                value: value,
                expiry: Date.now() + ttl,
                timestamp: Date.now()
            };
            localStorage.setItem(this._getKey(key), JSON.stringify(item));
            return true;
        } catch (error) {
            window.Logger?.warn('Cache set failed:', error.message);
            return false;
        }
    }

    /**
     * Get item from cache if not expired
     * @param {string} key - Cache key
     * @returns {any|null} Cached value or null if expired/not found
     */
    get(key) {
        try {
            const itemStr = localStorage.getItem(this._getKey(key));
            if (!itemStr) {
                return null;
            }

            const item = JSON.parse(itemStr);
            
            // Check if expired
            if (Date.now() > item.expiry) {
                this.remove(key);
                window.Logger?.log(`Cache expired: ${key}`);
                return null;
            }

            window.Logger?.log(`✅ Cache hit: ${key}`);
            return item.value;
        } catch (error) {
            window.Logger?.warn('Cache get failed:', error.message);
            this.remove(key);
            return null;
        }
    }

    /**
     * Remove item from cache
     */
    remove(key) {
        try {
            localStorage.removeItem(this._getKey(key));
        } catch (error) {
            window.Logger?.warn('Cache remove failed:', error.message);
        }
    }

    /**
     * Clear all cache items with our prefix
     */
    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            window.Logger?.success('Cache cleared');
        } catch (error) {
            window.Logger?.warn('Cache clear failed:', error.message);
        }
    }

    /**
     * Check if key exists and is valid
     */
    has(key) {
        return this.get(key) !== null;
    }

    /**
     * Get cache statistics
     */
    getStats() {
        try {
            const keys = Object.keys(localStorage);
            const cacheKeys = keys.filter(key => key.startsWith(this.prefix));
            
            const stats = {
                count: cacheKeys.length,
                size: 0,
                items: []
            };

            cacheKeys.forEach(key => {
                const value = localStorage.getItem(key);
                stats.size += value.length;
                
                try {
                    const item = JSON.parse(value);
                    const originalKey = key.replace(this.prefix, '');
                    const age = Date.now() - item.timestamp;
                    const ttl = item.expiry - Date.now();
                    
                    stats.items.push({
                        key: originalKey,
                        age: Math.floor(age / 1000) + 's',
                        ttl: ttl > 0 ? Math.floor(ttl / 1000) + 's' : 'expired'
                    });
                } catch (e) {
                    // Skip invalid items
                }
            });

            return stats;
        } catch (error) {
            window.Logger?.warn('Cache stats failed:', error.message);
            return { count: 0, size: 0, items: [] };
        }
    }
}

// Create global cache instance
window.CacheManager = new CacheManager();
