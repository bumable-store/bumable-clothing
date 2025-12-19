// BUMABLE Security Utilities
// HTML sanitization and input validation

/**
 * HTML Sanitizer - Prevents XSS attacks
 */
const HTMLSanitizer = {
    /**
     * Escape HTML special characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text safe for HTML
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Sanitize HTML string (removes all tags)
     * @param {string} html - HTML string to sanitize
     * @returns {string} Plain text without HTML tags
     */
    sanitizeHTML(html) {
        if (!html) return '';
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    },

    /**
     * Safe innerHTML setter
     * @param {HTMLElement} element - Element to set innerHTML
     * @param {string} content - Content to set (will be sanitized)
     */
    safeSetInnerHTML(element, content) {
        if (!element) return;
        // For now, escape HTML. Can integrate DOMPurify later
        element.textContent = this.sanitizeHTML(content);
    },

    /**
     * Allow only specific HTML tags (basic whitelist)
     * @param {string} html - HTML to sanitize
     * @param {string[]} allowedTags - Array of allowed tag names
     * @returns {string} Sanitized HTML
     */
    sanitizeWithAllowedTags(html, allowedTags = ['b', 'i', 'em', 'strong', 'span']) {
        if (!html) return '';
        
        const div = document.createElement('div');
        div.innerHTML = html;
        
        // Remove all non-allowed tags
        const allElements = div.getElementsByTagName('*');
        for (let i = allElements.length - 1; i >= 0; i--) {
            const element = allElements[i];
            if (!allowedTags.includes(element.tagName.toLowerCase())) {
                element.outerHTML = element.innerHTML;
            }
        }
        
        return div.innerHTML;
    }
};

/**
 * Input Validator - Comprehensive input validation
 */
const InputValidator = {
    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid
     */
    isValidEmail(email) {
        if (!email) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    },

    /**
     * Validate Indian phone number
     * @param {string} phone - Phone number to validate
     * @returns {boolean} True if valid
     */
    isValidPhone(phone) {
        if (!phone) return false;
        // Indian phone: starts with 6-9, followed by 9 digits
        const phoneRegex = /^[6-9]\d{9}$/;
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        return phoneRegex.test(cleanPhone);
    },

    /**
     * Validate price (must be positive number)
     * @param {number|string} price - Price to validate
     * @param {number} max - Maximum allowed price
     * @returns {boolean} True if valid
     */
    isValidPrice(price, max = 999999) {
        const numPrice = parseFloat(price);
        return !isNaN(numPrice) && numPrice >= 0 && numPrice <= max;
    },

    /**
     * Validate stock count (must be non-negative integer)
     * @param {number|string} stock - Stock count to validate
     * @param {number} max - Maximum allowed stock
     * @returns {boolean} True if valid
     */
    isValidStock(stock, max = 999999) {
        const numStock = parseInt(stock);
        return Number.isInteger(numStock) && numStock >= 0 && numStock <= max;
    },

    /**
     * Validate Indian PIN code (6 digits)
     * @param {string} pincode - PIN code to validate
     * @returns {boolean} True if valid
     */
    isValidPincode(pincode) {
        if (!pincode) return false;
        const pincodeRegex = /^\d{6}$/;
        return pincodeRegex.test(pincode.trim());
    },

    /**
     * Sanitize text input (remove dangerous characters)
     * @param {string} text - Text to sanitize
     * @param {number} maxLength - Maximum length
     * @returns {string} Sanitized text
     */
    sanitizeText(text, maxLength = 1000) {
        if (!text) return '';
        return String(text)
            .trim()
            .replace(/[<>]/g, '') // Remove < and >
            .slice(0, maxLength);
    },

    /**
     * Sanitize email
     * @param {string} email - Email to sanitize
     * @returns {string} Sanitized email
     */
    sanitizeEmail(email) {
        if (!email) return '';
        return String(email)
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9@._\-]/g, '')
            .slice(0, 255);
    },

    /**
     * Sanitize number input
     * @param {number|string} num - Number to sanitize
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Sanitized number
     */
    sanitizeNumber(num, min = 0, max = 999999) {
        const parsed = parseFloat(num);
        if (isNaN(parsed)) return min;
        return Math.max(min, Math.min(max, parsed));
    }
};

/**
 * Rate Limiter - Prevent brute force attacks
 */
class RateLimiter {
    constructor(maxAttempts = 5, windowMs = 60000) {
        this.attempts = new Map();
        this.maxAttempts = maxAttempts;
        this.windowMs = windowMs;
    }

    /**
     * Check if action can proceed
     * @param {string} key - Unique key for the action (e.g., 'login', 'contact-form')
     * @returns {Object} {allowed: boolean, waitTime: number}
     */
    canProceed(key) {
        const now = Date.now();
        const record = this.attempts.get(key) || { count: 0, resetTime: now + this.windowMs };

        // Reset if window expired
        if (now > record.resetTime) {
            record.count = 0;
            record.resetTime = now + this.windowMs;
        }

        // Check if limit exceeded
        if (record.count >= this.maxAttempts) {
            const waitTime = Math.ceil((record.resetTime - now) / 1000);
            return { allowed: false, waitTime };
        }

        // Increment counter
        record.count++;
        this.attempts.set(key, record);
        return { allowed: true, waitTime: 0 };
    }

    /**
     * Reset attempts for a key
     * @param {string} key - Key to reset
     */
    reset(key) {
        this.attempts.delete(key);
    }

    /**
     * Get current attempt count
     * @param {string} key - Key to check
     * @returns {number} Current attempt count
     */
    getAttemptCount(key) {
        const record = this.attempts.get(key);
        if (!record || Date.now() > record.resetTime) {
            return 0;
        }
        return record.count;
    }
}

// Global rate limiters
window.loginRateLimiter = new RateLimiter(5, 60000); // 5 attempts per minute
window.contactFormLimiter = new RateLimiter(3, 300000); // 3 attempts per 5 minutes
window.checkoutLimiter = new RateLimiter(3, 60000); // 3 attempts per minute

// Export utilities
if (typeof window !== 'undefined') {
    window.HTMLSanitizer = HTMLSanitizer;
    window.InputValidator = InputValidator;
    window.RateLimiter = RateLimiter;
}

console.log('✅ Security utilities loaded');
