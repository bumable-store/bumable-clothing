/**
 * Lazy Loading Utility for Bumable Clothing
 * Implements Intersection Observer for efficient image loading
 * Improves initial page load performance
 * 
 * @version 1.0.0
 * @date 2025-12-19
 */

class LazyLoader {
    constructor(options = {}) {
        this.options = {
            rootMargin: options.rootMargin || '50px',
            threshold: options.threshold || 0.01,
            loadingClass: options.loadingClass || 'lazy-loading',
            loadedClass: options.loadedClass || 'lazy-loaded',
            errorClass: options.errorClass || 'lazy-error'
        };

        this.observer = null;
        this.images = new Set();
        this.init();
    }

    /**
     * Initialize Intersection Observer
     */
    init() {
        // Check if browser supports Intersection Observer
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(
                (entries) => this.handleIntersection(entries),
                {
                    rootMargin: this.options.rootMargin,
                    threshold: this.options.threshold
                }
            );
            window.Logger?.success('LazyLoader initialized with Intersection Observer');
        } else {
            // Fallback: load all images immediately
            window.Logger?.warn('Intersection Observer not supported, loading all images');
            this.loadAllImages();
        }
    }

    /**
     * Handle intersection events
     */
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                this.loadImage(img);
                this.observer.unobserve(img);
                this.images.delete(img);
            }
        });
    }

    /**
     * Load a single image
     */
    loadImage(img) {
        const src = img.dataset.src || img.dataset.lazySrc;
        const srcset = img.dataset.srcset;

        if (!src) return;

        img.classList.add(this.options.loadingClass);

        // Check if it's a background image (div with data-src) or regular img tag
        const isBackgroundImage = img.tagName !== 'IMG';

        if (isBackgroundImage) {
            // For background images (divs, etc)
            const tempImg = new Image();
            
            tempImg.onload = () => {
                img.style.backgroundImage = `url(${src})`;
                img.classList.remove(this.options.loadingClass);
                img.classList.add(this.options.loadedClass);
                window.Logger?.log('Background image loaded:', src);
            };

            tempImg.onerror = () => {
                img.classList.remove(this.options.loadingClass);
                img.classList.add(this.options.errorClass);
                window.Logger?.warn('Background image failed to load:', src);
            };

            tempImg.src = src;
        } else {
            // For regular img tags
            const tempImg = new Image();
            
            tempImg.onload = () => {
                img.src = src;
                if (srcset) {
                    img.srcset = srcset;
                }
                
                img.classList.remove(this.options.loadingClass);
                img.classList.add(this.options.loadedClass);
                
                window.Logger?.log('Image loaded:', src);
            };

            tempImg.onerror = () => {
                img.classList.remove(this.options.loadingClass);
                img.classList.add(this.options.errorClass);
                window.Logger?.warn('Image failed to load:', src);
            };

            tempImg.src = src;
        }
    }

    /**
     * Observe an image element
     */
    observe(element) {
        if (!element) return;

        if (this.observer) {
            this.images.add(element);
            this.observer.observe(element);
        } else {
            // Fallback: load immediately
            this.loadImage(element);
        }
    }

    /**
     * Observe multiple images
     */
    observeAll(selector = '[data-src], [data-lazy-src]') {
        const images = document.querySelectorAll(selector);
        images.forEach(img => this.observe(img));
        window.Logger?.log(`Observing ${images.length} lazy images`);
    }

    /**
     * Load all images immediately (fallback)
     */
    loadAllImages() {
        this.images.forEach(img => this.loadImage(img));
    }

    /**
     * Disconnect observer and clear images
     */
    disconnect() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.images.clear();
    }

    /**
     * Update images after DOM changes
     */
    update() {
        this.observeAll();
    }
}

// Create global lazy loader instance
window.LazyLoader = new LazyLoader({
    rootMargin: '100px', // Start loading 100px before image enters viewport
    threshold: 0.01
});

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.LazyLoader.observeAll();
    });
} else {
    // DOM already loaded
    window.LazyLoader.observeAll();
}
