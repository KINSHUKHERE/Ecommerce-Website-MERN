# Veltiq - Modern MERN Stack E-Commerce Platform

Veltiq is a premium, fully responsive e-commerce web application built using the MERN stack (MongoDB, Express, React, Node.js). The platform is architected with a strict separation between the client-facing store and a dedicated administrative dashboard.

---

## 📂 Project Structure

```text
├── Backend/
│   ├── src/
│   │   ├── db/
│   │   │   └── db.js            # MongoDB database connection logic
│   │   ├── models/
│   │   │   ├── productsData.js  # Mongoose Schema for Products (referenced Category & Variant)
│   │   │   ├── authDetails.js   # Mongoose Schema for Users (roles, hashed passwords)
│   │   │   ├── contactDetails.js # Mongoose Schema for Customer Queries
│   │   │   ├── cartDetails.js   # Mongoose Schema for Shopping Cart items
│   │   │   ├── categoryDetails.js # Mongoose Schema for Product Categories
│   │   │   ├── variantDetails.js # Mongoose Schema for Product Variants
│   │   │   └── orderDetails.js  # Mongoose Schema for Orders (items, shipping addresses, statuses)
│   │   ├── controllers/
│   │   │   ├── authController.js # Signup, Login, and User management handlers
│   │   │   ├── productController.js # Product CRUD controllers
│   │   │   ├── categoryController.js # Category CRUD controllers
│   │   │   ├── variantController.js # Variant/Brand CRUD controllers
│   │   │   ├── cartController.js # Cart CRUD controllers
│   │   │   ├── contactController.js # Customer enquiries handlers
│   │   │   └── orderController.js # Order placement, clearing cart, retrieving transaction histories
│   │   ├── routes/
│   │   │   ├── authRoutes.js     # /signup, /login endpoints
│   │   │   ├── productRoutes.js  # /get-product-data, /product-data-send endpoints
│   │   │   ├── categoryRoutes.js # /add-category, /get-categories endpoints
│   │   │   ├── variantRoutes.js  # /add-variant, /get-variants endpoints
│   │   │   ├── cartRoutes.js     # /add-items-cart, /get-items-cart endpoints
│   │   │   ├── contactRoutes.js  # /contact-send, /get-contact endpoints
│   │   │   └── orderRoutes.js    # /orders endpoints (checkout, status transitions)
│   │   └── app.js               # Express API routes and application configuration
│   ├── server.js                # Server entry point (configures Port and starts server)
│   └── package.json             # Backend dependencies & scripts
│
├── Frontend/
│   ├── public/                  # Public assets
│   ├── src/
│   │   ├── api/
│   │   │   ├── ProductApi.js    # Product Axios API helper functions
│   │   │   ├── AuthApi.js       # Signup & Login Axios API helpers
│   │   │   ├── ContactApi.js    # Contact Queries Axios API helpers
│   │   │   ├── CartApi.js       # Shopping Cart CRUD Axios API helpers
│   │   │   ├── CategoryAndVarientApi.js # Category & Variant Axios API helpers
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
58: │   │   │       ├── ProductEdit.jsx # Product editor with real-time Image URL validation preview
59: │   │   │       └── OrderDetails.jsx # Admin orders audit panel with status update selectors
60: │   │   ├── components/          # Reusable UI layout elements
61: │   │   │   ├── Navbar.jsx       # Header & Navigation (Customer cart badge & dynamic updating)
62: │   │   │   ├── Footer.jsx       # Footer layout
63: │   │   │   ├── Hero.jsx         # Landing Hero Section
64: │   │   │   ├── FeaturedProduct.jsx # Featured product grid with skeleton loader states
65: │   │   │   ├── EachProduct.jsx  # Individual product catalog card
66: │   │   │   └── ScrollToTop.jsx  # Window viewport routing scroll resetter
67: │   │   ├── pages/               # Top-level Page layouts
68: │   │   │   ├── Home.jsx         # Customer home page view
69: │   │   │   ├── About.jsx        # About page view
70: │   │   │   ├── Contact.jsx      # Contact page view
71: │   │   │   ├── Cart.jsx         # Space-efficient responsive shopping cart dashboard page
72: │   │   │   ├── Checkout.jsx     # Modern Apple/Stripe-style 2-page checkout wizard
73: │   │   │   ├── Products.jsx     # Customer products registry catalog search & filter page
74: │   │   │   ├── ProductDetails.jsx # Customer product details page
75: │   │   │   ├── Login.jsx        # User Login Interface (integrated with AuthApi)
76: │   │   │   ├── SignUp.jsx       # User Registration Interface (integrated with AuthApi)
77: │   │   │   └── Profile.jsx      # Customer profile settings & dynamic orders tab list panel
78: │   │   │   └── admin/           # Admin Category/Variant/Order panels
79: │   │   │       ├── AdminDashboard.jsx  # Stats overview cards
80: │   │   │       ├── ContactDetails.jsx  # Customer enquiries table
81: │   │   │       ├── CreateProduct.jsx   # Add New Product Form (referencing categories & variants)
82: │   │   │       ├── CategoryManagement.jsx # Category CRUD interface with loaders
83: │   │   │       └── VariantManagement.jsx # Variant/Brand CRUD interface with loaders
84: │   │   ├── routes/
85: │   │   │   └── AppRoutes.jsx    # React Router definitions (UserLayout vs AdminLayout separation)
86: │   │   ├── App.jsx              # Main App entry layout
87: │   │   ├── main.jsx             # React DOM root render
88: │   │   └── index.css            # Global CSS styles with Tailwind v4 theme variables
89: │   ├── package.json             # Frontend dependencies & scripts
90: │   └── vite.config.js           # Vite server settings
```

