# BUMABLE - E-commerce Underwear Store

**Professional e-commerce website for men's underwear with cloud-powered features**

🌐 **Live Site**: [bumable-store.github.io/bumable-clothing](https://bumable-store.github.io/bumable-clothing)  
☁️ **Backend**: Supabase (PostgreSQL)  
🎨 **Design**: Modern, responsive, accessible

## 🚀 Features

### Customer Experience
- Product catalog with real-time pricing
- Shopping cart with Supabase cloud sync
- User authentication & order tracking
- Mobile-responsive design
- WCAG 2.1 accessible
- SEO optimized with Open Graph & Schema.org

### Admin Dashboard
- Cloud-based product management
- Order & customer analytics
- Real-time inventory updates
- Secure authentication with RLS policies

### Professional E-commerce
- Google Analytics 4 & Facebook Pixel tracking
- GDPR-compliant cookie consent
- Comprehensive Privacy Policy & Terms
- Online/offline detection
- Enhanced error handling with user-friendly notifications

## 📁 Quick Start

### Local Development
```bash
# Start server
python3 -m http.server 8000

# Open browser
http://localhost:8000
```

### Admin Setup
1. Visit `/admin/setup-database.html`
2. Enter Supabase credentials
3. Run schema installation
4. Configure products

## 🛠️ Tech Stack

**Frontend**: HTML5, CSS3, JavaScript (ES6+)  
**Backend**: Supabase (PostgreSQL with RLS)  
**Analytics**: Google Analytics 4, Facebook Pixel  
**Fonts**: Google Fonts (Poppins)  
**Icons**: Font Awesome 6

## � Project Structure

```
├── index.html              # Homepage
├── shop/                   # Product catalog
├── checkout/               # Order processing
├── admin/                  # Admin dashboard
├── js/                     # JavaScript modules
│   ├── cart.js            # Shopping cart
│   ├── products.js        # Product manager
│   ├── supabase-db.js     # Database client
│   ├── auth.js            # Authentication
│   ├── analytics.js       # GA4 & FB Pixel
│   ├── accessibility.js   # A11y features
│   └── error-handler.js   # Error management
├── css/                    # Stylesheets
├── images/                 # Product images
└── privacy-policy/         # Legal pages
```

## � Security

- Row Level Security (RLS) on all tables
- Secure authentication with Supabase
- HTTPS-only cookie policy
- XSS & CSRF protection

## 📱 Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader announcements
- Focus management
- Skip-to-content links
- WCAG 2.1 Level AA compliant

## � Analytics

- Product view tracking
- Add-to-cart events
- Checkout funnel
- Purchase conversions
- Custom event tracking

## 📄 License

All rights reserved © 2025 BUMABLE

## 🤝 Contact

For inquiries: ingeniumcouture@gmail.com
npx http-server -p 8000
```

Open http://localhost:8000 in your browser

### 3. Configure Supabase Database

#### Option A: Use Existing Configuration (if already set up)
- Configuration is stored in browser localStorage
- No additional setup needed

#### Option B: Set Up New Supabase Project
1. Create account at https://supabase.com
2. Create new project
3. Go to **SQL Editor** in Supabase dashboard
4. Run `admin/setup-products-table.sql` to create products table
5. Run `admin/supabase-schema.sql` for complete database schema

#### Option C: Configure via Admin Panel
1. Open http://localhost:8000/admin/setup-database.html
2. Enter your Supabase credentials:
   - **Supabase URL**: `https://[project-ref].supabase.co`
   - **Supabase Anon Key**: Your project's anon/public key
3. Click **Save Configuration**
4. Run SQL scripts in Supabase dashboard

### 4. Verify Setup
1. Refresh any page
2. Open browser console (F12)
3. Look for: `✅ Loaded 12 products from Supabase`
4. If you see this, setup is complete!

### 5. Admin Access
- Navigate to `/admin/index.html`
- Use configured authentication credentials

## 🎨 Color Scheme

- **Primary**: #e74c3c (Red)
- **Secondary**: #c0392b (Dark Red)
- **Text**: #333 (Dark Gray)
- **Background**: #f8f9fa (Light Gray)

## 🔄 Product Synchronization

### How It Works
1. **Admin updates product** (price, stock, image) in admin panel
2. **Changes saved to Supabase** cloud database
3. **All devices fetch from Supabase** on page refresh
4. **Everyone sees updated data** within 1-2 seconds

### Sync Time
- **Instant**: On page refresh (~1-2 seconds)
- **Cross-device**: Works across desktop, mobile, tablet
- **No local cache**: Data always fresh from database

### Field Mapping
JavaScript (camelCase) ↔ PostgreSQL (snake_case):
- `regularPrice` ↔ `regular_price`
- `salePrice` ↔ `sale_price`
- `onSale` ↔ `on_sale`
- `imageUrl` ↔ `image_url`
- `inStock` ↔ `in_stock`
- `stockCount` ↔ `stock_count`
- `availableSizes` ↔ `available_sizes`

## 📚 Documentation

- **`admin/PRODUCT-SYNC-SETUP.md`** - Complete product sync guide
- **`admin/setup-products-table.sql`** - Products table creation script
- **`admin/supabase-schema.sql`** - Full database schema
- **`admin/DEPLOYMENT-SETUP.md`** - Deployment instructions

## 📊 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open pull request

## 🚀 Recent Updates

### December 2024 - Supabase Integration
- ✅ Migrated from localStorage to Supabase cloud database
- ✅ Implemented cross-device product synchronization
- ✅ Added Row Level Security (RLS) to all tables
- ✅ Optimized database queries for performance
- ✅ Created comprehensive product management system
- ✅ Added automatic field mapping (camelCase ↔ snake_case)
- ✅ Implemented real-time price and stock updates

### Key Improvements
- **Security**: All database operations protected by RLS policies
- **Performance**: Optimized auth function calls, added indexes
- **Scalability**: Cloud database handles multiple concurrent users
- **Maintainability**: Centralized product data (no hardcoded arrays)
- **User Experience**: Admin changes reflect instantly across all devices

## 📧 Contact

For support or inquiries: Contact through GitHub Issues

---
**© 2025 BUMABLE. All rights reserved.**