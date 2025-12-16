-- Website Layout Management Table
-- This table stores all homepage layout configurations

CREATE TABLE IF NOT EXISTS website_layout (
    id SERIAL PRIMARY KEY,
    section VARCHAR(50) NOT NULL, -- 'homepage', 'about', 'contact', etc.
    content JSONB NOT NULL, -- JSON content for the section
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by VARCHAR(100) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1
);

-- Create unique index to ensure one active record per section
CREATE UNIQUE INDEX IF NOT EXISTS idx_website_layout_section_active 
ON website_layout (section) WHERE is_active = true;

-- Insert default homepage layout
INSERT INTO website_layout (section, content, updated_by) VALUES 
('homepage', '{
    "hero": {
        "title": "Discover BUMABLE",
        "subtitle": "Mom approved. Girlfriend removed. Discover stylish men''s underwear that owns the spotlight.",
        "image1": "images/hero-product-1.jpg",
        "image2": "images/hero-product-2.jpg"
    },
    "instagram": {
        "title": "Connect on Instagram",
        "subtitle": "Follow @bumableclothing for latest updates and style inspiration",
        "profile": "https://instagram.com/bumableclothing",
        "posts": [
            {
                "image": "images/instagram-1.jpg",
                "link": "https://instagram.com/p/example1"
            },
            {
                "image": "images/instagram-2.jpg", 
                "link": "https://instagram.com/p/example2"
            },
            {
                "image": "images/instagram-3.jpg",
                "link": "https://instagram.com/p/example3"
            },
            {
                "image": "images/instagram-4.jpg",
                "link": "https://instagram.com/p/example4"
            }
        ]
    },
    "about": {
        "title": "Why Choose BUMABLE?",
        "description": "We believe that great underwear should be both comfortable and stylish. Our premium collection combines innovative fabrics with modern designs to give you confidence all day long."
    }
}', 'admin')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE website_layout ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON website_layout
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON website_layout
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON website_layout
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Comments for documentation
COMMENT ON TABLE website_layout IS 'Stores website layout and content configurations';
COMMENT ON COLUMN website_layout.section IS 'Section identifier (homepage, about, contact, etc.)';
COMMENT ON COLUMN website_layout.content IS 'JSON content for the section including images, text, links';
COMMENT ON COLUMN website_layout.updated_at IS 'Timestamp when the layout was last updated';
COMMENT ON COLUMN website_layout.updated_by IS 'User who updated the layout';
COMMENT ON COLUMN website_layout.is_active IS 'Whether this version is currently active';
COMMENT ON COLUMN website_layout.version IS 'Version number for tracking changes';