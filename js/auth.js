// BUMABLE User Authentication System
// Professional e-commerce user management with login tracking

class UserAuthentication {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.sessionKey = 'bumableUserSession';
        this.usersKey = 'bumableUsers';
        this.loginHistoryKey = 'bumableLoginHistory';
        
        this.loadUsers();
        this.loadCurrentSession();
        this.initializeAuth();
    }

    // Initialize authentication system
    initializeAuth() {
        this.createAuthModals();
        this.bindAuthEvents();
        this.updateUIState();
        
        // Auto-logout after 24 hours
        this.setupAutoLogout();
    }

    // Load users from localStorage
    loadUsers() {
        try {
            const storedUsers = localStorage.getItem(this.usersKey);
            this.users = storedUsers ? JSON.parse(storedUsers) : [];
        } catch (error) {
            console.error('Error loading users:', error);
            this.users = [];
        }
    }

    // Save users to localStorage
    saveUsers() {
        try {
            localStorage.setItem(this.usersKey, JSON.stringify(this.users));
        } catch (error) {
            console.error('Error saving users:', error);
        }
    }

    // Load current user session
    loadCurrentSession() {
        try {
            const session = localStorage.getItem(this.sessionKey);
            if (session) {
                const sessionData = JSON.parse(session);
                
                // Check if session is still valid (24 hours)
                const now = new Date().getTime();
                if (sessionData.expiresAt > now) {
                    this.currentUser = sessionData.user;
                    this.recordLoginActivity(this.currentUser.email, 'session_restored');
                } else {
                    // Session expired
                    this.logout();
                }
            }
        } catch (error) {
            console.error('Error loading session:', error);
            this.logout();
        }
    }

    // Save current session
    saveSession() {
        if (this.currentUser) {
            const sessionData = {
                user: this.currentUser,
                loginTime: new Date().getTime(),
                expiresAt: new Date().getTime() + (24 * 60 * 60 * 1000) // 24 hours
            };
            localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
        }
    }

    // Create authentication modals
    createAuthModals() {
        const authModalsHTML = `
            <!-- Login Modal -->
            <div id="login-modal" class="auth-modal">
                <div class="auth-modal-content">
                    <div class="auth-header">
                        <h2>Welcome Back!</h2>
                        <span class="auth-close" onclick="authSystem.closeModal('login')">&times;</span>
                    </div>
                    <form id="login-form" class="auth-form">
                        <div class="form-group">
                            <label for="login-email">Email Address</label>
                            <input type="email" id="login-email" name="email" required placeholder="your@email.com">
                        </div>
                        <div class="form-group">
                            <label for="login-password">Password</label>
                            <div class="password-input">
                                <input type="password" id="login-password" name="password" required placeholder="Enter your password">
                                <button type="button" class="toggle-password" onclick="authSystem.togglePassword('login-password')">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-container">
                                <input type="checkbox" id="remember-me" name="remember">
                                <span class="checkmark"></span>
                                Keep me logged in
                            </label>
                        </div>
                        <button type="submit" class="auth-btn auth-btn-primary">Sign In</button>
                        <div class="auth-divider">
                            <span>Don't have an account?</span>
                            <button type="button" class="auth-link" onclick="authSystem.switchModal('register')">Create Account</button>
                        </div>
                    </form>
                    <div id="login-error" class="auth-error" style="display: none;"></div>
                </div>
            </div>

            <!-- Register Modal -->
            <div id="register-modal" class="auth-modal">
                <div class="auth-modal-content">
                    <div class="auth-header">
                        <h2>Join BUMABLE</h2>
                        <span class="auth-close" onclick="authSystem.closeModal('register')">&times;</span>
                    </div>
                    <form id="register-form" class="auth-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="register-firstname">First Name</label>
                                <input type="text" id="register-firstname" name="firstname" required placeholder="John">
                            </div>
                            <div class="form-group">
                                <label for="register-lastname">Last Name</label>
                                <input type="text" id="register-lastname" name="lastname" required placeholder="Doe">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="register-email">Email Address</label>
                            <input type="email" id="register-email" name="email" required placeholder="your@email.com">
                        </div>
                        <div class="form-group">
                            <label for="register-phone">Phone Number</label>
                            <input type="tel" id="register-phone" name="phone" required placeholder="+91 12345 67890">
                        </div>
                        <div class="form-group">
                            <label for="register-password">Password</label>
                            <div class="password-input">
                                <input type="password" id="register-password" name="password" required placeholder="Create a strong password">
                                <button type="button" class="toggle-password" onclick="authSystem.togglePassword('register-password')">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                            <div class="password-strength">
                                <div class="strength-bar">
                                    <div class="strength-fill" id="password-strength"></div>
                                </div>
                                <span class="strength-text" id="password-strength-text">Password strength</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="register-confirm-password">Confirm Password</label>
                            <div class="password-input">
                                <input type="password" id="register-confirm-password" name="confirmPassword" required placeholder="Confirm your password">
                                <button type="button" class="toggle-password" onclick="authSystem.togglePassword('register-confirm-password')">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-container">
                                <input type="checkbox" id="accept-terms" name="terms" required>
                                <span class="checkmark"></span>
                                I agree to the <a href="policy/" target="_blank">Terms of Service</a> and <a href="policy/" target="_blank">Privacy Policy</a>
                            </label>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-container">
                                <input type="checkbox" id="marketing-emails" name="marketing">
                                <span class="checkmark"></span>
                                Send me promotional emails and updates
                            </label>
                        </div>
                        <button type="submit" class="auth-btn auth-btn-primary">Create Account</button>
                        <div class="auth-divider">
                            <span>Already have an account?</span>
                            <button type="button" class="auth-link" onclick="authSystem.switchModal('login')">Sign In</button>
                        </div>
                    </form>
                    <div id="register-error" class="auth-error" style="display: none;"></div>
                </div>
            </div>

            <!-- Login Required Modal -->
            <div id="login-required-modal" class="auth-modal">
                <div class="auth-modal-content auth-modal-small">
                    <div class="auth-header">
                        <h3>🔐 Login Required</h3>
                        <span class="auth-close" onclick="authSystem.closeModal('login-required')">&times;</span>
                    </div>
                    <div class="login-required-content">
                        <div class="login-required-icon">
                            <i class="fas fa-shopping-cart"></i>
                        </div>
                        <p>You need to be logged in to add items to your cart and make purchases.</p>
                        <p>Join thousands of satisfied customers who trust BUMABLE!</p>
                        <div class="login-required-actions">
                            <button class="auth-btn auth-btn-primary" onclick="authSystem.switchModal('login', 'login-required')">
                                <i class="fas fa-sign-in-alt"></i> Sign In
                            </button>
                            <button class="auth-btn auth-btn-secondary" onclick="authSystem.switchModal('register', 'login-required')">
                                <i class="fas fa-user-plus"></i> Create Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modals to body
        document.body.insertAdjacentHTML('beforeend', authModalsHTML);
        
        // Add auth styles
        this.addAuthStyles();
    }

    // Add authentication styles
    addAuthStyles() {
        const authStyles = `
            <style id="auth-styles">
                /* Authentication Modal Styles */
                .auth-modal {
                    display: none;
                    position: fixed;
                    z-index: 9999;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(5px);
                    animation: fadeIn 0.3s ease;
                }

                .auth-modal-content {
                    background-color: white;
                    margin: 3% auto;
                    padding: 0;
                    border-radius: 15px;
                    width: 90%;
                    max-width: 500px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                    animation: slideUp 0.3s ease;
                }

                .auth-modal-small {
                    max-width: 400px;
                    text-align: center;
                }

                .auth-header {
                    background: linear-gradient(135deg, #ff6b6b, #e74c3c);
                    color: white;
                    padding: 2rem;
                    border-radius: 15px 15px 0 0;
                    position: relative;
                }

                .auth-header h2, .auth-header h3 {
                    margin: 0;
                    font-weight: 600;
                    font-size: 1.5rem;
                }

                .auth-close {
                    position: absolute;
                    top: 1rem;
                    right: 1.5rem;
                    color: white;
                    font-size: 2rem;
                    font-weight: bold;
                    cursor: pointer;
                    opacity: 0.8;
                    transition: opacity 0.2s;
                }

                .auth-close:hover {
                    opacity: 1;
                }

                .auth-form {
                    padding: 2rem;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    color: #333;
                    font-size: 0.95rem;
                }

                .form-group input {
                    width: 100%;
                    padding: 1rem;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                    box-sizing: border-box;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: #ff6b6b;
                    box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
                }

                .password-input {
                    position: relative;
                }

                .toggle-password {
                    position: absolute;
                    right: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: #666;
                    cursor: pointer;
                    font-size: 1.1rem;
                    padding: 0.5rem;
                }

                .toggle-password:hover {
                    color: #ff6b6b;
                }

                .password-strength {
                    margin-top: 0.5rem;
                }

                .strength-bar {
                    width: 100%;
                    height: 4px;
                    background: #e0e0e0;
                    border-radius: 2px;
                    overflow: hidden;
                }

                .strength-fill {
                    height: 100%;
                    width: 0%;
                    transition: all 0.3s ease;
                    border-radius: 2px;
                }

                .strength-text {
                    font-size: 0.85rem;
                    color: #666;
                    margin-top: 0.25rem;
                    display: inline-block;
                }

                .checkbox-container {
                    display: flex;
                    align-items: flex-start;
                    cursor: pointer;
                    font-size: 0.95rem;
                    line-height: 1.4;
                }

                .checkbox-container input[type="checkbox"] {
                    margin-right: 0.75rem;
                    width: auto !important;
                    margin-top: 0.15rem;
                }

                .auth-btn {
                    width: 100%;
                    padding: 1rem;
                    border: none;
                    border-radius: 8px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-align: center;
                    text-decoration: none;
                    display: inline-block;
                    margin-bottom: 1rem;
                }

                .auth-btn-primary {
                    background: linear-gradient(135deg, #ff6b6b, #e74c3c);
                    color: white;
                    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
                }

                .auth-btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
                }

                .auth-btn-secondary {
                    background: white;
                    color: #ff6b6b;
                    border: 2px solid #ff6b6b;
                }

                .auth-btn-secondary:hover {
                    background: #ff6b6b;
                    color: white;
                }

                .auth-divider {
                    text-align: center;
                    margin: 1.5rem 0;
                    color: #666;
                }

                .auth-link {
                    background: none;
                    border: none;
                    color: #ff6b6b;
                    cursor: pointer;
                    font-weight: 600;
                    text-decoration: underline;
                    margin-left: 0.5rem;
                }

                .auth-link:hover {
                    color: #e74c3c;
                }

                .auth-error {
                    background: #ffebee;
                    border: 1px solid #ef5350;
                    color: #c62828;
                    padding: 1rem;
                    border-radius: 8px;
                    margin: 1rem 0;
                    font-size: 0.95rem;
                }

                .login-required-content {
                    padding: 2rem;
                    text-align: center;
                }

                .login-required-icon {
                    font-size: 4rem;
                    color: #ff6b6b;
                    margin-bottom: 1rem;
                }

                .login-required-content p {
                    color: #666;
                    line-height: 1.6;
                    margin-bottom: 1rem;
                }

                .login-required-actions {
                    margin-top: 2rem;
                }

                .login-required-actions .auth-btn {
                    margin: 0.5rem 0;
                }

                /* Animation Keyframes */
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(50px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .auth-modal-content {
                        margin: 1% auto;
                        width: 95%;
                        max-height: 95vh;
                    }

                    .form-row {
                        grid-template-columns: 1fr;
                    }

                    .auth-header {
                        padding: 1.5rem;
                    }

                    .auth-form {
                        padding: 1.5rem;
                    }

                    .login-required-content {
                        padding: 1.5rem;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', authStyles);
    }

    // Bind authentication events
    bindAuthEvents() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Password strength checker
        const passwordInput = document.getElementById('register-password');
        if (passwordInput) {
            passwordInput.addEventListener('input', () => this.checkPasswordStrength());
        }

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('auth-modal')) {
                this.closeAllModals();
            }
        });

        // Close modals with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    // Handle login
    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email').toLowerCase().trim();
        const password = formData.get('password');
        const remember = formData.get('remember');

        // Clear previous errors
        this.hideError('login');

        // Validate input
        if (!email || !password) {
            this.showError('login', 'Please fill in all fields');
            return;
        }

        // Find user
        const user = this.users.find(u => u.email === email);
        if (!user) {
            this.showError('login', 'No account found with this email address');
            return;
        }

        // Check password (in production, use proper password hashing)
        if (user.password !== password) {
            this.showError('login', 'Incorrect password');
            this.recordLoginActivity(email, 'failed_login');
            return;
        }

        // Check if account is active
        if (!user.isActive) {
            this.showError('login', 'Your account has been deactivated. Please contact support.');
            return;
        }

        // Successful login
        this.currentUser = user;
        
        // Update last login
        user.lastLogin = new Date().toISOString();
        user.loginCount = (user.loginCount || 0) + 1;
        this.saveUsers();

        // Save session
        this.saveSession();
        
        // Record login activity
        this.recordLoginActivity(email, 'successful_login');

        // Update UI
        this.updateUIState();
        this.closeAllModals();
        
        // Show success message
        this.showNotification('Welcome back! You are now logged in.', 'success');
    }

    // Handle registration
    async handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const userData = {
            firstname: formData.get('firstname').trim(),
            lastname: formData.get('lastname').trim(),
            email: formData.get('email').toLowerCase().trim(),
            phone: formData.get('phone').trim(),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            terms: formData.get('terms'),
            marketing: formData.get('marketing') || false
        };

        // Clear previous errors
        this.hideError('register');

        // Validate input
        const validation = this.validateRegistration(userData);
        if (!validation.isValid) {
            this.showError('register', validation.message);
            return;
        }

        // Check if email already exists
        if (this.users.find(u => u.email === userData.email)) {
            this.showError('register', 'An account with this email already exists');
            return;
        }

        // Create new user
        const newUser = {
            id: 'user_' + Date.now(),
            firstname: userData.firstname,
            lastname: userData.lastname,
            email: userData.email,
            phone: userData.phone,
            password: userData.password, // In production, hash this
            isActive: true,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            loginCount: 1,
            marketingConsent: userData.marketing,
            purchases: [],
            totalSpent: 0,
            customerType: 'new'
        };

        // Add user to database
        this.users.push(newUser);
        this.saveUsers();

        // Log them in automatically
        this.currentUser = newUser;
        this.saveSession();
        
        // Record registration activity
        this.recordLoginActivity(userData.email, 'registration');

        // Update UI
        this.updateUIState();
        this.closeAllModals();
        
        // Show success message
        this.showNotification('Account created successfully! Welcome to BUMABLE!', 'success');
    }

    // Validate registration data
    validateRegistration(data) {
        if (!data.firstname || data.firstname.length < 2) {
            return { isValid: false, message: 'First name must be at least 2 characters' };
        }
        
        if (!data.lastname || data.lastname.length < 2) {
            return { isValid: false, message: 'Last name must be at least 2 characters' };
        }
        
        if (!data.email || !this.isValidEmail(data.email)) {
            return { isValid: false, message: 'Please enter a valid email address' };
        }
        
        if (!data.phone || data.phone.length < 10) {
            return { isValid: false, message: 'Please enter a valid phone number' };
        }
        
        if (!data.password || data.password.length < 6) {
            return { isValid: false, message: 'Password must be at least 6 characters' };
        }
        
        if (data.password !== data.confirmPassword) {
            return { isValid: false, message: 'Passwords do not match' };
        }
        
        if (!data.terms) {
            return { isValid: false, message: 'You must agree to the Terms of Service' };
        }
        
        return { isValid: true };
    }

    // Check if email is valid
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Check password strength
    checkPasswordStrength() {
        const password = document.getElementById('register-password').value;
        const strengthFill = document.getElementById('password-strength');
        const strengthText = document.getElementById('password-strength-text');
        
        let strength = 0;
        let text = '';
        let color = '';
        
        if (password.length >= 6) strength += 1;
        if (password.match(/[a-z]/)) strength += 1;
        if (password.match(/[A-Z]/)) strength += 1;
        if (password.match(/[0-9]/)) strength += 1;
        if (password.match(/[^a-zA-Z0-9]/)) strength += 1;
        
        switch (strength) {
            case 0:
            case 1:
                text = 'Very Weak';
                color = '#f44336';
                break;
            case 2:
                text = 'Weak';
                color = '#ff9800';
                break;
            case 3:
                text = 'Fair';
                color = '#ffeb3b';
                break;
            case 4:
                text = 'Strong';
                color = '#8bc34a';
                break;
            case 5:
                text = 'Very Strong';
                color = '#4caf50';
                break;
        }
        
        strengthFill.style.width = (strength * 20) + '%';
        strengthFill.style.backgroundColor = color;
        strengthText.textContent = text;
        strengthText.style.color = color;
    }

    // Toggle password visibility
    togglePassword(inputId) {
        const input = document.getElementById(inputId);
        const button = input.nextElementSibling;
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    // Show authentication modal
    showModal(modalType) {
        this.closeAllModals();
        const modal = document.getElementById(modalType + '-modal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    // Close specific modal
    closeModal(modalType) {
        const modal = document.getElementById(modalType + '-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // Close all modals
    closeAllModals() {
        const modals = document.querySelectorAll('.auth-modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
    }

    // Switch between modals
    switchModal(toModal, fromModal = null) {
        if (fromModal) {
            this.closeModal(fromModal);
        }
        this.showModal(toModal);
    }

    // Show error message
    showError(formType, message) {
        const errorElement = document.getElementById(formType + '-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    // Hide error message
    hideError(formType) {
        const errorElement = document.getElementById(formType + '-error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.auth-notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification
        const notification = document.createElement('div');
        notification.className = 'auth-notification';
        
        const bgColors = {
            success: '#4caf50',
            error: '#f44336',
            info: '#2196f3',
            warning: '#ff9800'
        };

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColors[type]};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: 500;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        `;

        notification.textContent = message;
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);

        // Add slide in animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(100px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Update UI state based on login status
    updateUIState() {
        const isLoggedIn = !!this.currentUser;
        
        // Update navigation
        this.updateNavigation(isLoggedIn);
        
        // Update cart functionality
        this.updateCartState(isLoggedIn);
    }

    // Update navigation based on login status
    updateNavigation(isLoggedIn) {
        const navActions = document.querySelector('.nav-actions');
        if (!navActions) return;

        if (isLoggedIn) {
            // Show user menu
            const userMenuHTML = `
                <div class="user-menu">
                    <button class="user-menu-btn" onclick="authSystem.toggleUserMenu()">
                        <i class="fas fa-user"></i>
                        <span>Hi, ${this.currentUser.firstname}</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="user-dropdown" id="user-dropdown" style="display: none;">
                        <div class="user-info">
                            <div class="user-avatar">
                                <i class="fas fa-user-circle"></i>
                            </div>
                            <div class="user-details">
                                <div class="user-name">${this.currentUser.firstname} ${this.currentUser.lastname}</div>
                                <div class="user-email">${this.currentUser.email}</div>
                            </div>
                        </div>
                        <div class="user-menu-divider"></div>
                        <a href="javascript:void(0)" onclick="authSystem.viewProfile()" class="user-menu-item">
                            <i class="fas fa-user"></i> My Profile
                        </a>
                        <a href="javascript:void(0)" onclick="authSystem.viewOrders()" class="user-menu-item">
                            <i class="fas fa-shopping-bag"></i> My Orders
                        </a>
                        <div class="user-menu-divider"></div>
                        <a href="javascript:void(0)" onclick="authSystem.logout()" class="user-menu-item logout">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </a>
                    </div>
                </div>
            `;
            
            // Remove existing login buttons
            const loginBtns = navActions.querySelectorAll('.btn-login');
            loginBtns.forEach(btn => btn.remove());
            
            // Add user menu if not exists
            if (!navActions.querySelector('.user-menu')) {
                navActions.insertAdjacentHTML('afterbegin', userMenuHTML);
                this.addUserMenuStyles();
            }
        } else {
            // Show login button
            const userMenu = navActions.querySelector('.user-menu');
            if (userMenu) {
                userMenu.remove();
            }
            
            if (!navActions.querySelector('.btn-login')) {
                const loginBtnHTML = `
                    <button class="btn btn-login" onclick="authSystem.showModal('login')">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </button>
                `;
                navActions.insertAdjacentHTML('afterbegin', loginBtnHTML);
            }
        }
    }

    // Add user menu styles
    addUserMenuStyles() {
        const userMenuStyles = `
            <style id="user-menu-styles">
                .user-menu {
                    position: relative;
                    margin-right: 1rem;
                }

                .user-menu-btn {
                    background: linear-gradient(135deg, #ff6b6b, #e74c3c);
                    color: white;
                    border: none;
                    padding: 0.75rem 1rem;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 10px rgba(255, 107, 107, 0.3);
                }

                .user-menu-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
                }

                .user-dropdown {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    min-width: 280px;
                    z-index: 1000;
                    margin-top: 0.5rem;
                    overflow: hidden;
                    border: 1px solid #e0e0e0;
                }

                .user-info {
                    padding: 1.5rem;
                    display: flex;
                    align-items: center;
                    background: #f8f9fa;
                }

                .user-avatar {
                    font-size: 3rem;
                    color: #ff6b6b;
                    margin-right: 1rem;
                }

                .user-details {
                    flex: 1;
                }

                .user-name {
                    font-weight: 600;
                    color: #333;
                    font-size: 1.1rem;
                }

                .user-email {
                    color: #666;
                    font-size: 0.9rem;
                    margin-top: 0.25rem;
                }

                .user-menu-divider {
                    height: 1px;
                    background: #e0e0e0;
                    margin: 0;
                }

                .user-menu-item {
                    display: flex;
                    align-items: center;
                    padding: 1rem 1.5rem;
                    color: #333;
                    text-decoration: none;
                    transition: background 0.2s ease;
                    border: none;
                    background: none;
                    width: 100%;
                    text-align: left;
                    cursor: pointer;
                }

                .user-menu-item:hover {
                    background: #f8f9fa;
                    color: #ff6b6b;
                }

                .user-menu-item i {
                    margin-right: 0.75rem;
                    width: 1.2rem;
                    text-align: center;
                }

                .user-menu-item.logout {
                    color: #dc3545;
                }

                .user-menu-item.logout:hover {
                    background: #fff5f5;
                    color: #dc3545;
                }

                @media (max-width: 768px) {
                    .user-dropdown {
                        min-width: 250px;
                        right: -10px;
                    }
                    
                    .user-menu-btn span {
                        display: none;
                    }
                }
            </style>
        `;
        
        if (!document.getElementById('user-menu-styles')) {
            document.head.insertAdjacentHTML('beforeend', userMenuStyles);
        }
    }

    // Toggle user menu dropdown
    toggleUserMenu() {
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) {
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                dropdown.style.display = 'none';
            }
        });
    }

    // View user profile
    viewProfile() {
        this.toggleUserMenu();
        this.showNotification('Profile management coming soon!', 'info');
    }

    // View user orders
    viewOrders() {
        this.toggleUserMenu();
        this.showNotification('Order history coming soon!', 'info');
    }

    // Update cart state based on login status
    updateCartState(isLoggedIn) {
        // This will be used by cart.js to check if user can add items
    }

    // Logout user
    logout() {
        if (this.currentUser) {
            this.recordLoginActivity(this.currentUser.email, 'logout');
        }
        
        this.currentUser = null;
        localStorage.removeItem(this.sessionKey);
        this.updateUIState();
        this.showNotification('You have been logged out successfully.', 'info');
    }

    // Check if user is logged in
    isLoggedIn() {
        return !!this.currentUser;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Record login activity for admin tracking
    recordLoginActivity(email, activity) {
        try {
            const loginHistory = JSON.parse(localStorage.getItem(this.loginHistoryKey) || '[]');
            const activityRecord = {
                email: email,
                activity: activity,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                ip: 'localhost' // In production, get real IP
            };
            
            loginHistory.push(activityRecord);
            
            // Keep only last 100 activities
            if (loginHistory.length > 100) {
                loginHistory.splice(0, loginHistory.length - 100);
            }
            
            localStorage.setItem(this.loginHistoryKey, JSON.stringify(loginHistory));
        } catch (error) {
            console.error('Error recording login activity:', error);
        }
    }

    // Setup auto logout after 24 hours
    setupAutoLogout() {
        setInterval(() => {
            const session = localStorage.getItem(this.sessionKey);
            if (session) {
                const sessionData = JSON.parse(session);
                const now = new Date().getTime();
                if (sessionData.expiresAt <= now) {
                    this.logout();
                    this.showNotification('Your session has expired. Please login again.', 'warning');
                }
            }
        }, 60000); // Check every minute
    }

    // Require login for cart actions
    requireLogin(action = 'add to cart') {
        if (!this.isLoggedIn()) {
            this.showModal('login-required');
            return false;
        }
        return true;
    }
}

// Initialize authentication system
window.authSystem = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.authSystem = new UserAuthentication();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserAuthentication;
}