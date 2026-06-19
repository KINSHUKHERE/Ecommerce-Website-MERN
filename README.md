# Shopora - Modern MERN Stack E-Commerce Platform

Shopora is a premium, responsive E-Commerce web application built using the MERN stack (MongoDB, Express, React, Node.js). The application showcases an aesthetic design featuring a product catalog with multi-factor filtering, a database-backed interactive shopping cart, secure user onboarding, administrative panels for inventory management (products, categories, variants), and responsive layouts equipped with modern CSS loaders.

---

## 🚀 Key Features

*   **Premium UI & UX:** Aesthetic layout featuring modern typography, curated color palettes, interactive hover effects, smooth transitions, and glassmorphism.
*   **Dynamic Product Catalog & Filters:** An advanced catalog search interface (`Products.jsx`) allowing users to filter items dynamically by name search, category selectors, and variant/brand sidebar filters.
*   **Cohesive Loading States:** Integrated modern, smooth Tailwind CSS loading spinners across all API-connected pages (catalog, details, cart, categories, variants, contact queries) to prevent the momentary flashing of empty-state placeholders while data is fetched.
*   **Mobile & Desktop Responsiveness:** Tailored layouts optimized for viewports ranging from mobile screens (320px) to wide laptops. Includes center-aligning flex grids for cards on mobile, responsive form grids, and auto-scrolling tables.
*   **Database-Backed Shopping Cart:** A fully operational shopping cart synced with MongoDB. Users can add products to their cart (via catalog card buttons or the product detail page), increase or decrease quantities, and remove items. Changes persist directly to the database.
*   **Real-time Cart Status Badge:** The navigation header displays a real-time badge count of the items currently in the cart. Updates are driven across components using custom event-dispatching listeners (`cartUpdated`).
*   **Category & Variant Management:** A fully integrated inventory management system enabling admins to create, update, and soft-delete product categories and sub-variants/brands directly from dedicated management portals.
*   **User Onboarding & Secure Auth:** Integrated signup and login forms on the client connected to backend APIs. User passwords are securely hashed using `bcryptjs` before database persistence. Supports roles: `user`, `vendor`, and `admin`.
*   **Interactive Contact Queries:** Contact page submissions are captured, saved to MongoDB via a REST API, and displayed in real-time on the Admin dashboard.
*   **Admin Management Dashboard:** Complete statistics panel containing quick cards for Total Products, Users, Orders, Revenue, and Contact Queries. Includes dynamic navbar toggles to switch layouts between customer views and admin dashboard modules.
*   **Order Management System:** Structured tables listing customer order details, product summaries, payment status badges (Paid/Pending), and shipment statuses (Delivered, Processing, Pending).

---

## 🛠️ Technology Stack

### Frontend
*   **React 19 & Vite:** Next-gen, lightning-fast React building tool.
*   **Tailwind CSS v4:** Modern utility-first styling for quick, responsive, and robust CSS development.
*   **React Router DOM v7:** Client-side routing for seamless page navigation.
*   **Axios:** HTTP client for calling backend API endpoints.
*   **Lucide React:** Sleek and lightweight SVG icons.

### Backend
*   **Node.js & Express.js:** Fast, unopinionated, minimalist web framework for building APIs.
*   **Mongoose & MongoDB:** ODM (Object Data Modeling) library for MongoDB database operations.
*   **BcryptJS:** Secure hashing algorithm for user passwords.
*   **Dotenv:** Module to load environment variables from a `.env` file.
*   **Cors:** Middleware to handle Cross-Origin Resource Sharing.
*   **Nodemon:** Auto-restarts the server during development on file changes.

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
│   │   │   └── variantDetails.js # Mongoose Schema for Product Variants
│   │   └── app.js               # Express API routes and application configuration
│   ├── server.js                # Server entry point (configures Port and starts server)
│   ├── package.json             # Backend dependencies & scripts
│   └── .env                     # Local environment configurations (MongoDB URI)
│
├── Frontend/
│   ├── public/                  # Public assets
│   ├── src/
│   │   ├── api/
│   │   │   ├── ProductApi.js    # Product Axios API helper functions
│   │   │   ├── AuthApi.js       # Signup & Login Axios API helpers
│   │   │   ├── ContactApi.js    # Contact Queries Axios API helpers
│   │   │   ├── CartApi.js       # Shopping Cart CRUD Axios API helpers
│   │   │   └── CategoryAndVarientApi.js # Category & Variant Axios API helpers
│   │   ├── assets/              # App images & icons
│   │   ├── components/          # Modular React components
│   │   │   ├── Navbar.jsx       # Header & Navigation (Admin vs Customer, dynamic cart badge)
│   │   │   ├── Footer.jsx       # Footer layout
│   │   │   ├── Hero.jsx         # Landing Hero Section
│   │   │   ├── FeaturedProduct.jsx  # Products Listing Grid (with responsive styling & loaders)
│   │   │   ├── EachProduct.jsx      # Product Card component (interactive add-to-cart action)
│   │   │   ├── ProductDetails.jsx   # Detailed Product Page (integrated with animations & loaders)
│   │   │   ├── AddToCart.jsx        # Shopping Cart view (DB connection & quantity controls)
│   │   │   ├── Products.jsx         # Shop search and filter catalog page layout
│   │   │   └── ScrollToTop.jsx      # Scroll behavior helper
│   │   ├── pages/               # Top-level Page layouts
│   │   │   ├── Login.jsx        # User Login Interface (integrated with AuthApi)
│   │   │   ├── SignUp.jsx       # User Registration Interface (integrated with AuthApi)
│   │   │   └── admin/           # Administrative Panels
│   │   │       ├── AdminDashboard.jsx  # Stats overview cards
│   │   │       ├── ContactDetails.jsx  # Customer enquiries table (integrated with ContactApi)
│   │   │       ├── OrderDetails.jsx    # Order management and tracking table
│   │   │       ├── CreateProduct.jsx   # Add New Product Form (referencing categories & variants)
│   │   │       ├── CategoryManagement.jsx # Category CRUD interface with loaders
│   │   │       └── VariantManagement.jsx # Variant/Brand CRUD interface with loaders
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx    # React Router definitions (Client & Admin routes)
│   │   ├── App.jsx              # Main App entry layout
│   │   ├── main.jsx             # React DOM root render
│   │   └── index.css            # Global CSS styles imports
│   ├── package.json             # Frontend dependencies & scripts
│   └── vite.config.js           # Vite server settings
```

---

## 🔌 API Documentation

All API routes communicate with the backend server running by default on `http://localhost:3000`.

