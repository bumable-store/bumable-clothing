// BUMABLE USER-SPECIFIC NOTIFICATION SYSTEM
// Professional notification management for e-commerce platform

class NotificationManager {
    constructor() {
        this.notifications = [];
        this.currentUser = null;
        this.maxNotifications = 50;
        
        this.initializeNotifications();
        this.setupAuthListener();
    }

    // Initialize notification system
    initializeNotifications() {
        this.loadUserNotifications();
        this.updateNotificationUI();
        this.bindEvents();
    }

    // Setup authentication listener
    setupAuthListener() {
        const checkAuth = () => {
            if (window.authSystem) {
                const newUser = window.authSystem.getCurrentUser();
                if (newUser && (!this.currentUser || newUser.email !== this.currentUser.email)) {
                    this.currentUser = newUser;
                    this.loadUserNotifications();
                } else if (!newUser && this.currentUser) {
                    this.currentUser = null;
                    this.notifications = [];
                    this.updateNotificationUI();
                }
            }
        };
        
        // Check initially and periodically
        checkAuth();
        setInterval(checkAuth, 2000);
        
        // Listen for storage changes (login/logout events)
        window.addEventListener('storage', (e) => {
            if (e.key === 'bumableUserSession') {
                checkAuth();
            }
        });
    }

    // Load user-specific notifications
    async loadUserNotifications() {
        if (!this.currentUser || !this.currentUser.email) {
            this.notifications = [];
            this.updateNotificationUI();
            return;
        }

        try {
            // Load notifications from Supabase
            if (window.supabase) {
                const { data, error } = await window.supabase
                    .from('user_notifications')
                    .select('*')
                    .eq('user_email', this.currentUser.email)
                    .order('created_at', { ascending: false })
                    .limit(this.maxNotifications);

                if (error) {
                    window.Logger?.warn('Error loading user notifications:', error);
                } else if (data) {
                    this.notifications = data;
                    this.updateNotificationUI();
                    window.Logger?.success(`Loaded ${data.length} notifications for user`);
                }
            }
        } catch (error) {
            window.Logger?.warn('Error loading user notifications:', error);
        }
    }

    // Add new notification
    async addNotification(type, title, message, data = null) {
        if (!this.currentUser || !this.currentUser.email) {
            console.warn('Cannot add notification: User not logged in');
            return;
        }

        try {
            const notification = {
                user_email: this.currentUser.email,
                type: type, // 'order', 'cart', 'account', 'system', 'promotion'
                title: title,
                message: message,
                data: data ? JSON.stringify(data) : null,
                is_read: false,
                created_at: new Date().toISOString()
            };

            // Save to Supabase
            if (window.supabase) {
                const { data: savedNotification, error } = await window.supabase
                    .from('user_notifications')
                    .insert([notification])
                    .select()
                    .single();

                if (error) {
                    console.warn('Error saving notification:', error);
                } else {
                    // Add to local notifications array
                    this.notifications.unshift(savedNotification);
                    
                    // Keep only max notifications
                    if (this.notifications.length > this.maxNotifications) {
                        this.notifications = this.notifications.slice(0, this.maxNotifications);
                    }
                    
                    this.updateNotificationUI();
                    console.log('✅ Notification added');
                }
            }
        } catch (error) {
            console.warn('Error adding notification:', error);
        }
    }

    // Mark notification as read
    async markAsRead(notificationId) {
        try {
            if (window.supabase) {
                const { error } = await window.supabase
                    .from('user_notifications')
                    .update({ is_read: true, read_at: new Date().toISOString() })
                    .eq('id', notificationId);

                if (error) {
                    console.warn('Error marking notification as read:', error);
                } else {
                    // Update local notification
                    const notification = this.notifications.find(n => n.id === notificationId);
                    if (notification) {
                        notification.is_read = true;
                        notification.read_at = new Date().toISOString();
                        this.updateNotificationUI();
                    }
                }
            }
        } catch (error) {
            console.warn('Error marking notification as read:', error);
        }
    }

    // Mark all notifications as read
    async markAllAsRead() {
        if (!this.currentUser || !this.currentUser.email) return;

        try {
            if (window.supabase) {
                const { error } = await window.supabase
                    .from('user_notifications')
                    .update({ is_read: true, read_at: new Date().toISOString() })
                    .eq('user_email', this.currentUser.email)
                    .eq('is_read', false);

                if (error) {
                    console.warn('Error marking all notifications as read:', error);
                } else {
                    // Update local notifications
                    this.notifications.forEach(notification => {
                        if (!notification.is_read) {
                            notification.is_read = true;
                            notification.read_at = new Date().toISOString();
                        }
                    });
                    this.updateNotificationUI();
                }
            }
        } catch (error) {
            console.warn('Error marking all notifications as read:', error);
        }
    }

