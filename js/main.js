// BUMABLE Main JavaScript - Production Version

// Auto-configure Supabase on first load
function initSupabaseConfig() {
    if (!localStorage.getItem('supabase_url')) {
        localStorage.setItem('supabase_url', 'https://dovwxwqjsqgpsskwnqwc.supabase.co');
        localStorage.setItem('supabase_key', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdnd4d3Fqc3FncHNza3ducXdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MDQ0NzUsImV4cCI6MjA4MTM4MDQ3NX0.-mtkMmsMyKo01Zn0hxlNzuj-_p3JmWVbXz8_fJXtVaY');
        console.log('✅ Supabase configuration initialized automatically');
    }
    
    // Initialize Supabase database
    if (!window.supabaseDB) {
        window.supabaseDB = new SupabaseDB();
        console.log('✅ Supabase database initialized');
    }
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Supabase first
    initSupabaseConfig();
    
    // Initialize basic functions
    initNavigation();
    initContactForm();
    initNotifications(); // Initialize notification system
    
    // Initialize product system with delay to ensure products.js is loaded
    setTimeout(function() {
        initProductSystem();
    }, 500);
    
    // Additional fallback for product loading
    setTimeout(function() {
        if (!window.productManager) {
            initProductSystem();
        }
    }, 2000);
    
    // Initialize admin sync listening
    initAdminSync();
});

// Listen for admin changes and sync with main site (Updated for Supabase)
function initAdminSync() {
    console.log('Initializing admin sync with Supabase real-time updates...');
    
    // Listen for real-time product updates from admin
    setupProductSync();
    
    // Remove old localStorage listener as we're using Supabase now
    console.log('✅ Admin sync initialized with cloud database');
}

// Navigation functionality
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navList = document.querySelector('.nav-list');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navToggle.classList.toggle('active');
            navList.classList.toggle('show');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navToggle.classList.remove('active');
                navList.classList.remove('show');
            }
        });
        
        // Close menu when clicking on nav links (mobile)
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    navToggle.classList.remove('active');
                    navList.classList.remove('show');
                }
            });
        });
    }
}

// Product system initialization with Supabase
async function initProductSystem() {
    
    // Check if we're not in admin
    if (window.location.pathname.includes('admin')) {
        return;
    }
    
    try {
        // Ensure Supabase is initialized
        if (!window.supabaseDB) {
            console.log('Waiting for Supabase database...');
            setTimeout(initProductSystem, 1000);
            return;
        }
        
        console.log('Initializing product system with Supabase...');
        await updateProductDisplay();
        
        // Set up real-time sync for instant updates
        setupProductSync();
        
        console.log('✅ Product system initialized with cloud database');
        
    } catch (error) {
        console.error('Error initializing product system:', error);
        setTimeout(initProductSystem, 2000);
    }
}

// Update product display on website using Supabase
async function updateProductDisplay() {
    try {
        if (!window.supabaseDB) {
            console.log('Supabase not available for product display');
            return;
        }
        
        console.log('Loading products from cloud database...');
        const products = await window.supabaseDB.getAllProducts();
        console.log('Loaded', products.length, 'products from Supabase');
        
        // Update home page if we're on it
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '' || window.location.pathname.endsWith('/')) {
            await updateHomePageProducts(products);
        }
        
        // Update shop page if we're on it
        if (window.location.pathname.includes('shop') && (window.location.pathname.endsWith('/') || window.location.pathname.includes('shop/'))) {
            await updateShopPageProducts(products);
        }
        
    } catch (error) {
        console.error('Error updating product display:', error);
    }
}

// Setup real-time product synchronization
function setupProductSync() {
    console.log('Setting up real-time product synchronization...');
    
    // Listen for admin panel updates
    window.addEventListener('productUpdated', async function(event) {
        console.log('Product updated - refreshing display...');
        await updateProductDisplay();
    });
    
    window.addEventListener('productAdded', async function(event) {
        console.log('Product added - refreshing display...');
        await updateProductDisplay();
    });
    
    window.addEventListener('productDeleted', async function(event) {
        console.log('Product deleted - refreshing display...');
        await updateProductDisplay();
    });
    
    // Periodic refresh to catch any missed updates
    setInterval(async () => {
        try {
            await updateProductDisplay();
        } catch (error) {
            console.error('Error in periodic product refresh:', error);
        }
    }, 30000); // Refresh every 30 seconds
    
    console.log('✅ Real-time product sync established');
}

