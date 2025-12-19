// BUMABLE Enhanced Error Handling & User Feedback System
// Professional error management with user-friendly notifications

class ErrorHandler {
    constructor() {
        this.isOnline = navigator.onLine;
        this.errorQueue = [];
        this.maxQueueSize = 10;
        this.init();
    }

    init() {
        this.setupOnlineDetection();
        this.setupGlobalErrorHandler();
        this.createNotificationContainer();
        window.Logger?.success('Enhanced error handling initialized');
    }

    // Setup online/offline detection
    setupOnlineDetection() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showNotification(
                'Connection Restored',
                'You are back online. All features are now available.',
                'success',
                3000
            );
            window.Logger?.success('Connection restored');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showNotification(
                'No Internet Connection',
                'You are currently offline. Some features may not be available.',
                'warning',
                5000
            );
            window.Logger?.warn('Connection lost');
        });

        // Initial check
        if (!this.isOnline) {
            setTimeout(() => {
                this.showNotification(
                    'Offline Mode',
                    'You appear to be offline. Please check your internet connection.',
                    'warning',
                    5000
                );
            }, 1000);
        }
    }

    // Setup global error handler
    setupGlobalErrorHandler() {
        window.addEventListener('error', (event) => {
            this.logError('JavaScript Error', event.error);
            
            // Don't show UI errors for script loading failures in production
            if (event.filename && event.filename.includes('.js')) {
                window.Logger?.error('Script loading error:', event.filename);
            }
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', event.reason);
            event.preventDefault();
        });
    }

    // Create notification container
    createNotificationContainer() {
        if (document.getElementById('error-notification-container')) return;

        const container = document.createElement('div');
        container.id = 'error-notification-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'true');
        
        const style = document.createElement('style');
        style.textContent = `
            #error-notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
            }

            .error-notification {
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                margin-bottom: 10px;
                padding: 16px;
                display: flex;
                align-items: flex-start;
                animation: slideIn 0.3s ease-out;
                position: relative;
                overflow: hidden;
            }

            .error-notification::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 4px;
            }

            .error-notification.success::before { background: #28a745; }
            .error-notification.error::before { background: #dc3545; }
            .error-notification.warning::before { background: #ffc107; }
            .error-notification.info::before { background: #17a2b8; }

            .error-notification-icon {
                font-size: 24px;
                margin-right: 12px;
                flex-shrink: 0;
            }

            .error-notification.success .error-notification-icon { color: #28a745; }
            .error-notification.error .error-notification-icon { color: #dc3545; }
            .error-notification.warning .error-notification-icon { color: #ffc107; }
            .error-notification.info .error-notification-icon { color: #17a2b8; }

            .error-notification-content {
                flex: 1;
            }

            .error-notification-title {
                font-weight: 600;
                margin-bottom: 4px;
                color: #333;
            }

            .error-notification-message {
                font-size: 14px;
                color: #666;
                line-height: 1.4;
            }

            .error-notification-close {
                background: none;
                border: none;
                font-size: 20px;
                color: #999;
                cursor: pointer;
                padding: 0;
                margin-left: 12px;
                flex-shrink: 0;
                line-height: 1;
            }

            .error-notification-close:hover {
                color: #333;
            }

            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }

            .error-notification.removing {
                animation: slideOut 0.3s ease-out;
            }

            @media (max-width: 480px) {
                #error-notification-container {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
            }

            /* Loading overlay */
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            }

            .loading-content {
                background: white;
                padding: 30px 40px;
                border-radius: 10px;
                text-align: center;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            }

            .loading-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #667eea;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .loading-text {
                color: #333;
                font-size: 16px;
                font-weight: 500;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(container);
    }

    // Show user-friendly notification (replaces alert())
    showNotification(title, message, type = 'info', duration = 5000) {
        const container = document.getElementById('error-notification-container');
        if (!container) {
            // Fallback to alert if container not ready
            alert(`${title}: ${message}`);
            return;
        }

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        const notification = document.createElement('div');
        notification.className = `error-notification ${type}`;
        notification.setAttribute('role', 'alert');
        notification.innerHTML = `
            <div class="error-notification-icon">${icons[type] || icons.info}</div>
            <div class="error-notification-content">
                <div class="error-notification-title">${title}</div>
                <div class="error-notification-message">${message}</div>
            </div>
            <button class="error-notification-close" aria-label="Close notification">&times;</button>
        `;

        // Close button
        notification.querySelector('.error-notification-close').addEventListener('click', () => {
            this.removeNotification(notification);
        });

        container.appendChild(notification);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
        }

        // Announce to screen readers
        if (window.a11y) {
            window.a11y.announce(`${title}: ${message}`, type === 'error' ? 'assertive' : 'polite');
        }

        return notification;
    }

    // Remove notification with animation
    removeNotification(notification) {
        notification.classList.add('removing');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }

    // Show loading overlay
    showLoading(message = 'Loading...') {
        // Remove existing loading overlay
        this.hideLoading();

        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.id = 'global-loading-overlay';
        overlay.setAttribute('role', 'alert');
        overlay.setAttribute('aria-busy', 'true');
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">${message}</div>
            </div>
        `;

        document.body.appendChild(overlay);
        window.Logger?.log(`Loading: ${message}`);
    }

    // Hide loading overlay
    hideLoading() {
        const overlay = document.getElementById('global-loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    // Log error to queue and console
    logError(title, error) {
        const errorInfo = {
            title,
            message: error?.message || String(error),
            stack: error?.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.errorQueue.push(errorInfo);
        
        // Keep queue size manageable
        if (this.errorQueue.length > this.maxQueueSize) {
            this.errorQueue.shift();
        }

        window.Logger?.error(title, error);
    }

    // Handle API errors with user-friendly messages
    handleAPIError(error, context = 'API request') {
        let title = 'Request Failed';
        let message = 'Something went wrong. Please try again.';

        if (!this.isOnline) {
            title = 'No Internet Connection';
            message = 'Please check your internet connection and try again.';
        } else if (error?.status === 401 || error?.status === 403) {
            title = 'Authentication Required';
            message = 'Please log in to continue.';
        } else if (error?.status === 404) {
            title = 'Not Found';
            message = 'The requested resource was not found.';
        } else if (error?.status === 429) {
            title = 'Too Many Requests';
            message = 'Please wait a moment before trying again.';
        } else if (error?.status >= 500) {
            title = 'Server Error';
            message = 'Our servers are experiencing issues. Please try again later.';
        } else if (error?.message) {
            message = error.message;
        }

        this.showNotification(title, message, 'error', 6000);
        this.logError(`${context}: ${title}`, error);
    }

    // Handle form validation errors
    handleValidationError(fieldName, message) {
        const inputElement = document.getElementById(fieldName) || 
                           document.querySelector(`[name="${fieldName}"]`);

        if (inputElement && window.a11y) {
            window.a11y.showFieldError(inputElement, message);
        } else {
            this.showNotification(
                'Validation Error',
                `${fieldName}: ${message}`,
                'warning',
                4000
            );
        }
    }

    // Get error queue for debugging
    getErrorQueue() {
        return this.errorQueue;
    }

    // Check if online
    checkConnection() {
        return this.isOnline;
    }

    // User-friendly wrapper for async operations
    async withErrorHandling(operation, loadingMessage = 'Processing...') {
        try {
            if (!this.isOnline) {
                throw new Error('No internet connection');
            }

            this.showLoading(loadingMessage);
            const result = await operation();
            this.hideLoading();
            return result;
        } catch (error) {
            this.hideLoading();
            this.handleAPIError(error, loadingMessage);
            throw error;
        }
    }
}

// Initialize error handler globally
window.ErrorHandler = ErrorHandler;
window.errorHandler = new ErrorHandler();

// Replace global alert with user-friendly notification
window.alertOriginal = window.alert;
window.alert = function(message) {
    if (window.errorHandler) {
        window.errorHandler.showNotification('Alert', message, 'info', 5000);
    } else {
        window.alertOriginal(message);
    }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
}