    // Delete notification
    async deleteNotification(notificationId) {
        try {
            if (window.supabase) {
                const { error } = await window.supabase
                    .from('user_notifications')
                    .delete()
                    .eq('id', notificationId);

                if (error) {
                    console.warn('Error deleting notification:', error);
                } else {
                    // Remove from local array
                    this.notifications = this.notifications.filter(n => n.id !== notificationId);
                    this.updateNotificationUI();
                }
            }
        } catch (error) {
            console.warn('Error deleting notification:', error);
        }
    }

    // Get unread notification count
    getUnreadCount() {
        return this.notifications.filter(n => !n.is_read).length;
    }

    // Update notification UI
    updateNotificationUI() {
        this.updateNotificationBadge();
        this.updateNotificationDropdown();
    }

    // Update notification badge
    updateNotificationBadge() {
        const badges = document.querySelectorAll('.notification-count');
        const unreadCount = this.getUnreadCount();
        
        badges.forEach(badge => {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'flex' : 'none';
        });
    }

    // Update notification dropdown content
    updateNotificationDropdown() {
        const notificationsList = document.getElementById('notifications-list');
        if (!notificationsList) return;

        if (this.notifications.length === 0) {
            notificationsList.innerHTML = `
                <div class="no-notifications">
                    <i class="fas fa-bell-slash"></i>
                    <p>No notifications yet</p>
                </div>
            `;
            return;
        }

        notificationsList.innerHTML = this.notifications.map(notification => {
            const date = new Date(notification.created_at).toLocaleDateString('en-IN');
            const time = new Date(notification.created_at).toLocaleTimeString('en-IN', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            const typeIcons = {
                order: 'fas fa-shopping-bag',
                cart: 'fas fa-shopping-cart',
                account: 'fas fa-user',
                system: 'fas fa-cog',
                promotion: 'fas fa-tag'
            };
            
            const typeColors = {
                order: '#28a745',
                cart: '#007bff',
                account: '#ffc107',
                system: '#6c757d',
                promotion: '#ff6b6b'
            };

            return `
                <div class="notification-item ${notification.is_read ? 'read' : 'unread'}" 
                     onclick="notificationManager.markAsRead(${notification.id})">
                    <div class="notification-icon" style="color: ${typeColors[notification.type] || '#6c757d'}">
                        <i class="${typeIcons[notification.type] || 'fas fa-bell'}"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-title">${notification.title}</div>
                        <div class="notification-message">${notification.message}</div>
                        <div class="notification-time">${date} at ${time}</div>
                    </div>
                    <div class="notification-actions">
                        <button onclick="event.stopPropagation(); notificationManager.deleteNotification(${notification.id})" 
                                class="delete-notification" title="Delete">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Add "Mark all as read" button if there are unread notifications
        if (this.getUnreadCount() > 0) {
            notificationsList.innerHTML += `
                <div class="notification-actions-bar">
                    <button onclick="notificationManager.markAllAsRead()" class="mark-all-read-btn">
                        <i class="fas fa-check-double"></i> Mark All as Read
                    </button>
                </div>
            `;
        }
    }

    // Bind notification events
    bindEvents() {
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('notifications-dropdown');
            const button = document.getElementById('notifications-btn');
            
            if (dropdown && !dropdown.contains(e.target) && !button.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    }

    // Show notification toast
    showToast(title, message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        
        const typeColors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#007bff'
        };

        toast.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${typeColors[type] || typeColors.info};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10001;
            max-width: 350px;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;

        toast.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 4px;">${title}</div>
            <div style="font-size: 14px; opacity: 0.9;">${message}</div>
        `;

        document.body.appendChild(toast);

        // Slide in animation
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after 4 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    }
}

// Global notification functions
function toggleNotifications() {
    const dropdown = document.getElementById('notifications-dropdown');
    if (dropdown) {
        const isVisible = dropdown.style.display !== 'none';
        dropdown.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible && window.notificationManager) {
            window.notificationManager.loadUserNotifications();
        }
    }
}

function closeNotifications() {
    const dropdown = document.getElementById('notifications-dropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
    }
}

// Initialize notification manager when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔔 Initializing notification system...');
    try {
        window.notificationManager = new NotificationManager();
        console.log('✅ Notification system initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing notification system:', error);
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationManager;
}