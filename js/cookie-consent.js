/**
 * Cookie Consent Manager for BUMABLE
 * GDPR compliant cookie consent functionality
 * 
 * @version 1.0.0
 * @date 2025-12-19
 */

class CookieConsent {
    constructor() {
        this.cookieName = 'bumable_cookie_consent';
        this.consentGiven = this.getConsent();
        
        if (!this.consentGiven) {
            this.showBanner();
        }
    }

    /**
     * Get current consent status
     */
    getConsent() {
        const consent = localStorage.getItem(this.cookieName);
        return consent === 'true';
    }

    /**
     * Save consent
     */
    saveConsent(accepted) {
        localStorage.setItem(this.cookieName, accepted.toString());
        this.consentGiven = accepted;
        
        // Set cookie expiry (1 year)
        const date = new Date();
        date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
        document.cookie = `${this.cookieName}=${accepted}; expires=${date.toUTCString()}; path=/; SameSite=Strict`;
        
        window.Logger?.log('Cookie consent:', accepted ? 'accepted' : 'rejected');
    }

    /**
     * Show cookie consent banner
     */
    showBanner() {
        const banner = this.createBanner();
        document.body.appendChild(banner);
        
        // Animate in
        setTimeout(() => banner.classList.add('show'), 100);
    }

    /**
     * Create banner HTML
     */
    createBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.className = 'cookie-consent-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Cookie consent');
        banner.setAttribute('aria-describedby', 'cookie-consent-text');
        
        banner.innerHTML = `
            <div class="cookie-consent-content">
                <div class="cookie-icon">
                    <i class="fas fa-cookie-bite"></i>
                </div>
                <div class="cookie-text" id="cookie-consent-text">
                    <p><strong>We value your privacy</strong></p>
                    <p>We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.</p>
                </div>
                <div class="cookie-actions">
                    <button onclick="window.cookieConsent.acceptAll()" class="btn-accept" aria-label="Accept all cookies">
                        <i class="fas fa-check"></i> Accept All
                    </button>
                    <button onclick="window.cookieConsent.rejectAll()" class="btn-reject" aria-label="Reject all cookies">
                        <i class="fas fa-times"></i> Reject All
                    </button>
                    <a href="/privacy-policy/" class="btn-learn-more">Learn More</a>
                </div>
            </div>
        `;
        
        return banner;
    }

    /**
     * Accept all cookies
     */
    acceptAll() {
        this.saveConsent(true);
        this.hideBanner();
        
        // Enable analytics
        if (window.analyticsManager) {
            window.analyticsManager.init();
        }
        
        window.Logger?.success('Cookies accepted');
    }

    /**
     * Reject all cookies
     */
    rejectAll() {
        this.saveConsent(false);
        this.hideBanner();
        
        window.Logger?.log('Cookies rejected');
    }

    /**
     * Hide banner
     */
    hideBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 300);
        }
    }

    /**
     * Reset consent (for testing)
     */
    reset() {
        localStorage.removeItem(this.cookieName);
        document.cookie = `${this.cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        this.consentGiven = false;
        this.showBanner();
    }
}

// Add CSS for cookie banner
const style = document.createElement('style');
style.textContent = `
.cookie-consent-banner {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1.5rem;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    transform: translateY(100%);
    transition: transform 0.3s ease-in-out;
}

.cookie-consent-banner.show {
    transform: translateY(0);
}

.cookie-consent-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
}

.cookie-icon {
    font-size: 2.5rem;
    opacity: 0.9;
}

.cookie-text {
    flex: 1;
    min-width: 300px;
}

.cookie-text p {
    margin: 0;
    line-height: 1.5;
}

.cookie-text strong {
    font-size: 1.1rem;
    display: block;
    margin-bottom: 0.5rem;
}

.cookie-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
}

.cookie-actions button,
.cookie-actions a {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 50px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
}

.btn-accept {
    background: white;
    color: #667eea;
}

.btn-accept:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
}

.btn-reject {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid white;
}

.btn-reject:hover {
    background: rgba(255, 255, 255, 0.3);
}

.btn-learn-more {
    color: white;
    text-decoration: underline;
    background: transparent;
    padding: 0.5rem 1rem;
}

.btn-learn-more:hover {
    opacity: 0.8;
}

@media (max-width: 768px) {
    .cookie-consent-content {
        flex-direction: column;
        text-align: center;
    }
    
    .cookie-actions {
        width: 100%;
        justify-content: center;
    }
    
    .cookie-actions button {
        flex: 1;
    }
}
`;
document.head.appendChild(style);

// Initialize cookie consent
window.cookieConsent = new CookieConsent();
