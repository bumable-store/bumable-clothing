# BUMABLE - E-commerce Underwear Store

**Modern e-commerce website for men's underwear with cloud-powered admin dashboard**

🌐 **Live Site**: Coming Soon  
☁️ **Backend**: Supabase Cloud Database  
🔄 **Sync**: Real-time product synchronization across devices

## 🚀 Features

### Customer Features
- **Product Catalog**: Browse tie-dye, solid, and sports underwear with live pricing
- **Shopping Cart**: Add/remove items, quantity management
- **Real-time Updates**: Product prices and stock sync across all devices
- **Contact System**: Professional inquiry system with notifications
- **Policy Pages**: Store policy, shipping & returns, FAQ
- **Responsive Design**: Mobile-friendly interface

### Admin Features
- **Cloud Dashboard**: Customer statistics and analytics powered by Supabase
- **Product Management**: Update products - changes sync across all devices instantly
- **Order Management**: View and update order status in real-time
- **Contact Management**: Reply to customer inquiries
- **Export Functions**: Download order data as CSV
- **Database Security**: Row Level Security (RLS) enabled for all tables
- **Real-time Sync**: Product updates appear on all devices after page refresh

## 📁 Project Structure

```
├── index.html              # Main homepage
├── shop/
│   └── index.html         # Product catalog with Supabase integration
├── admin/
│   ├── index.html         # Admin control panel
│   ├── setup-database.html # Supabase configuration
│   ├── setup-products-table.sql # Database setup script
│   ├── PRODUCT-SYNC-SETUP.md # Product sync documentation
│   └── supabase-schema.sql # Complete database schema
├── css/
│   ├── style.css          # Main styles
│   └── responsive.css     # Mobile responsive styles
├── js/
│   ├── main.js            # Core functionality
│   ├── cart.js            # Shopping cart logic
│   ├── products.js        # Product manager (Supabase-backed)
│   ├── supabase-db.js     # Supabase database integration
│   ├── auth.js            # Authentication
│   └── notifications.js   # Notification system
├── images/
│   ├── hero-product-1.jpg
│   ├── hero-product-2.jpg
│   ├── trunk-treasure.jpg
│   └── products/          # Product images organized by category
│       ├── solid/
│       ├── tie-dye/
│       └── sports/
├── checkout/
│   └── index.html         # Order processing
├── policy/
│   └── index.html         # Terms and policies
├── shipping/
│   └── index.html         # Shipping information
├── faq/
│   └── index.html         # Frequently asked questions
└── success/
    └── index.html         # Order confirmation
```

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Supabase (PostgreSQL database)
- **Database**: 
  - PostgreSQL with Row Level Security (RLS)
  - Real-time product synchronization
  - Secure data storage in cloud
- **Storage**: localStorage for cart and preferences
- **Styling**: Custom CSS with Flexbox/Grid
- **Icons**: Font Awesome 6
- **Fonts**: Google Fonts (Poppins)
- **Security**: 
  - RLS policies on all tables
  - Optimized auth functions for performance
  - SECURITY INVOKER views

## 🔧 Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/bumable-store/bumable-clothing.git
cd bumable-clothing
```

### 2. Set Up Local Development Server
```bash
# Using Python (recommended)
python3 -m http.server 8000

# OR using Node.js
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