// BUMABLE User Authentication System (SUPABASE ONLY)
// Professional e-commerce user management with cloud database

class UserAuthentication {
    constructor() {
        this.currentUser = null;
        this.sessionKey = 'bumableUserSession';
        
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

    // Check if Supabase is ready
    isSupabaseReady() {
        return window.supabaseDB && window.supabaseDB.isReady && window.supabaseDB.isReady();
    }

    // Load current user session (sessionStorage only - no localStorage)
    loadCurrentSession() {
        try {
            if (!this.isSupabaseReady()) {
                console.log('⚠️ Supabase not ready, skipping session load');
                return;
            }

            const sessionResult = window.supabaseDB.getCurrentSession();
            if (sessionResult.success) {
                this.currentUser = sessionResult.session.user;
                console.log('✅ Session restored from Supabase');
            }
        } catch (error) {
            console.error('Error loading session:', error);
            this.logout();
        }
    }

    // Save current session (Supabase only)
    saveSession() {
        if (this.currentUser && this.isSupabaseReady()) {
            window.supabaseDB.createSession(this.currentUser);
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
                            <div class="password-input-wrapper">
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
                            <div class="password-input-wrapper">
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
                            <div class="password-input-wrapper">
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
                    gap: 0.75rem;
                }

                .form-group {
                    margin-bottom: 0.75rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.4rem;
                    font-weight: 600;
                    color: #333;
                    font-size: 0.9rem;
                }

                .form-group input {
                    width: 100%;
                    padding: 0.6rem;
                    border: 2px solid #e0e0e0;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                    box-sizing: border-box;
                    height: 40px;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: #ff6b6b;
                    box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
                }

                .password-input-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .password-input-wrapper input {
                    flex: 1;
                    min-width: 0;
                }

                .toggle-password {
                    background: none;
                    border: 2px solid #e0e0e0;
                    color: #666;
                    cursor: pointer;
                    font-size: 0.9rem;
                    padding: 0.5rem;
                    border-radius: 6px;
                    transition: all 0.3s ease;
                    flex-shrink: 0;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .toggle-password:hover {
                    color: #ff6b6b;
                    border-color: #ff6b6b;
                    background: rgba(255, 107, 107, 0.05);
                }

                .toggle-password:focus {
                    outline: none;
                    border-color: #ff6b6b;
                    box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
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
                    font-size: 0.9rem;
                    line-height: 1.4;
                    margin-bottom: 0.75rem;
                }

                .checkbox-container input[type="checkbox"] {
                    margin-right: 0.5rem;
                    width: 16px !important;
                    height: 16px !important;
                    margin-top: 0.1rem;
                    flex-shrink: 0;
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

    // Handle login (Enhanced with device tracking)
    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email').toLowerCase().trim();
        const password = formData.get('password');

        // Clear previous errors
        this.hideError('login');

        // Validate input
        if (!email || !password) {
            this.showError('login', 'Please fill in all fields');
            return;
        }

        if (!this.isSupabaseReady()) {
            this.showError('login', 'Database not connected. Please try again later.');
            return;
        }

        try {
            // Get user from Supabase
            const userResult = await window.supabaseDB.getUserByEmail(email);
            
            if (!userResult.success || !userResult.user) {
                this.showError('login', 'No account found with this email address');
                return;
            }

            const user = userResult.user;

            // Check password (Note: In production, passwords should be hashed)
            if (!user.password || user.password !== password) {
                this.showError('login', 'Incorrect password');
                // Log failed login with device info
                await this.logLoginActivity(email, 'failed_login', 'Incorrect password');
                return;
            }

            // Check if account is active
            if (user.status !== 'active') {
                this.showError('login', 'Your account has been deactivated. Please contact support.');
                return;
            }

            // Get device and session information
            const deviceInfo = this.getDeviceInfo();
            const loginTime = new Date().toISOString();

            // Update login in Supabase with detailed tracking
            const loginResult = await window.supabaseDB.updateUserLogin(email, {
                device_info: deviceInfo,
                login_time: loginTime,
                ip_address: await this.getIPAddress(),
                user_agent: navigator.userAgent
            });
            
            if (loginResult.success) {
                this.currentUser = loginResult.user;
            } else {
                this.currentUser = user;
            }

            // Log successful login activity with full details
            await this.logLoginActivity(email, 'successful_login', 'User logged in successfully', deviceInfo);

            // Save session
            this.saveSession();

            // Update UI
            this.updateUIState();
            this.closeAllModals();
            
            // Show success message
            this.showNotification(`Welcome back, ${user.first_name}! You are now logged in.`, 'success');
            
            // Add welcome back notification to user's notification panel
            if (window.notificationManager) {
                setTimeout(async () => {
                    await window.notificationManager.addNotification(
                        'account',
                        'Welcome Back!',
                        `You have successfully logged in from ${deviceInfo.deviceType} using ${deviceInfo.browser}`,
                        { 
                            loginTime: loginTime,
                            deviceInfo: deviceInfo,
                            ipAddress: await this.getIPAddress()
                        }
                    );
                }, 1000);
            }
            
        } catch (error) {
            console.error('Login error:', error);
            this.showError('login', 'Login failed. Please try again.');
        }
    }

    // Handle registration (Enhanced with device tracking)
    async handleRegister(e) {
        e.preventDefault();
        
        // Check if Supabase is ready
        if (!window.supabaseDB || !window.supabaseDB.isReady()) {
            this.showError('register', 'Database not available. Please try again later.');
            return;
        }
        
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

        try {
            // Check if email already exists using Supabase
            const existingUser = await window.supabaseDB.getUserByEmail(userData.email);
            if (existingUser.success && existingUser.user) {
                this.showError('register', 'An account with this email already exists');
                return;
            }

            // Get device and registration information
            const deviceInfo = this.getDeviceInfo();
            const registrationTime = new Date().toISOString();

            // Enhanced user data with device tracking
            const enhancedUserData = {
                ...userData,
                device_info: deviceInfo,
                registration_time: registrationTime,
                registration_ip: await this.getIPAddress(),
                user_agent: navigator.userAgent
            };

            // Register user in Supabase cloud database
            const result = await window.supabaseDB.registerUser(enhancedUserData);
            if (!result.success) {
                this.showError('register', result.error || 'Registration failed. Please try again.');
                return;
            }

            // Set current user with the registered user data
            this.currentUser = result.user;
            
            // Log registration activity with device info
            await this.logLoginActivity(userData.email, 'account_created', 'New account registered', deviceInfo);

            // Save session
            this.saveSession();

            // Update UI
            this.updateUIState();
            this.closeAllModals();
            
            // Show success message
            this.showNotification(`Account created successfully! Welcome to BUMABLE, ${userData.firstname}!`, 'success');
            
            // Add welcome notification for new user
            if (window.notificationManager) {
                setTimeout(async () => {
                    await window.notificationManager.addNotification(
                        'account',
                        'Welcome to BUMABLE!',
                        `Your account has been created successfully. Start exploring our premium underwear collection!`,
                        { 
                            registrationDate: new Date().toISOString(),
                            userEmail: userData.email
                        }
                    );
                }, 1000);
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            this.showError('register', 'Registration failed. Please try again.');
        }
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

    // Logout user (Enhanced with device tracking)
    async logout() {
        if (this.currentUser) {
            // Record logout activity with device info
            await this.logLoginActivity(this.currentUser.email, 'logout', 'User logged out');
        }
        
        this.currentUser = null;
        sessionStorage.removeItem(this.sessionKey);
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

    // Get detailed device information for admin tracking
    getDeviceInfo() {
        const userAgent = navigator.userAgent;
        const platform = navigator.platform;
        const language = navigator.language;
        const screenResolution = `${screen.width}x${screen.height}`;
        const viewport = `${window.innerWidth}x${window.innerHeight}`;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Detect device type
        let deviceType = 'Desktop';
        if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
            deviceType = 'Mobile';
        } else if (/iPad|Android.*Tablet/i.test(userAgent)) {
            deviceType = 'Tablet';
        }
        
        // Detect browser
        let browser = 'Unknown';
        if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Safari')) browser = 'Safari';
        else if (userAgent.includes('Edge')) browser = 'Edge';
        else if (userAgent.includes('Opera')) browser = 'Opera';
        
        // Detect operating system
        let os = 'Unknown';
        if (userAgent.includes('Windows NT')) os = 'Windows';
        else if (userAgent.includes('Mac OS X')) os = 'macOS';
        else if (userAgent.includes('Linux')) os = 'Linux';
        else if (userAgent.includes('Android')) os = 'Android';
        else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
        
        return {
            device_type: deviceType,
            browser: browser,
            operating_system: os,
            platform: platform,
            screen_resolution: screenResolution,
            viewport_size: viewport,
            language: language,
            timezone: timezone,
            user_agent: userAgent,
            online_status: navigator.onLine,
            connection_type: navigator.connection ? navigator.connection.effectiveType : 'Unknown',
            timestamp: new Date().toISOString()
        };
    }

    // Get user's IP address (for location tracking)
    async getIPAddress() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip || 'Unknown';
        } catch (error) {
            console.error('Error getting IP address:', error);
            return 'Unknown';
        }
    }

    // Enhanced login activity logging for admin tracking
    async logLoginActivity(email, activityType, description, deviceInfo = null) {
        try {
            if (!window.supabaseDB || !window.supabaseDB.isReady()) {
                return;
            }

            // If device info not provided, get it
            if (!deviceInfo) {
                deviceInfo = this.getDeviceInfo();
            }

            const activityData = {
                email: email,
                activity_type: activityType,
                description: description,
                device_info: deviceInfo,
                ip_address: await this.getIPAddress(),
                timestamp: new Date().toISOString(),
                session_id: this.generateSessionId()
            };

            // Log activity in Supabase for admin tracking
            await window.supabaseDB.logUserActivity(activityData);
            
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    }

    // Generate unique session ID for tracking
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Record login activity for admin tracking (now handled by Supabase)
    recordLoginActivity(email, activity) {
        // This method is deprecated - activities are now recorded directly in Supabase
        // through the database methods: updateUserLogin, recordActivity, etc.
        if (window.supabaseDB && window.supabaseDB.isReady()) {
            window.supabaseDB.recordActivity(email, activity)
                .catch(error => console.error('Failed to record activity:', error));
        }
    }

    // Setup auto logout after 24 hours
    setupAutoLogout() {
        setInterval(() => {
            const session = sessionStorage.getItem(this.sessionKey);  // Use sessionStorage instead
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

// Initialize authentication system
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Initializing authentication system...');
    try {
        window.authSystem = new UserAuthentication();
        console.log('✅ Authentication system initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing authentication system:', error);
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserAuthentication;
}