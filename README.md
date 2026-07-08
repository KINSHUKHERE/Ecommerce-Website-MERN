# YoCart - Modern MERN Stack E-Commerce Platform

**Live Deployment Demo URL**: [yocart.onrender.com](https://yocart.onrender.com)

YoCart is a premium, high-performance e-commerce platform built on the MERN stack (MongoDB, Express, React, Node.js). The application features a clean separation between the client store, the vendor panel, and a comprehensive admin management dashboard. Secured by JSON Web Token (JWT) identity authorization, it features rich, premium visual styles, micro-animations, and full mobile optimization.

---

## 📂 Project Structure

```text
├── Backend/
│   ├── src/
│   │   ├── db/
│   │   │   └── db.js            # MongoDB database connection logic (MongoDB Atlas)
│   │   ├── models/
│   │   │   ├── productsData.js  # Mongoose Schema for Products (referenced Category, Brand, Vendor)
│   │   │   ├── authDetails.js   # Mongoose Schema for Users & Vendors (roles, password hash, status)
│   │   │   ├── contactDetails.js # Mongoose Schema for Customer Queries
│   │   │   ├── cartDetails.js   # Mongoose Schema for Shopping Cart items
│   │   │   ├── categoryDetails.js # Mongoose Schema for Product Categories
│   │   │   ├── brandDetails.js  # Mongoose Schema for Brand Variants
│   │   │   ├── orderDetails.js  # Mongoose Schema for Orders (items, shipping addresses, statuses)
│   │   │   └── saleConfig.js    # Mongoose Schema for global sales configuration (active sales, branding, themes)
│   │   ├── controllers/
│   │   │   ├── authController.js # Auth, Google OAuth, Profile Completion & Directory audits
│   │   │   ├── productController.js # Product CRUD controllers (with populated vendor data)
│   │   │   ├── categoryController.js # Category CRUD controllers
│   │   │   ├── brandController.js # Brand CRUD controllers
│   │   │   ├── cartController.js # Cart CRUD controllers
│   │   │   ├── contactController.js # Customer enquiries handlers
│   │   │   ├── orderController.js # Order checkout & status update workflows
│   │   │   └── saleController.js # Global sale switches and active themes configuration
│   │   ├── middleware/
│   │   │   ├── verifyUser.js     # Validates HTTP-Only cookie / Bearer JWT to authorize active users
│   │   │   └── verifyVendorOrAdmin.js # Validates active user's payload has 'vendor' or 'admin' role
│   │   └── app.js               # Express API routes and application configuration
│   ├── server.js                # Server entry point (configures Port and starts server)
│   └── package.json             # Backend dependencies & scripts
│
├── Frontend/
│   ├── public/                  # Public assets
│   ├── src/
│   │   ├── api/
│   │   │   ├── ProductApi.js    # Product Axios API helper functions
│   │   │   ├── AuthApi.js       # Signup, Login, OAuth, & Profile settings Axios API helpers
│   │   │   ├── ContactApi.js    # Contact Queries Axios API helpers
│   │   │   ├── CartApi.js       # Shopping Cart CRUD Axios API helpers
│   │   │   ├── CategoryAndVarientApi.js # Category & Brand Axios API helpers
│   │   │   ├── OrderApi.js      # Order checkout and status Axios API helpers
│   │   │   ├── DashboardApi.js  # Stats & raw datasets Axios API helpers
│   │   │   └── SaleApi.js       # Global sale config Axios API helpers
│   │   ├── assets/              # App images & icons
│   │   ├── admin/               # Dedicated Admin Dashboard pages & components
│   │   │   ├── components/
│   │   │   │   ├── AdminLayout.jsx # Glassmorphic Admin Header and main content layout wrapper
│   │   │   │   └── AdminSidebar.jsx # Vertical navigation sidebar with active routing states
│   │   ├── theme/
│   │   │   └── ThemeEngine.js   # Reusable React Theme Engine storing colors, gradients, and assets
│   │   ├── components/          # Reusable UI layout elements
│   │   │   ├── Navbar.jsx       # Header & Navigation (Become a Seller link, cart count badge)
│   │   │   ├── Footer.jsx       # Footer layout
│   │   │   ├── Hero.jsx         # Landing Hero Section
│   │   │   ├── FeaturedProduct.jsx # Featured product grid with skeleton loader states
│   │   │   ├── EachProduct.jsx  # Individual product catalog card
│   │   │   ├── ScrollToTop.jsx  # Window viewport routing scroll resetter
│   │   │   ├── DynamicTitle.jsx # Browser title route-change dynamic synchronizer
│   │   │   └── FloatingStickers.jsx # Animated floating background stickers (emojis) for sales
│   │   ├── dashboard/           # Modular dashboard metrics & charts components
│   │   │   ├── DashboardSkeleton.jsx # Pulse skeleton loading component
│   │   │   ├── KpiCard.jsx      # Comparison percentage metrics card
│   │   │   ├── SalesTrendChart.jsx # Area chart tracking revenue over selectable ranges
│   │   │   ├── OrdersPieChart.jsx # Donut chart tracking order status divisions
│   │   │   ├── CategoryChart.jsx # Bar chart tracking products count per category
│   │   │   ├── InventoryChart.jsx # Donut chart tracking stock health (Out of Stock, Low Stock, Healthy)
│   │   │   └── TopProductsChart.jsx # Top products leaderboard with visual progress meters
│   │   ├── pages/               # Top-level Page layouts
│   │   │   ├── Home.jsx         # Customer home page view
│   │   │   ├── About.jsx        # About page view
│   │   │   ├── Contact.jsx      # Contact page view
│   │   │   ├── Cart.jsx         # Responsive shopping cart dashboard page
│   │   │   ├── Checkout.jsx     # Stripe-style checkout wizard with security checks
│   │   │   ├── Products.jsx     # Customer products catalog search & filter page
│   │   │   ├── ProductDetails.jsx # Customer product details page (with Seller Card & swatch options)
│   │   │   ├── Login.jsx        # User Login Interface
│   │   │   ├── SignUp.jsx       # User Registration Interface
│   │   │   ├── CompleteProfile.jsx # Google OAuth Profile completion wizard (no navbar)
│   │   │   ├── Profile.jsx      # Customer profile settings & dynamic orders tab list panel
│   │   │   └── admin/           # Admin Category/Brand/Order panels
│   │   │       ├── AdminDashboard.jsx  # SaaS analytics dashboard controller
│   │   │       ├── ContactDetails.jsx  # Customer enquiries table
│   │   │       ├── CreateProduct.jsx   # Add New Product Form (referencing categories & brands)
│   │   │       ├── CategoryManagement.jsx # Category CRUD interface
│   │   │       ├── BrandManagement.jsx # Brand CRUD interface
│   │   │       ├── VendorManagement.jsx # Vendor directory & approval panel
│   │   │       ├── VendorDetails.jsx   # Routed vendor metrics view (Stats, Products, Orders)
│   │   │       ├── UserManagement.jsx   # Customer directory & suspension controls
│   │   │       └── UserDetails.jsx     # Routed user purchase history and profile view
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx    # React Router definitions & session JWT validity checkers
│   │   ├── App.jsx              # Main App entry layout
│   │   ├── main.jsx             # React DOM root render
│   │   └── index.css            # Global CSS styles with Tailwind theme variables
```

---

## 🚀 Key Features

### 🛍️ Client & Customer Panel
*   **Become a Seller Guest Link:** Guest-oriented "Become a Seller" link pointing to `/register?role=vendor` in the desktop and mobile navigation layouts. This link automatically disappears once the user logs in.
*   **Flipkart/Amazon-Style Seller Widget:** Located at the bottom of the product details page, this widget displays the business name, GSTIN number, total active product catalog count, and a link to view other items from the same store.
*   **Smart Option Swatch Selection:** The product details page dynamically evaluates selected swatches. If a clicked attribute creates an invalid combination, it automatically selects the first valid alternative to prevent `₹0` prices. Faded style and diagonal strike-through formatting are applied to unavailable variations.
*   **Checkout Wizard:** A Stripe-style 2-page checkout flow verifying details and processing simulate-UPI or credit/debit card secure payments.

### 🏪 Vendor Panel & Route Prefix `/vendor`
*   **Prefix Path Namespace:** Isolated all vendor panel components under `/vendor/*` paths (e.g. `/vendor`, `/vendor/products`, `/vendor/order-details`, `/vendor/profile`, `/vendor/support`). Dynamic tab titles update page titles to show *Seller - Products*, *Seller - Profile* etc.
*   **Catalog Upload:** Vendors can configure products, add variant stock levels, set variant pricing details, upload photos, and track orders containing their products.

### 🛡️ Super Admin Control Panel
*   **Dynamic Title Guard:** Tracks and updates browser document tab titles based on active route paths.
*   **Routed Vendor Details View (`/admin/vendors/:vendorId`):**
    *   Full credentials (GSTIN, Business Address, Owner Name, Registered Email, Phone, Status).
    *   Calculated statistics: Total Uploaded Products, Seller Orders, and Store Revenue.
    *   Lists of products owned by the vendor and historical order earnings.
    *   **Direct action controls:** Status buttons to Approve Seller or Suspend Seller directly on their profile page.
    *   **Delete control:** Safe confirmation modal to permanently purge the vendor.
*   **Routed Customer Details View (`/admin/users/:userId`):**
    *   Full credentials (Name, Email, Phone, Joined Date, Status).
    *   Calculated statistics: Total Orders and Total Spent.
    *   Detailed list of orders containing item breakdowns, quantities, and paid amounts.
    *   **Direct action controls:** Status buttons to Suspend User or Reactivate User directly on their profile page.
    *   **Delete control:** Safe confirmation modal to permanently purge the customer account.
*   **Permanent Database Hard Deletions:** Deleting brands, categories, products, and variants permanently deletes them from MongoDB rather than soft-deleting them.

---

## 🎨 Interactive Festive Branding & Theme Engine
YoCart incorporates a dynamic React Theme Engine allowing the Super Admin to turn on active sales and assign festive configurations manually from the Admin dashboard panel.

*   **Supported Themes:** Diwali, Summer, Winter, Holi, Christmas, and YoCart Special Sale.
*   **Theme ACCENTS & Accoutrements:**
    *   **Diwali:** Warm golden-purple background washes, floating lamps/kandils, soft golden accents, card borders, and glowing button shadows.
    *   **Holi:** Pink-emerald watercolor splashes, pichkaaris, and colorful sale ribbons.
    *   **Christmas:** Snowy white-emerald-red gradients, snowflakes, gift-wraps, and hanging ornaments.
    *   **Winter:** Frosted sky-blue and silver gradients, frosted cards, and ice crystals.
    *   **Summer:** Creamy tropical leaf gradients and turquoise-coral buttons.
    *   **YoCart Special:** Cyan-navy geometric brand patterns, luxury borders, and neon hover effects.
*   **Floating Background Stickers (`FloatingStickers.jsx`):** Emits themed emojis scattered down both page margins with multi-directional CSS keyframes animations (`floatUpDown`, `floatLeftRight`, `floatDiagonalUp`, `floatDiagonalDown`) at low opacity (`0.14`) and `pointer-events-none` to prevent interference.

---

## 📊 SaaS Recharts Dashboard Analytics
The admin and vendor panels feature a visual business intelligence dashboard built on top of Recharts, calculated on the fly inside optimized React hooks (`useMemo`).

*   **KPI Cards:** Shows Total Revenue, Total Orders, Catalog counts, and Users. Displays comparative percentage changes vs the previous month (e.g. `↑ 18% vs last month`).
*   **Sales Trend (Area Chart):** High-fidelity sales curve supporting dynamic dropdown range filters (`Today`, `Last 7 Days`, `Last 30 Days`, `Last 6 Months`, `This Year`, `All Time`).
*   **Order fulfillment (Pie Chart):** Donut breakdown of order status distributions (Processing, Shipped, Delivered, Cancelled, Returned).
*   **Stock Health (Donut Chart):** Computes product inventory levels (sums quantities across variants) classifying them into Out of Stock, Low Stock (`<10`), and Healthy.
*   **Sellers Leaderboard (Products, Vendors, Buyers):** Boxed cells listing top products by units sold and generated revenue, top-billing vendors, and top-spent customer accounts.
*   **Fulfillment Isolation:** Vendor dashboards filter metrics and orders specifically to their listings. Revenue calculations tally only order items belonging to the vendor.
*   **One-Click Report Download:** Local CSV generator compiling orders data to spreadsheet-ready tables.

---

## 🔐 Security & Identity Infrastructure
*   **Unified Google OAuth & Local Login:** Integrates OAuth sign-ins. Newly registered Google accounts are routed to `/complete-profile` to finalize credentials.
*   **JWT Cookie-Based Authorization:** Validates user payloads using HTTP-Only cookies. Administrative and vendor controls are guarded by strict role middlewares.
*   **Stock Management:** Checkout automatically decrements quantities of ordered product variants and updates product statuses.

---

## 🛠️ Technology Stack
*   **Frontend:** React 19, Vite, Tailwind CSS v4, Recharts, Lucide React, Axios, React Router DOM v7, Google OAuth Library
*   **Backend:** Node.js, Express.js, MongoDB (Atlas), Mongoose ODM, BcryptJS, JSONWebToken, Cookie-Parser, Cors

---

## ⚙️ Setup & Installation

### 1. Clone the codebase
```bash
git clone https://github.com/KINSHUKHERE/Ecommerce-Website-MERN-.git
cd Ecommerce-Website-MERN-
```

### 2. Configure the Backend
Navigate to the `Backend` directory and install dependencies:
```bash
cd Backend
npm install
```
Create a `.env` file in the root of the `Backend/` folder:
```env
MONGO_URI=your_mongodb_atlas_connection_string_here
JWT_SECRET=your_jwt_private_key_here
GOOGLE_CLIENT_ID=your_google_client_id_here
PORT=3000
```
Start the backend server:
```bash
npm start
```
The server will run on `http://localhost:3000`.

### 3. Configure the Frontend
Navigate to the `Frontend` directory and install dependencies:
```bash
cd ../Frontend
npm install
```
Create a `.env` file in the root of the `Frontend/` folder:
```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```
Start the Vite development server:
```bash
npm run dev
```
The application will start running on `http://localhost:5173`.
