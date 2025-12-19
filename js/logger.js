/**
 * Logger Utility for Bumable Clothing
 * Provides environment-aware logging that only outputs in development mode
 * Production builds automatically suppress all logs for better performance and security
 * 
 * @version 1.0.0
 * @date 2025-12-19
 */

class Logger {
    constructor() {
        // Detect environment - dev mode if running on localhost
        this.isDev = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname === '';
        
        // Performance tracking
        this.timers = new Map();
    }

    /**
     * Log informational message (only in dev mode)
     */
    log(...args) {
        if (this.isDev) {
            console.log(...args);
        }
    }

    /**
     * Log success message with ✅ prefix (only in dev mode)
     */
    success(...args) {
        if (this.isDev) {
            console.log('✅', ...args);
        }
    }

    /**
     * Log warning message (only in dev mode)
     */
    warn(...args) {
        if (this.isDev) {
            console.warn('⚠️', ...args);
        }
    }

    /**
     * Log error message (always shown - critical for debugging production issues)
     */
    error(...args) {
        console.error('❌', ...args);
    }

    /**
     * Log info message with ℹ️ prefix (only in dev mode)
     */
    info(...args) {
        if (this.isDev) {
            console.info('ℹ️', ...args);
        }
    }

    /**
     * Start performance timer
     */
    time(label) {
        if (this.isDev) {
            this.timers.set(label, performance.now());
        }
    }

    /**
     * End performance timer and log duration
     */
    timeEnd(label) {
        if (this.isDev) {
            const startTime = this.timers.get(label);
            if (startTime) {
                const duration = (performance.now() - startTime).toFixed(2);
                console.log(`⏱️ ${label}: ${duration}ms`);
                this.timers.delete(label);
            }
        }
    }

    /**
     * Log object/data in table format (only in dev mode)
     */
    table(data) {
        if (this.isDev) {
            console.table(data);
        }
    }

    /**
     * Group related logs (only in dev mode)
     */
    group(label) {
        if (this.isDev) {
            console.group(label);
        }
    }

    /**
     * End log group (only in dev mode)
     */
    groupEnd() {
        if (this.isDev) {
            console.groupEnd();
        }
    }

    /**
     * Check if running in development mode
     */
    isDevMode() {
        return this.isDev;
    }
}

// Create global logger instance
window.Logger = new Logger();
