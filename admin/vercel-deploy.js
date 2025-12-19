/**
 * Deployment Helper for Bumable Clothing Admin
 * 
 * This file provides functions to trigger automatic deployment to Vercel
 * when admin makes changes to website layout or products.
 * 
 * Setup Instructions:
 * 1. Get Vercel Deploy Hook URL from Vercel Dashboard:
 *    - Go to https://vercel.com/dashboard
 *    - Select your project (bumable-clothing)
 *    - Go to Settings > Git > Deploy Hooks
 *    - Create a new deploy hook named "Admin Panel"
 *    - Copy the deploy hook URL
 * 
 * 2. Replace VERCEL_DEPLOY_HOOK_URL below with your actual URL
 * 
 * 3. Include this script in admin/index.html
 */

// REPLACE THIS WITH YOUR ACTUAL VERCEL DEPLOY HOOK URL
const VERCEL_DEPLOY_HOOK_URL = 'https://api.vercel.com/v1/integrations/deploy/prj_FVAjEXBWHGBD7I7MsmlStOPJcbZc/pTE1h22jCC';

/**
 * Trigger Vercel deployment via deploy hook
 * This makes Vercel rebuild and redeploy your site
 */
async function triggerVercelDeployment(reason = 'Admin panel update') {
    try {
        window.Logger?.info('Triggering Vercel deployment...');
        
        const response = await fetch(VERCEL_DEPLOY_HOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                reason: reason,
                timestamp: new Date().toISOString()
            })
        });

        if (!response.ok) {
            throw new Error(`Deployment trigger failed: ${response.statusText}`);
        }

        const data = await response.json();
        window.Logger?.success('Vercel deployment triggered successfully:', data);
        
        return {
            success: true,
            jobId: data.job?.id,
            message: 'Deployment started. Your changes will be live in 2-3 minutes.'
        };
        
    } catch (error) {
        window.Logger?.error('Failed to trigger Vercel deployment:', error);
        return {
            success: false,
            error: error.message,
            message: 'Failed to trigger automatic deployment. Changes are saved but may require manual deployment.'
        };
    }
}

/**
 * Check deployment status (optional)
 * Requires Vercel API token
 */
async function checkDeploymentStatus(deploymentId) {
    // This would require Vercel API token
    // For now, we'll just show a message
    return {
        message: 'Deployment in progress. Check Vercel dashboard for status.',
        url: 'https://vercel.com/dashboard/deployments'
    };
}

/**
 * Auto-deploy after database changes
 * Call this after successful Supabase updates
 */
async function autoDeployAfterChange(changeType, changeDescription) {
    window.Logger?.info(`Auto-deploying after ${changeType}...`);
    
    const result = await triggerVercelDeployment(`${changeType}: ${changeDescription}`);
    
    if (result.success) {
        showNotification(
            `🚀 ${result.message}`,
            'success',
            5000
        );
    } else {
        showNotification(
            `⚠️ ${result.message}`,
            'warning',
            7000
        );
    }
    
    return result;
}

// Export for use in admin panel
if (typeof window !== 'undefined') {
    window.VercelDeploy = {
        trigger: triggerVercelDeployment,
        checkStatus: checkDeploymentStatus,
        autoDeployAfterChange: autoDeployAfterChange
    };
}