### 🛍️ Product Endpoints

#### 1. Get All Products
*   **Route:** `GET /get-product-data`
*   **Response:**
    ```json
    {
      "msg": "Data fetched",
      "data": [
        {
          "_id": "673f4e3c988a2c...",
          "imgUrl": "https://example.com/nike.jpg",
          "heading": "Air Zoom Pegasus",
          "price": 8999,
          "description": "High-performance running shoes.",
          "categoryId": { "_id": "...", "name": "Footwear" },
          "variantId": { "_id": "...", "name": "Nike" }
        }
      ]
    }
    ```

#### 2. Add a Product
*   **Route:** `POST /product-data-send`
*   **Payload Schema:**
    ```json
    {
      "imgUrl": "https://example.com/nike.jpg",
      "categoryId": "675f1a23...",
      "variantId": "675f1b58...",
      "heading": "Air Zoom Pegasus",
      "price": 8999,
      "description": "High-performance running shoes."
    }
    ```

---

### 🔑 Authentication Endpoints

#### 1. User Signup
*   **Route:** `POST /signup`
*   **Payload Schema:**
    ```json
    {
      "name": "John Doe",
      "role": "user",
      "phoneNumber": "9876543210",
      "email": "johndoe@example.com",
      "password": "mySecurePassword"
    }
    ```

#### 2. User Login
*   **Route:** `POST /login`
*   **Payload Schema:**
    ```json
    {
      "email": "johndoe@example.com",
      "password": "mySecurePassword"
    }
    ```

---

### 🏷️ Category & Variant Endpoints

#### 1. Category Operations
*   `POST /add-category` — Payload: `{ "name": "Footwear" }`
*   `GET /get-categories` — Returns active categories list.
*   `PUT /update-category/:id` — Payload: `{ "name": "Updated Category" }`
*   `DELETE /delete-category/:id` — Soft-deletes a category.
*   `PUT /toggle-category-status/:id` — Toggles active state.

#### 2. Variant Operations
*   `POST /add-variant` — Payload: `{ "name": "Nike", "categoryId": "..." }`
*   `GET /get-variants` — Retrieves all variants.
*   `GET /get-variants/:categoryId` — Retrieves variants inside a category.
*   `PUT /update-variant/:id` — Payload: `{ "name": "Adidas" }`
*   `DELETE /delete-variant/:id` — Soft-deletes a variant.

---

### 🛒 Shopping Cart Endpoints

#### 1. Add / Sync Item to Cart
*   **Route:** `POST /add-items-cart`
*   **Payload Schema:** `{ "userId": "...", "productId": "...", "quantity": 1 }`

#### 2. Get Cart Items
*   **Route:** `GET /get-items-cart/:userId`

#### 3. Adjust Cart Quantity
*   `PUT /increase-cart/:cartId` — Increments quantity by 1.
*   `PUT /decrease-cart/:cartId` — Decrements quantity by 1.
*   `DELETE /delete-cart/:cartId` — Removes product from cart.

---

## ⚙️ Setup & Installation

Follow these steps to set up and run the project locally.

### Prerequisites
*   Node.js (v18+)
*   npm or yarn installed
*   MongoDB Atlas database URL or local MongoDB server

### 1. Clone the repository
```bash
git clone https://github.com/KINSHUKHERE/Ecommerce-Website-MERN.git
cd Ecommerce-Website-MERN
```

### 2. Configure the Backend
Navigate to the `Backend` directory:
```bash
cd Backend
```

Create a `.env` file in the root of the `Backend` directory and define your MongoDB URI connection string:
```env
MONGO_URI=mongodb://localhost:27017/Ecommerce
```

Install backend dependencies:
```bash
npm install
```

Start the Backend server:
```bash
npm start
```
The server will boot up at `http://localhost:3000`.

### 3. Configure the Frontend
Open a new terminal session and navigate to the `Frontend` directory:
```bash
cd Frontend
```

Install frontend dependencies:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```
The client application will start running, usually at `http://localhost:5173`.