// Update home page product showcase
function updateHomePageProducts(products) {
    console.log('updateHomePageProducts called with', products.length, 'products');
    
    // Update product carousel if it exists
    const carousel = document.querySelector('.product-carousel');
    if (carousel) {
        console.log('Found product carousel');
        // Clear existing products
        carousel.innerHTML = '';
        
        // Show first 6 products or all if less than 6
        const displayProducts = products.slice(0, 6);
        
        if (displayProducts.length === 0) {
            carousel.innerHTML = '<div class="no-products" style="text-align: center; padding: 2rem; color: #666;">No products available</div>';
        } else {
            displayProducts.forEach(product => {
                const productCard = createHomeProductCard(product);
                carousel.appendChild(productCard);
            });
        }
    } else {
        console.log('No product carousel found');
    }
    
    // Update shop section if it exists
    const shopGrid = document.querySelector('.products-grid');
    if (shopGrid) {
        console.log('Found products-grid, loading', products.length, 'products');
        shopGrid.innerHTML = '';
        
        if (products.length === 0) {
            shopGrid.innerHTML = '<div class="no-products" style="text-align: center; padding: 2rem; color: #666;">No products available</div>';
        } else {
            products.forEach(product => {
                const productCard = createShopProductCard(product);
                shopGrid.appendChild(productCard);
            });
        }
    } else {
        console.log('No products-grid found');
    }
}

// Update shop page products
function updateShopPageProducts(products) {
    // Shop page product update logic would go here
}

// Create product card for home page (Supabase data structure)
function createHomeProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const salePrice = product.sale_price || product.regular_price;
    const discountPercent = product.on_sale ? Math.round((1 - salePrice / product.regular_price) * 100) : 0;
    
    // Get image - prioritize gallery_images first, then image_url
    let imagePath;
    if (product.gallery_images && product.gallery_images.length > 0) {
        imagePath = product.gallery_images[0];
    } else {
        imagePath = product.image_url || 'images/placeholder-product.svg';
    }
    
    // Fix image path for homepage (remove ../ if present)
    imagePath = imagePath.replace('../', '');
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${imagePath}" alt="${product.name}" onerror="this.src='images/placeholder-product.svg'">
            ${product.on_sale ? `<span class="sale-badge">${discountPercent}% OFF</span>` : ''}
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <div class="product-price">
                <span class="current-price">₹${salePrice}</span>
                ${product.on_sale ? `<span class="original-price">₹${product.regular_price}</span>` : ''}
            </div>
            <div class="product-actions">
                <select class="size-select" id="size-${product.id}">
                    ${(product.available_sizes || ['M']).map(size => `<option value="${size}">${size}</option>`).join('')}
                </select>
                <button class="add-to-cart-btn" onclick="addToCartFromHome('${product.id}')">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Add to cart from home page
function addToCartFromHome(productId) {
    const sizeSelect = document.getElementById(`size-${productId}`);
    const size = sizeSelect ? sizeSelect.value : 'M';
    
    if (typeof addToCart === 'function') {
        addToCart(productId, size, 1);
    }
}