---

## 🚀 Key Features

### 🛍️ Client / Customer Panel
*   **Home Landing Hub:** Welcoming landing page featuring visual Hero sections, promotional advertisement banners, featured products grid, and standard links.
*   **Searchable Product Catalog:** Advanced product list (`Products.jsx`) with text search (matches title, category, brand) and category/brand filters. Incorporates clean skeleton loaders and infinite scrolling via `IntersectionObserver`.
*   **Product Details Viewer:** Dedicated page to inspect product descriptions, stock levels, pricing details, and add items to the cart.
*   **Space-Efficient Responsive Cart:** Clean, mobile-friendly cart layout (`Cart.jsx`) that aligns items horizontally on desktop to utilize full width, stacks cleanly on mobile, updates quantities in real-time, and integrates a mobile sticky bottom checkout bar.
*   **Dynamic Cart Count Badge:** Updates cart counts instantly across the header using custom event-driven listeners (`cartUpdated`).
*   **Apple/Stripe-Style 2-Page Checkout Wizard:** A distraction-free checkout flow (`Checkout.jsx`) featuring:
    *   *Page 1 (Delivery destination)*: Verified user credentials check and editable shipping recipient forms (Name, Mobile, Street, City, State, PIN).
    *   *Page 2 (Secure Payment Options)*: Interactive method choices (Instant UPI app list or custom VPA, Credit/Debit card validation fields, and Cash on Delivery) with bank-grade security guarantees and secure transaction simulators.
    *   *Success screen*: Check animations, generated transaction ID (`TXN_...`), order reference hashes, and direct navigation routes.
*   **Tabbed Customer Profile Tracking:** A clean settings layout (`Profile.jsx`) refactored into tabs (Account Settings / My Orders) to dynamically list detailed purchase cards with receipt details, tracking references, and active shipping milestones.

### 📊 Admin Panel Dashboard
*   **Layout Isolation (`AdminLayout`):** Strictly separated from the store interface. Hides the customer navigation header, rendering a glassmorphic top header and a fixed vertical navigation sidebar (Dashboard, Products, Categories, Variants, Orders, Contact Queries, Logout).
*   **Products Catalog Control (`/admin/products`):** Soft UI tabular grid displaying product summaries, categories, variants, pricing, stock levels, status tags, and action buttons. Renders as a spacious 1-column list on mobile screens.
*   **Custom Select Dropdowns:** Custom React-based selectors (`SoftDropdown`) providing clean overlays, hover animations, and height alignment.
*   **Dynamic Stats Counters:** Live stats computing Total Products, Active Products, Low Stock Products, and Out of Stock (Sold) Products from the database.
*   **Load More Pagination:** Interactive scroll footer paging replacing native page numbers.
*   **Timestamps & Description Viewer:** Detailed product view route (`/admin/products/:productId`) rendering creation/update timestamps.
*   **Image URL Validation Editor:** Form-editor route (`/admin/products/edit/:productId`) containing live image preview boxes to inspect URLs for broken links.
*   **Safe Deletion Dialog:** Confirmation overlay modal preventing accidental deletions.
*   **Category & Variant CRUD Ports:** Dedicated interfaces to manage, update, and soft-delete store categories and variant brands.
*   **Orders Lifecycle Audits (`OrderDetails.jsx`):** Database-backed audit panel listing all customer transactions, items, amounts, and dates, with inline status selectors (Processing, Shipped, Delivered, Cancelled) that update MongoDB.

