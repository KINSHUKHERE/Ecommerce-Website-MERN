# Shopora - Modern MERN Stack E-Commerce Platform

Shopora is a premium, responsive E-Commerce web application built using the MERN stack (MongoDB, Express, React, Node.js). The application showcases an aesthetic design featuring a product catalog, dynamic product detailed views, a shopping cart placeholder, and an admin interface to add new products to the MongoDB database.

---

## 🚀 Key Features

*   **Premium UI & UX:** Aesthetic layout featuring modern typography, curated color palettes, interactive hover effects, smooth transitions, and glassmorphism.
*   **Dynamic Product Catalog:** Fetches and displays products dynamically from a MongoDB database with filtering/slicing on the home page.
*   **Detailed Product Views:** Dedicated product detail routes enabling users to read descriptions, review prices, and inspect high-quality product images.
*   **Product Creation Portal:** A dedicated page with validation to dynamically add new products (Image URLs, brands, titles, prices, descriptions) into the inventory database.
*   **Responsive Navigation:** Fully optimized for all screen sizes, including custom mobile toggle navigation drawers.
*   **Seamless Database Connectivity:** Structured backend communicating over REST API to perform CRUD operations on products.

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
│   │   │   └── productsData.js  # Mongoose Schema for Products
│   │   └── app.js               # Express app setups and routes configuration
│   ├── server.js                # Server entry point (configures Port and starts server)
│   ├── package.json             # Backend dependencies & scripts
│   └── .env                     # Local environment configurations (MongoDB URI)
│
├── Frontend/
│   ├── public/                  # Public assets
│   ├── src/
│   │   ├── api/
│   │   │   └── ProductApi.js    # Axios API client functions
│   │   ├── assets/              # App images & icons
│   │   ├── components/          # Modular React components
│   │   │   ├── Navbar.jsx       # Header & Navigation
│   │   │   ├── Footer.jsx       # Footer layout
│   │   │   ├── Hero.jsx         # Landing Hero Section
│   │   │   ├── FeaturedProduct.jsx  # Products Listing Grid
│   │   │   ├── EachProduct.jsx      # Product Card component
│   │   │   ├── ProductDetails.jsx   # Detailed Product Page
│   │   │   ├── CreateProduct.jsx    # Add New Product Form
│   │   │   └── AddToCart.jsx        # Cart Page placeholder
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx    # React Router definitions
│   │   ├── App.jsx              # Main App entry layout
│   │   ├── main.jsx             # React DOM root render
│   │   └── index.css            # Global CSS styles imports
│   ├── package.json             # Frontend dependencies & scripts
│   └── vite.config.js           # Vite server settings
```

---

## 🔌 API Documentation

All API routes communicate with the backend server running by default on `http://localhost:3000`.

### 1. Get All Products
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

### 2. Add a Product
*   **Route:** `POST /product-data-send`
*   **Body Content Type:** `application/json`
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

## ⚙️ Setup & Installation

Follow these steps to set up and run the project locally.

### Prerequisites
*   Node.js (v18+)
*   npm or yarn installed
*   MongoDB Atlas database URL

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
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ecommerce
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

---

## 🖼️ User Interface Preview

*   **Home / Hero Section:** Welcoming header with curated branding.
*   **Featured Grid:** Clean collection cards with brand name, dynamic hover scaling, price displaying in Indian Rupees (₹), and a quick add-to-cart action button.
*   **Product Detail View:** A dedicated details panel showing image details, clean price styling, and item description.
*   **Admin Panel:** Clean input fields with dynamic submit logic redirecting to catalog updates.
