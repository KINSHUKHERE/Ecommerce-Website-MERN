# Veltiq - Modern MERN Stack E-Commerce Platform

Veltiq is a premium, fully responsive e-commerce web application built using the MERN stack (MongoDB, Express, React, Node.js). The platform is architected with a strict separation between the client-facing store and a dedicated administrative dashboard, secured with modern JSON Web Token (JWT) authorization controls.

---

## 📂 Project Structure

```text
├── Backend/
│   ├── src/
│   │   ├── db/
│   │   │   └── db.js            # MongoDB database connection logic (consolidated to MongoDB Atlas)
│   │   ├── models/
│   │   │   ├── productsData.js  # Mongoose Schema for Products (referenced Category & Variant)
│   │   │   ├── authDetails.js   # Mongoose Schema for Users (roles, hashed passwords, provider, profile status)
│   │   │   ├── contactDetails.js # Mongoose Schema for Customer Queries
│   │   │   ├── cartDetails.js   # Mongoose Schema for Shopping Cart items
│   │   │   ├── categoryDetails.js # Mongoose Schema for Product Categories
│   │   │   ├── variantDetails.js # Mongoose Schema for Product Variants
│   │   │   └── orderDetails.js  # Mongoose Schema for Orders (items, shipping addresses, statuses)
│   │   ├── controllers/
│   │   │   ├── authController.js # Signup, Login, Google OAuth, Profile Completion & Settings handlers
│   │   │   ├── productController.js # Product CRUD controllers
│   │   │   ├── categoryController.js # Category CRUD controllers
│   │   │   ├── variantController.js # Variant/Brand CRUD controllers
│   │   │   ├── cartController.js # Cart CRUD controllers
│   │   │   ├── contactController.js # Customer enquiries handlers
│   │   │   └── orderController.js # Order placement, clearing cart, retrieving transaction histories
│   │   ├── middleware/
│   │   │   ├── verifyUser.js     # Validates HTTP-Only cookie / Bearer JWT to authorize active users
│   │   │   └── verifyAdmin.js    # Validates active user's payload has 'admin' privileges
│   │   ├── routes/
│   │   │   ├── authRoutes.js     # /signup, /login, /google, /complete-profile, /update-profile
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
│   │   │   ├── AuthApi.js       # Signup, Login, OAuth, & Profile settings Axios API helpers
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
│   │   │       ├── ProductEdit.jsx # Product editor with real-time Image URL validation preview
│   │   │       └── OrderDetails.jsx # Admin orders audit panel with status update selectors
│   │   ├── components/          # Reusable UI layout elements
│   │   │   ├── Navbar.jsx       # Header & Navigation (Customer cart badge & dynamic updating)
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
│   │   │   ├── Cart.jsx         # Space-efficient responsive shopping cart dashboard page
│   │   │   ├── Checkout.jsx     # Modern Apple/Stripe-style 2-page checkout wizard with security checks
│   │   │   ├── Products.jsx     # Customer products registry catalog search & filter page
│   │   │   ├── ProductDetails.jsx # Customer product details page
│   │   │   ├── Login.jsx        # User Login Interface with password toggles
│   │   │   ├── SignUp.jsx       # User Registration Interface with password toggles
│   │   │   ├── CompleteProfile.jsx # Google OAuth Profile completion wizard (no navbar)
│   │   │   └── Profile.jsx      # Customer profile settings & dynamic orders tab list panel
│   │   │   └── admin/           # Admin Category/Variant/Order panels
│   │   │       ├── AdminDashboard.jsx  # Stats overview cards
│   │   │       ├── ContactDetails.jsx  # Customer enquiries table
│   │   │       ├── CreateProduct.jsx   # Add New Product Form (referencing categories & variants)
│   │   │       ├── CategoryManagement.jsx # Category CRUD interface with loaders
│   │   │       └── VariantManagement.jsx # Variant/Brand CRUD interface with loaders
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx    # React Router definitions & session JWT validity checkers
│   │   ├── App.jsx              # Main App entry layout
│   │   ├── main.jsx             # React DOM root render
│   │   └── index.css            # Global CSS styles with Tailwind v4 theme variables
│   ├── package.json             # Frontend dependencies & scripts
│   └── vite.config.js           # Vite server settings
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

---

## 🔐 Security & Identity Infrastructure

Veltiq implements a strict, enterprise-ready identity architecture protecting user privacy and preventing unauthorized backend changes:

### 1. Unified Google OAuth & Local Authentication
- **Google OAuth Integration**: Users can authenticate seamlessly using Google Login on both `/login` and `/register` interfaces (button text customized dynamically for signup/signin context).
- **Profile Completion Wizard (`/complete-profile`)**: Newly registered Google accounts (created with `provider: "google"` and `isProfileComplete: false` values) are forced into a dedicated, navbar-free setup wizard.
  - Requires setting a **Phone Number**.
  - Allows optionally setting a **Password** to establish local email/password credentials, giving the account hybrid authentication capabilities.
  - Allows users to defer setup via a **Setup Later** button (uses `sessionStorage` session caching to temporarily bypass checks for the active tab session).
  - Validation guards disable completion buttons unless input is sufficient (phone number >= 10 digits; password >= 6 characters and matching).

### 2. JWT & Parameter Isolation
- **Secure Token Verification**: Replaced insecure client-side parameter passing with a JWT authentication system. Tokens are set in HTTP-Only cookies (or Bearer Authorization Headers for cross-origin environments) and verified in the backend via a `verifyUser` middleware.
- **Role-Based Access Control**: An additional `verifyAdmin` middleware acts as an administrative route guard, authorizing product modifications, orders updates, and category/variant settings only to users with the `"admin"` role.
- **Profile Security Panel**: The user's settings profile (`Profile.jsx`) hides password configuration behind an **Account Security** card showing `Password: Not Set` for OAuth users. Clicking `[ Set Password ]` opens input fields to set local credentials. User phone numbers can also be updated directly in the profile settings.
- **Secure Checkout Enforcements**: Customers are blocked from completing orders unless a phone number and local password are set. Missing details prompt the user and redirect them directly to `/profile` for setup.
- **Dynamic Password Toggle Toggles**: Integrated `Eye` and `EyeOff` show/hide toggles on every password field in the application (Login, SignUp, Complete Profile, and Profile Settings).
- **Real-Time Password Confirmation Feedback**: Form inputs render real-time verification status helper texts ("✓ Passwords match" or "❌ Passwords do not match") dynamically as the user types.

---

## 🛠️ Technology Stack

*   **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide React, Axios, React Router DOM v7, Google OAuth Library
*   **Backend:** Node.js, Express.js, MongoDB (Atlas), Mongoose ODM, BcryptJS, JSONWebToken, Cookie-Parser, Cors
*   **Database Cloud:** Consolidated connections to a single MongoDB Atlas instance for synchronized local/deployed servers.

---

## 🔌 API Endpoints Summary

### 🔑 Authentication & Profile settings
*   `POST /signup` — Registers a new local user with a hashed password (sets `isProfileComplete: true`).
*   `POST /login` — Authenticates credentials, sets cookie, and returns JWT.
*   `POST /google` — Authenticates Google tokens, creates accounts with default incomplete flags if new, and sets JWT.
*   `GET /user-profile` — Retrieves the current authenticated user's details (returns `hasPassword` and excludes password hashes).
*   `PUT /update-profile` — Updates authenticated profile settings (supports changing `name`, `phoneNumber`, `password`).
*   `PUT /complete-profile` — Completes profile wizard setup (updates phone number, hashes optional password, and sets `isProfileComplete: true`).
*   `POST /logout` — Clears JWT tokens from cookies.
*   `GET /all-users` — Audits registered accounts (Admin-only).

### 🛍️ Products
*   `GET /get-product-data` — Fetches all catalog products.
*   `POST /product-data-send` — Adds a new product (Admin-only).
*   `PATCH /product-update/:id` — Updates product fields (Admin-only).
*   `DELETE /product-delete/:id` — Deletes a product (Admin-only).

### 🏷️ Categories & Variants
*   `POST /add-category` — Creates a category (Admin-only).
*   `GET /get-categories` — Fetches categories list.
*   `PUT /update-category/:id` — Modifies a category (Admin-only).
*   `DELETE /delete-category/:id` — Soft-deletes a category (Admin-only).
*   `POST /add-variant` — Creates a brand variant (Admin-only).
*   `GET /get-variants` — Fetches all brand variants.

### 🛒 Shopping Cart (Scoped to authenticated JWT user)
*   `POST /add-items-cart` — Syncs item additions.
*   `GET /get-items-cart` — Retrieves cart items for active user.
*   `PUT /increase-cart/:cartId` — Increments quantity.
*   `PUT /decrease-cart/:cartId` — Decrements quantity.
*   `DELETE /delete-cart/:cartId` — Removes item from cart.

### 💳 Orders & Checkout
*   `POST /orders` — Places a new order (clears active cart items automatically).
*   `GET /orders` — Retrieves all orders (Admin-only audit log).
*   `GET /orders/user` — Retrieves order transaction history for the active customer profile.
*   `PUT /orders/:orderId` — Updates order shipment status (Admin-only).

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
MONGO_URI=mongodb+srv://admin:ShoperaAdmin@cluster0.v9dftns.mongodb.net/Ecommerce
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
Open a new terminal window, navigate to the `Frontend` directory, and install dependencies:
```bash
cd Frontend
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
