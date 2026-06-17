# Shopora - Modern MERN Stack E-Commerce Platform

Shopora is a premium, responsive E-Commerce web application built using the MERN stack (MongoDB, Express, React, Node.js). The application showcases an aesthetic design featuring a product catalog, dynamic product detailed views, an interactive shopping cart, secure user authentication (with hashed passwords), and a fully featured admin management dashboard connected to a backend MongoDB database.

---

## 🚀 Key Features

*   **Premium UI & UX:** Aesthetic layout featuring modern typography, curated color palettes, interactive hover effects, smooth transitions, and glassmorphism.
*   **Dynamic Product Catalog:** Fetches and displays products dynamically from a MongoDB database with filtering/slicing on the home page.
*   **Detailed Product Views:** Dedicated product detail routes enabling users to read descriptions, review prices, and inspect high-quality product images.
*   **Interactive Shopping Cart:** Full-featured cart drawer (`AddToCart.jsx`) allowing users to increase/decrease item quantities, remove items dynamically, and view real-time subtotal calculations.
*   **User Onboarding & Secure Auth:** Integrated signup and login forms on the client connected to backend APIs. User passwords are securely hashed using `bcryptjs` before database persistence. Supports roles: `user`, `vendor`, and `admin`.
*   **Interactive Contact Queries:** Contact page submissions are captured, saved to MongoDB via a REST API, and displayed in real-time on the Admin dashboard.
*   **Admin Management Dashboard:** Complete statistics panel containing quick cards for Total Products, Users, Orders, Revenue, and Contact Queries. Includes dynamic navbar toggles to switch layouts between customer views and admin dashboard modules.
*   **Order Management System:** Structured tables listing customer order details, product summaries, payment status badges (Paid/Pending), and shipment statuses (Delivered, Processing, Pending).
*   **Responsive Navigation:** Fully optimized for all screen sizes, including custom mobile toggle navigation drawers.

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
│   │   │   ├── productsData.js  # Mongoose Schema for Products
│   │   │   ├── authDetails.js   # Mongoose Schema for Users (roles, hashed passwords)
│   │   │   └── contactDetails.js # Mongoose Schema for Customer Queries
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
│   │   │   └── ContactApi.js    # Contact Queries Axios API helpers
│   │   ├── assets/              # App images & icons
│   │   ├── components/          # Modular React components
│   │   │   ├── Navbar.jsx       # Header & Navigation (Admin vs Customer layout toggling)
│   │   │   ├── Footer.jsx       # Footer layout
│   │   │   ├── Hero.jsx         # Landing Hero Section
│   │   │   ├── FeaturedProduct.jsx  # Products Listing Grid
│   │   │   ├── EachProduct.jsx      # Product Card component
│   │   │   ├── ProductDetails.jsx   # Detailed Product Page
│   │   │   ├── CreateProduct.jsx    # Add New Product Form
│   │   │   ├── AddToCart.jsx        # Shopping Cart layout & quantity controls
│   │   │   └── ScrollToTop.jsx      # Scroll behavior helper
│   │   ├── pages/               # Top-level Page layouts
│   │   │   ├── Login.jsx        # User Login Interface (integrated with AuthApi)
│   │   │   ├── SignUp.jsx       # User Registration Interface (integrated with AuthApi)
│   │   │   └── admin/           # Administrative Panels
│   │   │       ├── AdminDashboard.jsx  # Stats overview cards
│   │   │       ├── ContactDetails.jsx  # Customer enquiries table (integrated with ContactApi)
│   │   │       └── OrderDetails.jsx    # Order management and tracking table
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
          "brandName": "Nike",
          "heading": "Air Zoom Pegasus",
          "price": 8999,
          "description": "High-performance running shoes."
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
      "brandName": "Nike",
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
*   **Response:**
    ```json
    {
      "msg": "Login successful",
      "user": {
        "_id": "673f4a3e811c...",
        "name": "John Doe",
        "email": "johndoe@example.com",
        "role": "user"
      }
    }
    ```

#### 3. Get All Users
*   **Route:** `GET /all-users`
*   **Response:** Array of all registered user documents.

---

### 📞 Contact Endpoints

#### 1. Submit Query
*   **Route:** `POST /post-contactdetails`
*   **Payload Schema:**
    ```json
    {
      "Name": "Jane Doe",
      "Email": "janedoe@example.com",
      "Message": "I have an issue with my shipment."
    }
    ```

#### 2. Get All Queries
*   **Route:** `GET /get-contactdetails`
*   **Response:**
    ```json
    {
      "msg": "Contact Details fetched",
      "contacts": [
        {
          "_id": "674f1b2c...",
          "Name": "Jane Doe",
          "Email": "janedoe@example.com",
          "Message": "I have an issue with my shipment.",
          "createdAt": "2026-06-17T10:00:00.000Z"
        }
      ]
    }
    ```

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
