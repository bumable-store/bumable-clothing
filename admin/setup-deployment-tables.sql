-- Bumable Clothing Deployment System - Supabase Database Schema
-- Run this SQL in your Supabase dashboard to set up the deployment system

-- 1. Website Deployments Table
-- This stores all deployments, drafts, and rollbacks with version control
CREATE TABLE IF NOT EXISTS website_deployments (
    id TEXT PRIMARY KEY,
    content JSONB NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('draft', 'deployment', 'rollback')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'deploying', 'deployed', 'failed')),
    version INTEGER,
    description TEXT,
    changes TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT DEFAULT 'admin',
    rollback_from TEXT REFERENCES website_deployments(id),
    
    -- Indexes for performance
    CONSTRAINT unique_deployment_version UNIQUE (version)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_deployments_type_created ON website_deployments(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON website_deployments(status);
CREATE INDEX IF NOT EXISTS idx_deployments_version ON website_deployments(version DESC);

-- 2. Website Layout Table (for live content)
-- This stores the current live website content
CREATE TABLE IF NOT EXISTS website_layout (
    section TEXT PRIMARY KEY,
    content JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by TEXT DEFAULT 'admin',
    deployment_id TEXT REFERENCES website_deployments(id)
);

-- Insert default homepage section if it doesn't exist
INSERT INTO website_layout (section, content) 
VALUES ('homepage', '{}') 
ON CONFLICT (section) DO NOTHING;

-- 3. Deployment Logs Table (for tracking deployment events)
CREATE TABLE IF NOT EXISTS deployment_logs (
    id SERIAL PRIMARY KEY,
    deployment_id TEXT NOT NULL REFERENCES website_deployments(id),
    event_type TEXT NOT NULL CHECK (event_type IN ('started', 'completed', 'failed', 'rolled_back')),
    message TEXT,
    error_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT DEFAULT 'admin'
);

-- Create index for deployment logs
CREATE INDEX IF NOT EXISTS idx_deployment_logs_deployment_created ON deployment_logs(deployment_id, created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE website_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_layout ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_logs ENABLE ROW LEVEL SECURITY;

-- 5. Create policies for admin access
-- Note: Adjust these policies based on your authentication system

-- Website deployments policies
DROP POLICY IF EXISTS "Enable read access for all users" ON website_deployments;
CREATE POLICY "Enable read access for all users" ON website_deployments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for admin users" ON website_deployments;
CREATE POLICY "Enable insert for admin users" ON website_deployments
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for admin users" ON website_deployments;
CREATE POLICY "Enable update for admin users" ON website_deployments
    FOR UPDATE USING (true);

-- Website layout policies
DROP POLICY IF EXISTS "Enable read access for all users" ON website_layout;
CREATE POLICY "Enable read access for all users" ON website_layout
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for admin users" ON website_layout;
CREATE POLICY "Enable insert for admin users" ON website_layout
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for admin users" ON website_layout;
CREATE POLICY "Enable update for admin users" ON website_layout
    FOR UPDATE USING (true);

-- Deployment logs policies
DROP POLICY IF EXISTS "Enable read access for all users" ON deployment_logs;
CREATE POLICY "Enable read access for all users" ON deployment_logs
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for admin users" ON deployment_logs;
CREATE POLICY "Enable insert for admin users" ON deployment_logs
    FOR INSERT WITH CHECK (true);

-- 6. Create helpful views for common queries

-- View for latest deployments with change summaries
CREATE OR REPLACE VIEW latest_deployments AS
SELECT 
    id,
    description,
    version,
    type,
    status,
    array_length(changes, 1) as change_count,
    created_at,
    created_by,
    CASE 
        WHEN type = 'rollback' THEN 'Rollback'
        WHEN type = 'deployment' THEN 'Deployment'
        WHEN type = 'draft' THEN 'Draft'
        ELSE 'Unknown'
    END as type_display
FROM website_deployments 
WHERE type IN ('deployment', 'rollback')
ORDER BY created_at DESC;

-- View for deployment statistics
CREATE OR REPLACE VIEW deployment_stats AS
SELECT 
    COUNT(*) as total_deployments,
    COUNT(CASE WHEN type = 'deployment' THEN 1 END) as successful_deployments,
    COUNT(CASE WHEN type = 'rollback' THEN 1 END) as rollbacks,
    MAX(version) as latest_version,
    MAX(created_at) as last_deployment_date
FROM website_deployments 
WHERE type IN ('deployment', 'rollback');

-- 7. Create functions for common operations

-- Function to get the current live content
CREATE OR REPLACE FUNCTION get_live_content()
RETURNS JSONB AS $$
BEGIN
    RETURN (
        SELECT content 
        FROM website_layout 
        WHERE section = 'homepage'
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get deployment history with pagination
CREATE OR REPLACE FUNCTION get_deployment_history(page_size INT DEFAULT 20, page_offset INT DEFAULT 0)
RETURNS TABLE(
    deployment_id TEXT,
    description TEXT,
    version INTEGER,
    type TEXT,
    status TEXT,
    changes TEXT[],
    change_count INT,
    created_at TIMESTAMPTZ,
    created_by TEXT,
    is_current BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.description,
        d.version,
        d.type,
        d.status,
        d.changes,
        array_length(d.changes, 1) as change_count,
        d.created_at,
        d.created_by,
        (d.id = (
            SELECT deployment_id 
            FROM website_layout 
            WHERE section = 'homepage'
        )) as is_current
    FROM website_deployments d
    WHERE d.type IN ('deployment', 'rollback')
    ORDER BY d.created_at DESC
    LIMIT page_size OFFSET page_offset;
END;
$$ LANGUAGE plpgsql;

-- 8. Insert some sample data for testing (optional)
/*
INSERT INTO website_deployments (id, content, type, status, version, description, changes, created_by) 
VALUES 
(
    'deploy_' || extract(epoch from now())::bigint,
    '{"hero": {"title": "Welcome to Bumable", "subtitle": "Premium Streetwear"}}',
    'deployment',
    'deployed',
    1,
    'Initial website launch',
    ARRAY['Hero section created', 'Initial layout setup'],
    'admin'
);
*/

-- Success message
SELECT 'Deployment system database setup completed successfully!' as message;