### 🛡️ Core Infrastructure & Design System
*   **Route Guards:** Custom middleware wrappers (`ProtectedRoute`, `AdminRoute`, `GuestRoute`) securing navigation.
*   **Password Hashing:** Hashes credentials using `bcryptjs` on backend signup prior to database entry.
*   **CSS Variable Design System (Tailwind CSS v4 `@theme`):** Unified visual language inside `index.css` configuring:
    *   *Calm Neutral Grays*: Zinc and slate grays replacing harsh pitch black outlines.
    *   *Typography Hierarchy*: Letter-tracking adjustments and font-weights (`font-semibold` headers, `font-medium` labels) for a premium, editorial design.
    *   *Spacing Grid*: Standardized 8px padding/margin boundaries (`p-1` through `p-8` scales) to ensure layout consistency.
    *   *Tactile Focus Rings*: Anti-glitch specific transitions and custom accessibility rings.

---

## 🛠️ Technology Stack

*   **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide React, Axios, React Router DOM v7
*   **Backend:** Node.js, Express.js, MongoDB, Mongoose ODM, BcryptJS, Dotenv, Cors, Nodemon

---

## 🔌 API Endpoints Summary

All routes communicate with the backend server running by default on `http://localhost:3000`.

### 🛍️ Products
*   `GET /get-product-data` — Fetches all products (populates categories and variants).
*   `POST /product-data-send` — Adds a new product.
*   `PATCH /product-update/:id` — Updates existing product attributes.
*   `DELETE /product-delete/:id` — Deletes a product from the database.

### 🔑 Authentication
*   `POST /signup` — Registers a new user with a hashed password.
*   `POST /login` — Authenticates credentials and returns user details.
*   `GET /all-users` — Fetches registered accounts (for administrators).

### 🏷️ Categories & Variants
*   `POST /add-category` — Creates a product category.
*   `GET /get-categories` — Fetches categories.
*   `PUT /update-category/:id` — Modifies a category.
*   `DELETE /delete-category/:id` — Soft-deletes a category.
*   `POST /add-variant` — Creates a brand variant.
*   `GET /get-variants` — Fetches all variants.
*   `GET /get-variants/:categoryId` — Fetches variants belonging to a specific category.

### 🛒 Shopping Cart
*   `POST /add-items-cart` — Syncs item additions.
*   `GET /get-items-cart/:userId` — Retrieves cart items.
*   `PUT /increase-cart/:cartId` — Increments quantity.
*   `PUT /decrease-cart/:cartId` — Decrements quantity.
*   `DELETE /delete-cart/:cartId` — Removes item from cart.

### 💳 Orders & Checkout
*   `POST /orders` — Creates a new order (clears active cart items automatically).
*   `GET /orders` — Retrieves all orders (Admin panel audit log).
*   `GET /orders/user/:userId` — Retrieves order transaction history for a specific customer profile.
*   `PUT /orders/:orderId` — Updates the order shipment status (Processing, Shipped, Delivered, Cancelled).

---

## ⚙️ Setup & Installation

### 1. Clone the codebase
```bash
git clone https://github.com/KINSHUKHERE/Ecommerce-Website-MERN.git
cd Ecommerce-Website-MERN
```

### 2. Configure the Backend
Navigate to the `Backend` directory and install dependencies:
```bash
cd Backend
npm install
```
Create a `.env` file in the root of the `Backend/` folder:
```env
MONGO_URI=mongodb://localhost:27017/Ecommerce
```
Start the backend server:
```bash
npm start
```
The server will run on `http://localhost:3000`.

### 3. Configure the Frontend
Open a new terminal window, navigate to the `Frontend` directory, and install dependencies:
```bash
cd Frontend
npm install
```
Start the Vite development server:
```bash
npm run dev
```
The application will start running on `http://localhost:5173`.