// Create product card for shop section on homepage (Supabase data structure)
function createShopProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const salePrice = product.on_sale ? product.sale_price : product.regular_price;
    const discountPercent = product.on_sale ? Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100) : 0;
    
    // Get image - prioritize gallery_images first, then image_url
    let imagePath;
    if (product.gallery_images && product.gallery_images.length > 0) {
        imagePath = product.gallery_images[0];
    } else {
        imagePath = product.image_url || 'images/placeholder-product.svg';
    }
    
    // Fix image path for homepage (remove ../ if present)
    imagePath = imagePath.replace('../', '');
    
    card.innerHTML = `
        <div class="product-image" style="background-image: url('${imagePath}')">
            ${product.on_sale ? `<div class="product-badge">${discountPercent}% OFF</div>` : ''}
        </div>
        <div class="product-content">
            <h3 class="product-name">${product.name}</h3>
            <div class="product-price">
                <span class="sale-price">₹${salePrice}</span>
                ${product.on_sale ? `<span class="original-price">₹${product.regular_price}</span>` : ''}
            </div>
            <div class="product-controls">
                <select class="size-selector" id="shop-size-${product.id}">
                    <option value="">Choose Size</option>
                    ${(product.available_sizes || ['M']).map(size => `<option value="${size}">${size}</option>`).join('')}
                </select>
                <div class="quantity-control">
                    <button class="qty-btn" onclick="changeQuantity('shop-qty-${product.id}', -1)">-</button>
                    <div class="qty-display" id="shop-qty-${product.id}">1</div>
                    <button class="qty-btn" onclick="changeQuantity('shop-qty-${product.id}', 1)">+</button>
                </div>
                <button class="add-to-cart-btn" onclick="addToCartFromShop('${product.id}')" ${!product.in_stock ? 'disabled' : ''}>
                    ${product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Add to cart from shop section
function addToCartFromShop(productId) {
    const sizeSelect = document.getElementById(`shop-size-${productId}`);
    const qtyDisplay = document.getElementById(`shop-qty-${productId}`);
    
    const size = sizeSelect ? sizeSelect.value : '';
    const quantity = qtyDisplay ? parseInt(qtyDisplay.textContent) : 1;
    
    if (!size) {
        alert('Please select a size');
        return;
    }
    
    if (typeof addToCart === 'function') {
        addToCart(productId, size, quantity);
    }
}

// Change quantity in shop section
function changeQuantity(elementId, change) {
    const element = document.getElementById(elementId);
    if (element) {
        const currentQty = parseInt(element.textContent) || 1;
        const newQty = Math.max(1, Math.min(10, currentQty + change));
        element.textContent = newQty;
    }
}

// Notification system for other functions
function toggleNotifications() {
    const notificationsDropdown = document.getElementById('notifications-dropdown');
    if (notificationsDropdown) {
        if (notificationsDropdown.style.display === 'none' || !notificationsDropdown.style.display) {
            loadNotifications();
            notificationsDropdown.style.display = 'block';
        } else {
            notificationsDropdown.style.display = 'none';
        }
    }
}

function closeNotifications() {
    const notificationsDropdown = document.getElementById('notifications-dropdown');
    if (notificationsDropdown) {
        notificationsDropdown.style.display = 'none';
    }
}

// Load notifications (contact replies)
function loadNotifications() {
    console.log('Loading notifications...');
    const notificationsList = document.getElementById('notifications-list');
    const notificationCount = document.getElementById('notification-count');
    
    // Note: Notification system now requires server-side implementation
    // to fetch admin replies from Supabase and notify users
    console.warn('Notification system deprecated - contact queries now stored in Supabase');
    
    notificationsList.innerHTML = `
        <div class="no-notifications">
            <i class="fas fa-bell-slash"></i>
            <p>No new notifications</p>
        </div>
    `;
    notificationCount.style.display = 'none';
}

// View query response in a professional format (deprecated - data in Supabase)
function viewQueryResponse(queryId) {
    console.warn('viewQueryResponse deprecated - contact queries now stored in Supabase');
    alert('This feature requires server-side implementation to fetch admin replies from Supabase.');
}

// Close response modal
function closeResponseModal() {
    const responseModal = document.getElementById('response-modal');
    if (responseModal) {
        responseModal.remove();
    }
}

// Mark notification as read (deprecated - using Supabase)
function markAsRead(queryId) {
    console.log('Mark as read:', queryId);
    // This function is deprecated - contact queries are now managed in Supabase
    // Admin panel should update status directly in the database
    closeResponseModal();
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Initialize notifications on page load (deprecated - now in Supabase)
function initNotifications() {
    console.warn('initNotifications deprecated - contact queries now stored in Supabase');
    const notificationCount = document.getElementById('notification-count');
    if (notificationCount) {
        notificationCount.style.display = 'none';
    }
}

// Smooth scrolling for anchor links
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Close mobile menu when clicking outside
document.addEventListener('click', function(e) {
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    
    if (navMenu && navMenu.classList.contains('active')) {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        }
    }
});

// Handle contact form if it exists
function initContactForm() {
    console.log('Initializing contact form...');
    const contactForm = document.getElementById('contact-form');
    const contactModal = document.getElementById('contact-modal');
    const closeBtn = contactModal ? contactModal.querySelector('.close') : null;
    
    console.log('Contact form found:', !!contactForm);
    console.log('Contact modal found:', !!contactModal);
    
    // Open contact modal when clicking contact links
    document.querySelectorAll('a[href="#contact"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Contact link clicked, opening modal...');
            if (contactModal) {
                contactModal.style.display = 'block';
                console.log('Modal display set to block');
            }
        });
    });
    
    // Close modal functionality
    if (closeBtn && contactModal) {
        closeBtn.addEventListener('click', function() {
            contactModal.style.display = 'none';
        });
        
        window.addEventListener('click', function(e) {
            if (e.target === contactModal) {
                contactModal.style.display = 'none';
            }
        });
    }
    
    if (contactForm) {
        console.log('Setting up contact form submit handler...');
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Contact form submitted!');
            
            const firstName = contactForm.querySelector('[name="firstName"]').value;
            const lastName = contactForm.querySelector('[name="lastName"]').value;
            const email = contactForm.querySelector('[name="email"]').value;
            const message = contactForm.querySelector('[name="message"]').value;
            const messageDiv = document.getElementById('form-message');
            
            console.log('Form data:', { firstName, lastName, email, message });
            
            if (firstName && lastName && email && message) {
                // Create contact data object
                const contactData = {
                    name: `${firstName} ${lastName}`,
                    email: email,
                    subject: 'Contact Form Submission',
                    message: message,
                    timestamp: new Date().toISOString()
                };
                
                console.log('Created contact data:', contactData);
                
                // Show loading message
                messageDiv.style.display = 'block';
                messageDiv.style.backgroundColor = '#fff3cd';
                messageDiv.style.color = '#856404';
                messageDiv.style.border = '1px solid #ffeeba';
                messageDiv.innerHTML = '⏳ Sending your message...';
                
                // Try to save to GitHub database first, fallback to localStorage
                async function saveContact() {
                    try {
                        // Try GitHub database if available
                        if (window.githubDB) {
                            await window.githubDB.saveContact(contactData);
                            console.log('✅ Contact saved to GitHub Issues');
                            
                            // Show success message
                            messageDiv.style.backgroundColor = '#d4edda';
                            messageDiv.style.color = '#155724';
                            messageDiv.style.border = '1px solid #c3e6cb';
                            messageDiv.innerHTML = '✓ Thank you for your message! We will get back to you soon via GitHub Issues.';
                        } else {
                            throw new Error('GitHub database not available');
                        }
                    } catch (error) {
                        console.warn('GitHub database failed, trying Supabase:', error);
                        
                        // Try Supabase cloud database
                        try {
                            if (window.supabaseDB && window.supabaseDB.isReady()) {
                                const contactData = {
                                    firstName: firstName,
                                    lastName: lastName,
                                    email: email,
                                    message: message
                                };
                                
                                const result = await window.supabaseDB.saveContact(contactData);
                                
                                if (result.success) {
                                    console.log('✅ Contact saved to Supabase');
                                    messageDiv.style.backgroundColor = '#d4edda';
                                    messageDiv.style.color = '#155724';
                                    messageDiv.style.border = '1px solid #c3e6cb';
                                    messageDiv.innerHTML = '✓ Thank you for your message! We will get back to you soon.';
                                } else {
                                    throw new Error('Supabase save failed: ' + result.error);
                                }
                            } else {
                                throw new Error('Supabase not configured');
                            }
                        } catch (supabaseError) {
                            console.error('❌ Both GitHub and Supabase failed:', supabaseError);
                            messageDiv.style.backgroundColor = '#f8d7da';
                            messageDiv.style.color = '#721c24';
                            messageDiv.style.border = '1px solid #f5c6cb';
                            messageDiv.innerHTML = '✗ Error: Unable to submit message. Database not configured. Please contact support directly.';
                        }
                    }
                    
                    // Reset form
                    contactForm.reset();
                    
                    // Close modal after 2 seconds
                    setTimeout(() => {
                        if (contactModal) {
                            contactModal.style.display = 'none';
                        }
                        messageDiv.style.display = 'none';
                    }, 3000);
                }
                
                saveContact();
                
            } else {
                messageDiv.style.display = 'block';
                messageDiv.style.backgroundColor = '#f8d7da';
                messageDiv.style.color = '#721c24';
                messageDiv.style.border = '1px solid #f5c6cb';
                
                // Check which fields are missing
                let missingFields = [];
                if (!firstName) missingFields.push('First Name');
                if (!lastName) missingFields.push('Last Name');
                if (!email) missingFields.push('Email');
                if (!message) missingFields.push('Message');
                
                messageDiv.innerHTML = `✗ Please fill in all required fields: ${missingFields.join(', ')}`;
            }
        });
    }
}