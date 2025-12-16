// Supabase Configuration for Bumable Clothing Admin
// Add this to your admin/index.html or create a separate config file

// Initialize Supabase (replace with your actual Supabase URL and API key)
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';

// Initialize Supabase client
window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test connection and setup
async function testSupabaseConnection() {
    try {
        console.log('Testing Supabase connection...');
        
        // Test basic connection
        const { data, error } = await window.supabase
            .from('website_deployments')
            .select('count(*)')
            .limit(1);
        
        if (error) {
            console.error('Supabase connection failed:', error);
            showNotification('Database connection failed. Some features may not work properly.', 'warning');
            return false;
        }
        
        console.log('✅ Supabase connection successful');
        return true;
        
    } catch (error) {
        console.error('Supabase setup error:', error);
        showNotification('Database setup error. Please check your configuration.', 'error');
        return false;
    }
}

// Setup real-time subscriptions for deployment updates
function setupRealtimeUpdates() {
    if (!window.supabase) return;
    
    // Subscribe to deployment changes
    const deploymentChannel = window.supabase
        .channel('deployment-updates')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'website_deployments'
            },
            (payload) => {
                console.log('Deployment update received:', payload);
                
                // Refresh deployment history if modal is open
                const modal = document.getElementById('deployment-modal');
                if (modal && modal.classList.contains('show')) {
                    loadDeploymentHistory().then(() => {
                        renderDeploymentHistory();
                    });
                }
                
                // Update deployment status
                updateDeploymentStatus();
                
                // Show notification for new deployments
                if (payload.eventType === 'INSERT' && payload.new.type === 'deployment') {
                    showNotification(
                        `🚀 New deployment: ${payload.new.description}`,
                        'success'
                    );
                }
            }
        )
        .subscribe();
    
    // Subscribe to layout changes
    const layoutChannel = window.supabase
        .channel('layout-updates')
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'website_layout'
            },
            (payload) => {
                console.log('Layout update received:', payload);
                showNotification('Website content updated across all devices', 'info');
            }
        )
        .subscribe();
    
    console.log('✅ Real-time subscriptions setup complete');
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Bumable admin system...');
    
    // Test Supabase connection
    testSupabaseConnection().then(connected => {
        if (connected) {
            setupRealtimeUpdates();
            
            // Initialize deployment system
            setTimeout(() => {
                initializeDeploymentSystem();
            }, 500);
        }
    });
});

// Export for use in other scripts
window.BumableConfig = {
    supabase: window.supabase,
    testConnection: testSupabaseConnection,
    setupRealtime: setupRealtimeUpdates
};