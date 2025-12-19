// BUMABLE Accessibility Manager
// Comprehensive accessibility features for professional e-commerce

class AccessibilityManager {
    constructor() {
        this.focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        this.modalStack = [];
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupSkipLinks();
        this.enhanceButtons();
        window.Logger?.success('Accessibility features initialized');
    }

    // Setup keyboard navigation for modals and interactive elements
    setupKeyboardNavigation() {
        // ESC key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalStack.length > 0) {
                const topModal = this.modalStack[this.modalStack.length - 1];
                this.closeModal(topModal);
            }
        });

        // Enter/Space on size options
        document.addEventListener('keydown', (e) => {
            if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('size-option')) {
                e.preventDefault();
                e.target.click();
            }
        });

        // Tab trap in modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && this.modalStack.length > 0) {
                this.trapFocusInModal(e);
            }
        });

        window.Logger?.log('✓ Keyboard navigation enabled');
    }

    // Trap focus within modal
    trapFocusInModal(event) {
        const modal = this.modalStack[this.modalStack.length - 1];
        if (!modal) return;

        const focusable = Array.from(modal.querySelectorAll(this.focusableElements))
            .filter(el => !el.disabled && el.offsetParent !== null);

        if (focusable.length === 0) return;

        const firstFocusable = focusable[0];
        const lastFocusable = focusable[focusable.length - 1];

        if (event.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstFocusable) {
                event.preventDefault();
                lastFocusable.focus();
            }
        } else {
            // Tab
            if (document.activeElement === lastFocusable) {
                event.preventDefault();
                firstFocusable.focus();
            }
        }
    }

    // Setup focus management
    setupFocusManagement() {
        // Add visible focus indicators
        const style = document.createElement('style');
        style.textContent = `
            /* Enhanced focus indicators for accessibility */
            *:focus-visible {
                outline: 3px solid #667eea !important;
                outline-offset: 2px !important;
            }

            button:focus-visible,
            a:focus-visible,
            input:focus-visible,
            select:focus-visible,
            textarea:focus-visible {
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3) !important;
            }

            .size-option:focus-visible {
                transform: scale(1.05);
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.5) !important;
            }

            /* Skip to content link */
            .skip-to-content {
                position: absolute;
                top: -40px;
                left: 0;
                background: #667eea;
                color: white;
                padding: 8px 16px;
                text-decoration: none;
                border-radius: 0 0 4px 0;
                z-index: 100000;
                transition: top 0.3s;
            }

            .skip-to-content:focus {
                top: 0;
            }
        `;
        document.head.appendChild(style);

        window.Logger?.log('✓ Focus management enabled');
    }

    // Setup skip links for keyboard users
    setupSkipLinks() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-to-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.setAttribute('aria-label', 'Skip to main content');
        
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const mainContent = document.querySelector('#main-content, main, .hero-section, .products-section');
            if (mainContent) {
                mainContent.setAttribute('tabindex', '-1');
                mainContent.focus();
                mainContent.scrollIntoView({ behavior: 'smooth' });
            }
        });

        document.body.insertBefore(skipLink, document.body.firstChild);
        window.Logger?.log('✓ Skip links added');
    }

    // Enhance buttons with proper ARIA attributes
    enhanceButtons() {
        // Add ARIA labels to buttons without text
        document.querySelectorAll('button').forEach(button => {
            if (!button.hasAttribute('aria-label') && !button.textContent.trim()) {
                const title = button.getAttribute('title');
                if (title) {
                    button.setAttribute('aria-label', title);
                }
            }
        });

        // Add ARIA pressed state to toggle buttons
        document.querySelectorAll('[data-toggle]').forEach(button => {
            button.setAttribute('aria-pressed', 'false');
        });

        window.Logger?.log('✓ Buttons enhanced with ARIA labels');
    }

    // Open modal with accessibility support
    openModal(modalElement, focusElement = null) {
        if (!modalElement) return;

        // Store currently focused element
        this.previousFocus = document.activeElement;

        // Add to modal stack
        this.modalStack.push(modalElement);

        // Set ARIA attributes
        modalElement.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // Focus first focusable element or specified element
        setTimeout(() => {
            if (focusElement) {
                focusElement.focus();
            } else {
                const firstFocusable = modalElement.querySelector(this.focusableElements);
                if (firstFocusable) firstFocusable.focus();
            }
        }, 100);

        window.Logger?.log('✓ Modal opened with accessibility support');
    }

    // Close modal with accessibility support
    closeModal(modalElement) {
        if (!modalElement) return;

        // Remove from modal stack
        const index = this.modalStack.indexOf(modalElement);
        if (index > -1) {
            this.modalStack.splice(index, 1);
        }

        // Set ARIA attributes
        modalElement.setAttribute('aria-hidden', 'true');
        
        // Restore body overflow if no modals left
        if (this.modalStack.length === 0) {
            document.body.style.overflow = '';
        }

        // Restore focus to previous element
        if (this.previousFocus) {
            this.previousFocus.focus();
            this.previousFocus = null;
        }

        window.Logger?.log('✓ Modal closed, focus restored');
    }

    // Announce to screen readers
    announce(message, priority = 'polite') {
        let announcer = document.getElementById('aria-announcer');
        
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'aria-announcer';
            announcer.setAttribute('role', 'status');
            announcer.setAttribute('aria-live', priority);
            announcer.setAttribute('aria-atomic', 'true');
            announcer.style.position = 'absolute';
            announcer.style.left = '-10000px';
            announcer.style.width = '1px';
            announcer.style.height = '1px';
            announcer.style.overflow = 'hidden';
            document.body.appendChild(announcer);
        }

        // Update aria-live priority if needed
        announcer.setAttribute('aria-live', priority);

        // Clear and set message
        announcer.textContent = '';
        setTimeout(() => {
            announcer.textContent = message;
        }, 100);

        window.Logger?.log(`📢 Screen reader announcement: "${message}"`);
    }

    // Add loading state with ARIA
    setLoading(element, isLoading, loadingText = 'Loading...') {
        if (!element) return;

        if (isLoading) {
            element.setAttribute('aria-busy', 'true');
            element.setAttribute('aria-label', loadingText);
            element.disabled = true;
        } else {
            element.removeAttribute('aria-busy');
            element.removeAttribute('aria-label');
            element.disabled = false;
        }
    }

    // Validate form accessibility
    validateFormAccessibility(formElement) {
        if (!formElement) return false;

        let isValid = true;
        const inputs = formElement.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            // Check for labels
            const id = input.getAttribute('id');
            if (id) {
                const label = formElement.querySelector(`label[for="${id}"]`);
                if (!label && !input.hasAttribute('aria-label')) {
                    window.Logger?.warn(`Input ${id} missing label`);
                    isValid = false;
                }
            }

            // Check for required fields
            if (input.hasAttribute('required') && !input.hasAttribute('aria-required')) {
                input.setAttribute('aria-required', 'true');
            }

            // Check for invalid fields
            if (input.hasAttribute('aria-invalid')) {
                const errorId = input.getAttribute('aria-describedby');
                if (!errorId || !document.getElementById(errorId)) {
                    window.Logger?.warn(`Input ${id} has aria-invalid but no error message`);
                }
            }
        });

        return isValid;
    }

    // Add error message with ARIA
    showFieldError(inputElement, errorMessage) {
        if (!inputElement) return;

        const errorId = `${inputElement.id}-error`;
        let errorElement = document.getElementById(errorId);

        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.id = errorId;
            errorElement.className = 'field-error';
            errorElement.setAttribute('role', 'alert');
            errorElement.style.color = '#dc3545';
            errorElement.style.fontSize = '0.875rem';
            errorElement.style.marginTop = '0.25rem';
            errorElement.style.display = 'block';
            inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
        }

        errorElement.textContent = errorMessage;
        inputElement.setAttribute('aria-invalid', 'true');
        inputElement.setAttribute('aria-describedby', errorId);
        this.announce(`Error: ${errorMessage}`, 'assertive');
    }

    // Clear field error
    clearFieldError(inputElement) {
        if (!inputElement) return;

        const errorId = `${inputElement.id}-error`;
        const errorElement = document.getElementById(errorId);

        if (errorElement) {
            errorElement.remove();
        }

        inputElement.removeAttribute('aria-invalid');
        inputElement.removeAttribute('aria-describedby');
    }
}

// Initialize accessibility manager globally
window.AccessibilityManager = AccessibilityManager;
window.a11y = new AccessibilityManager();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityManager;
}
