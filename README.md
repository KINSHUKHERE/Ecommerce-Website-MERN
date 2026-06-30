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
│   │   │   └── orderDetails.js  # Mongoose Schema for Orders (items, shipping addresses, statuses)
│   │   ├── controllers/
│   │   │   ├── authController.js # Auth, Google OAuth, Profile Completion & Directory audits
│   │   │   ├── productController.js # Product CRUD controllers (with populated vendor data)
│   │   │   ├── categoryController.js # Category CRUD controllers
│   │   │   ├── brandController.js # Brand CRUD controllers
│   │   │   ├── cartController.js # Cart CRUD controllers
│   │   │   ├── contactController.js # Customer enquiries handlers
│   │   │   └── orderController.js # Order checkout & status update workflows
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
│   │   │   └── OrderApi.js      # Order checkout and status Axios API helpers
│   │   ├── assets/              # App images & icons
│   │   ├── admin/               # Dedicated Admin Dashboard pages & components
│   │   │   ├── components/
│   │   │   │   ├── AdminLayout.jsx # Glassmorphic Admin Header and main content layout wrapper
│   │   │   │   ├── AdminSidebar.jsx # Vertical navigation sidebar with active routing states
│   │   │   │   └── ProductStats.jsx # Stats cards computing Total, Active, Low Stock, Sold counts
│   │   │   └── pages/
│   │   │       ├── AdminProducts.jsx # Soft UI All Products registry with custom filters
│   │   │       ├── ProductView.jsx # Detailed single product record viewer
│   │   │       ├── ProductEdit.jsx # Product editor with real-time Image URL validation preview
│   │   │       └── OrderDetails.jsx # Admin orders audit panel with status update selectors
│   │   ├── components/          # Reusable UI layout elements
│   │   │   ├── Navbar.jsx       # Header & Navigation (Become a Seller link, cart count badge)
│   │   │   ├── Footer.jsx       # Footer layout
│   │   │   ├── Hero.jsx         # Landing Hero Section
│   │   │   ├── FeaturedProduct.jsx # Featured product grid with skeleton loader states
│   │   │   ├── EachProduct.jsx  # Individual product catalog card
│   │   │   ├── ScrollToTop.jsx  # Window viewport routing scroll resetter
│   │   │   └── DynamicTitle.jsx # Browser title route-change dynamic synchronizer
│   │   ├── pages/               # Top-level Page layouts
│   │   │   ├── Home.jsx         # Customer home page view
│   │   │   ├── About.jsx        # About page view
│   │   │   ├── Contact.jsx      # Contact page view
│   │   │   ├── Cart.jsx         # Responsive shopping cart dashboard page
│   │   │   ├── Checkout.jsx     # Stripe-style checkout wizard with security checks
│   │   │   ├── Products.jsx     # Customer products registry catalog search & filter page
│   │   │   ├── ProductDetails.jsx # Customer product details page (with Seller Card & swatch options)
│   │   │   ├── Login.jsx        # User Login Interface
│   │   │   ├── SignUp.jsx       # User Registration Interface (pre-selects Vendor role)
│   │   │   ├── CompleteProfile.jsx # Google OAuth Profile completion wizard (no navbar)
│   │   │   ├── Profile.jsx      # Customer profile settings & dynamic orders tab list panel
│   │   │   └── admin/           # Admin Category/Brand/Order panels
│   │   │       ├── AdminDashboard.jsx  # Stats overview cards
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

### 🏪 Vendor Panel
*   **Become a Seller Application:** Guests can apply as a Vendor, inputting a business name, phone number, GSTIN number, and store address. Upon approval by the Admin, they gain access to dashboard upload controls.
*   **Catalog Upload:** Vendors can configure products, add variant stock levels, set variant pricing details, upload photos, and track orders containing their products.

### 🛡️ Super Admin Control Panel
*   **Dashboard Stats Grid:** Visual statistics overview showcasing user metrics, pending vendor applications, product catalog status, and queries.
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

## 🔐 Security & Identity Infrastructure
*   **Unified Google OAuth & Local Login:** Integrates OAuth sign-ins. Newly registered Google accounts are routed to `/complete-profile` to finalize credentials.
*   **JWT Cookie-Based Authorization:** Validates user payloads using HTTP-Only cookies. Administrative and vendor controls are guarded by strict role middlewares.
*   **Stock Management:** Checkout automatically decrements quantities of ordered product variants and updates product statuses.

---

## 🛠️ Technology Stack
*   **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide React, Axios, React Router DOM v7, Google OAuth Library
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
