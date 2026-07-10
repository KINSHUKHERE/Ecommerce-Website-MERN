# YoCart - Modern MERN Stack E-Commerce Platform

**Live Deployment Demo URL**: [yocart.onrender.com](https://yocart.onrender.com)

YoCart is a premium, high-performance e-commerce platform built on the MERN stack (MongoDB, Express, React, Node.js). The application features a clean separation between the client store, the vendor panel, and a comprehensive admin management dashboard. Secured by JSON Web Token (JWT) identity authorization, it features rich, premium visual styles, micro-animations, and full mobile optimization.

---

## 📂 Project Structure

```text
├── Backend/
│   ├── src/
│   │   ├── db/
│   │   │   └── db.js                  # MongoDB database connection logic (MongoDB Atlas)
│   │   ├── models/
│   │   │   ├── productsData.js        # Mongoose Schema for Products (referenced Category, Brand, Vendor)
│   │   │   ├── authDetails.js         # Mongoose Schema for Users & Vendors (roles, password hash, status)
│   │   │   ├── contactDetails.js      # Mongoose Schema for Customer Queries
│   │   │   ├── cartDetails.js         # Mongoose Schema for Shopping Cart items
│   │   │   ├── categoryDetails.js     # Mongoose Schema for Product Categories
│   │   │   ├── brandDetails.js        # Mongoose Schema for Brand Variants
│   │   │   ├── orderDetails.js        # Mongoose Schema for Orders (items, shipping, payment, statuses)
│   │   │   ├── notificationDetails.js # Mongoose Schema for Admin & Vendor real-time notifications
│   │   │   └── saleConfig.js          # Mongoose Schema for global sales configuration
│   │   ├── controllers/
│   │   │   ├── authController.js      # Auth, Google OAuth, Profile Completion & Directory audits
│   │   │   ├── productController.js   # Product CRUD controllers (with populated vendor data)
│   │   │   ├── categoryController.js  # Category CRUD controllers
│   │   │   ├── brandController.js     # Brand CRUD controllers
│   │   │   ├── cartController.js      # Cart CRUD controllers
│   │   │   ├── contactController.js   # Customer enquiries handlers
│   │   │   ├── orderController.js     # Order checkout, status update & cancellation workflows
│   │   │   ├── paymentController.js   # Razorpay order creation & HMAC payment verification
│   │   │   ├── notificationController.js # Read/unread/delete notification handlers
│   │   │   └── saleController.js      # Global sale switches and active themes configuration
│   │   ├── middleware/
│   │   │   ├── verifyUser.js          # Validates HTTP-Only cookie / Bearer JWT to authorize users
│   │   │   └── verifyVendorOrAdmin.js # Validates active user's payload has 'vendor' or 'admin' role
│   │   └── app.js                     # Express API routes, rate-limit configs, and app configuration
│   ├── server.js                      # Server entry point (configures Port and starts server)
│   └── package.json                   # Backend dependencies & scripts
│
├── Frontend/
│   ├── public/                        # Public assets
│   ├── src/
│   │   ├── api/
│   │   │   ├── ProductApi.js          # Product Axios API helper functions
│   │   │   ├── AuthApi.js             # Signup, Login, OAuth & Profile settings Axios API helpers
│   │   │   ├── ContactApi.js          # Contact Queries Axios API helpers
│   │   │   ├── CartApi.js             # Shopping Cart CRUD Axios API helpers
│   │   │   ├── CategoryAndVarientApi.js # Category & Brand Axios API helpers
│   │   │   ├── OrderApi.js            # Order checkout and status Axios API helpers
│   │   │   ├── PaymentApi.js          # Razorpay order creation & payment verification API helpers
│   │   │   ├── DashboardApi.js        # Stats & raw datasets Axios API helpers
│   │   │   ├── NotificationApi.js     # Notification Axios API helpers
│   │   │   └── SaleApi.js             # Global sale config Axios API helpers
│   │   ├── assets/                    # App images & icons
│   │   ├── admin/                     # Dedicated Admin Dashboard pages & components
│   │   │   ├── components/
│   │   │   │   ├── AdminLayout.jsx    # Glassmorphic Admin Header (with real-time NotificationBell)
│   │   │   │   ├── AdminSidebar.jsx   # Vertical navigation sidebar with active routing states
│   │   │   │   └── NotificationBell.jsx # Premium notification popover (10s auto-polling)
│   │   ├── theme/
│   │   │   └── ThemeEngine.js        # Reusable React Theme Engine (colors, gradients, assets)
│   │   ├── utils/
│   │   │   └── commissionHelper.js   # Shared utility for vendor sales commission metrics
│   │   ├── components/               # Reusable UI layout elements
│   │   │   ├── Navbar.jsx            # Header & Navigation (cart count badge, wishlist)
│   │   │   ├── Footer.jsx            # Footer layout
│   │   │   ├── Hero.jsx              # Landing Hero Section
│   │   │   ├── FeaturedProduct.jsx   # Featured product grid with skeleton loader states
│   │   │   ├── EachProduct.jsx       # Individual product catalog card
│   │   │   ├── ScrollToTop.jsx       # Window viewport routing scroll resetter
│   │   │   ├── DynamicTitle.jsx      # Browser title route-change dynamic synchronizer
│   │   │   └── FloatingStickers.jsx  # Animated floating background stickers for sales
│   │   ├── dashboard/                # Modular dashboard metrics & charts components
│   │   │   ├── DashboardSkeleton.jsx # Pulse skeleton loading component
│   │   │   ├── KpiCard.jsx           # Comparison percentage metrics card
│   │   │   ├── SalesTrendChart.jsx   # Area chart tracking revenue over selectable ranges
│   │   │   ├── OrdersPieChart.jsx    # Donut chart tracking order status divisions
│   │   │   ├── CategoryChart.jsx     # Bar chart tracking products count per category
│   │   │   ├── InventoryChart.jsx    # Donut chart tracking stock health
│   │   │   └── TopProductsChart.jsx  # Top products leaderboard with visual progress meters
│   │   ├── pages/                    # Top-level Page layouts
│   │   │   ├── Home.jsx              # Customer home page view
│   │   │   ├── About.jsx             # About page view
│   │   │   ├── Contact.jsx           # Contact page view
│   │   │   ├── Cart.jsx              # Shopping cart with dynamic delivery charge calculation
│   │   │   ├── Checkout.jsx          # Razorpay-powered multi-step checkout wizard
│   │   │   ├── Products.jsx          # Customer products catalog search & filter page
│   │   │   ├── ProductDetails.jsx    # Product details page (variants, wishlist, add to cart)
│   │   │   ├── Wishlist.jsx          # Customer wishlist page
│   │   │   ├── Login.jsx             # User Login Interface
│   │   │   ├── SignUp.jsx            # User Registration Interface
│   │   │   ├── CompleteProfile.jsx   # Google OAuth Profile completion wizard
│   │   │   ├── Profile.jsx           # Customer profile, order history, tracking & cancellation
│   │   │   └── admin/                # Admin Category/Brand/Order panels
│   │   │       ├── AdminDashboard.jsx     # SaaS analytics dashboard controller
│   │   │       ├── ContactDetails.jsx     # Customer enquiries table
│   │   │       ├── CreateProduct.jsx      # Add New Product Form
│   │   │       ├── CategoryManagement.jsx # Category CRUD interface
│   │   │       ├── BrandManagement.jsx    # Brand CRUD interface
│   │   │       ├── VendorManagement.jsx   # Vendor directory & approval panel
│   │   │       ├── VendorDetails.jsx      # Routed vendor metrics view
│   │   │       ├── UserManagement.jsx     # Customer directory & suspension controls
│   │   │       └── UserDetails.jsx        # Routed user purchase history and profile view
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx         # React Router definitions & session JWT validity checkers
│   │   ├── App.jsx                   # Main App entry layout
│   │   ├── main.jsx                  # React DOM root render
│   │   └── index.css                 # Global CSS styles with Tailwind theme variables
```

---

## 🚀 Key Features

### 🛍️ Client & Customer Panel

- **Razorpay Payment Gateway:** Real payment processing via Razorpay supporting UPI, Credit/Debit Cards, Netbanking, and Wallets. Payments are HMAC SHA256 signature-verified on the backend before an order is recorded in the database. A "Cash on Delivery (COD)" option is also available, bypassing the gateway entirely.
- **Dynamic Delivery Charges:** Orders below ₹1,000 incur a ₹20 delivery fee; orders of ₹1,000 or above get **FREE delivery**. The Cart page shows a live nudge ("Add ₹X more for FREE Delivery!") and the Checkout order summary shows an itemized breakdown of subtotal + delivery + final total.
- **Smart Option Swatch Selection:** The product details page dynamically evaluates selected swatches. If a clicked attribute creates an invalid combination, it automatically selects the first valid alternative. Faded style and diagonal strike-through formatting are applied to unavailable variations.
- **Add to Wishlist & Add to Cart (Inline):** Action buttons appear directly below the variant selectors on the product details page — always visible inline on both mobile and desktop.
- **Order Tracking with Chain UI Stepper:** After placing an order, users can tap it in the Profile panel to see a visual chain-style stepper showing **Processing → Shipped → Delivered** with color-coded connector segments and step descriptions.
- **Order Cancellation with Confirmation:** Users can cancel orders from the Profile panel. A simple confirmation modal ("Do you really want to cancel?") with "Yes, Cancel" / "No, Keep" buttons prevents accidental cancellations. Delivered orders cannot be cancelled.
- **Profile Page State Persistence:** Active tab and selected order are saved to `sessionStorage` so full page reloads do not reset the user back to the Settings tab.
- **Flipkart/Amazon-Style Seller Widget:** Located at the bottom of the product details page, showing business name, GSTIN, total active product count, and a "View Store" link.
- **Become a Seller Guest Link:** Shown only to logged-out users in the navigation; disappears automatically after login.
- **Wishlist Management:** Full wishlist with toggle support and persistent local cache via `localStorage`.

### 🏪 Vendor Panel & Route Prefix `/vendor`

- **Prefix Path Namespace:** Isolated all vendor panel components under `/vendor/*` paths (e.g. `/vendor`, `/vendor/products`, `/vendor/order-details`, `/vendor/profile`, `/vendor/support`).
- **Catalog Upload:** Vendors can configure products, add variant stock levels, set variant pricing details, upload photos, and track orders containing their products.

### 🛡️ Super Admin Control Panel

- **Dynamic Title Guard:** Tracks and updates browser document tab titles based on active route paths.
- **Routed Vendor Details View (`/admin/vendors/:vendorId`):**
  - Full credentials (GSTIN, Business Address, Owner Name, Registered Email, Phone, Status).
  - Calculated statistics: Total Products, Seller Orders, and Store Revenue.
  - Direct action controls: Approve Seller or Suspend Seller.
  - Safe confirmation modal for permanent vendor deletion.
- **Routed Customer Details View (`/admin/users/:userId`):**
  - Full credentials (Name, Email, Phone, Joined Date, Status).
  - Calculated statistics: Total Orders and Total Spent.
  - Detailed order history with item breakdowns and paid amounts.
  - Direct action controls: Suspend User or Reactivate User.
- **Permanent Database Hard Deletions:** Deleting brands, categories, products, and variants permanently removes them from MongoDB.

---

## 🎨 Interactive Festive Branding & Theme Engine

YoCart incorporates a dynamic React Theme Engine allowing the Super Admin to turn on active sales and assign festive configurations from the Admin dashboard.

- **Supported Themes:** Diwali, Summer, Winter, Holi, Christmas, and YoCart Special Sale.
- **Theme Accents:**
  - **Diwali:** Warm golden-purple background washes, floating lamps/kandils, soft golden accents.
  - **Holi:** Pink-emerald watercolor splashes, pichkaaris, and colorful sale ribbons.
  - **Christmas:** Snowy white-emerald-red gradients, snowflakes, gift-wraps, and hanging ornaments.
  - **Winter:** Frosted sky-blue and silver gradients, frosted cards, and ice crystals.
  - **Summer:** Creamy tropical leaf gradients and turquoise-coral buttons.
  - **YoCart Special:** Cyan-navy geometric brand patterns, luxury borders, and neon hover effects.
- **Floating Background Stickers (`FloatingStickers.jsx`):** Emits themed emojis scattered down both page margins with multi-directional CSS keyframe animations at low opacity and `pointer-events-none` to prevent interference.

---

## 📊 SaaS Recharts Dashboard Analytics

The admin and vendor panels feature a visual business intelligence dashboard built on Recharts, calculated on the fly inside optimized React hooks (`useMemo`).

- **KPI Cards:** Shows Total Revenue, Total Orders, Catalog counts, and Users with comparative percentage changes vs the previous month (e.g. `↑ 18% vs last month`).
- **Sales Trend (Area Chart):** High-fidelity sales curve supporting dynamic range filters (`Today`, `Last 7 Days`, `Last 30 Days`, `Last 6 Months`, `This Year`, `All Time`).
- **Order Fulfillment (Pie Chart):** Donut breakdown of order status distributions (Processing, Shipped, Delivered, Cancelled).
- **Stock Health (Donut Chart):** Classifies inventory into Out of Stock, Low Stock (`< 10`), and Healthy across all variants.
- **Sellers Leaderboard:** Top products by units sold and revenue, top-billing vendors, and top-spent customers.
- **Fulfillment Isolation:** Vendor dashboards filter metrics and orders specifically to their listings.
- **One-Click Report Download:** Local CSV generator compiling orders data to spreadsheet-ready tables.

---

## 💸 Admin Commission System & Rate Limiting

- **Dynamic Commission Engine:** Resolved month-by-month comparing a vendor's monthly sales to tier targets:
  - **Tier 1:** 1% Commission for monthly sales $\le$ ₹2,00,000.
  - **Tier 2:** 5% Commission for monthly sales $\le$ ₹10,00,000.
  - **Tier 3:** 10% Commission for monthly sales $>$ ₹10,00,000.
- **Legal Compliance Checkboxes:** Required Terms & Conditions checkbox on the "Become a Seller" and signup forms, linking to Section 8 of the Terms & Conditions page.
- **Dashboard Insights:** Total commission earned on Admin Dashboard, vendor-specific commission widgets on the vendor panel.
- **API Protection (Rate Limiting):**
  - **Global Limiter:** 250 requests per minute across all endpoints.
  - **Sensitive Operations Limiter:** 20 requests per 15 minutes on `/login`, `/signup`, `/become-seller`, `/complete-profile`, `/post-contactdetails`, and order creation.

---

## 🔐 Security & Identity Infrastructure

- **Unified Google OAuth & Local Login:** Integrates OAuth sign-ins. New Google accounts are routed to `/complete-profile` to finalize credentials.
- **JWT Cookie-Based Authorization:** Validates user payloads using HTTP-Only cookies. Admin and vendor controls are guarded by strict role middlewares.
- **Razorpay HMAC Signature Verification:** Every online payment is verified server-side using `crypto` HMAC SHA256 before any order is written to the database, preventing fraudulent order creation.
- **Stock Management:** Checkout automatically decrements quantities of ordered product variants.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Recharts, Lucide React, Axios, React Router DOM v7, Google OAuth Library |
| **Backend** | Node.js, Express.js, MongoDB Atlas, Mongoose ODM, BcryptJS, JSONWebToken, Cookie-Parser, Cors, Razorpay SDK |
| **Payments** | Razorpay (UPI, Cards, Netbanking, Wallets) — PCI DSS compliant |
| **Storage** | Cloudinary (product image uploads) |
| **Deployment** | Render (Backend + Frontend) |

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
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
PORT=3000
```

> **Note:** Get your Razorpay test keys from [razorpay.com](https://razorpay.com) → Dashboard → Settings → API Keys → Generate Test Key.

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

---

## 🚢 Deployment on Render

When deploying the Backend on Render, add the following environment variables in your service dashboard under **Environment**:

| Variable | Value |
|---|---|
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Your JWT private key |
| `GOOGLE_CLIENT_ID` | Your Google OAuth client ID |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |
| `RAZORPAY_KEY_ID` | `rzp_test_...` or `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | Your Razorpay key secret |
