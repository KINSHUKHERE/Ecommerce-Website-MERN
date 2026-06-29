const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const brandRoutes = require("./routes/brandRoutes");
const cartRoutes = require("./routes/cartRoutes");
const contactRoutes = require("./routes/contactRoutes");
const orderRoutes = require("./routes/orderRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const addressRoutes = require("./routes/addressRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");

const app = express();

const allowedOrigins = [
  "https://yocart.onrender.com",
  "https://ecommerce-website-mern-1-luv9.onrender.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174/",
  "http://localhost",
  "https://localhost",
  "capacitor://localhost",
];

app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      // Check if origin is localhost (e.g., http://localhost:5174, capacitor://localhost, etc.)
      const isLocalhost =
        origin.startsWith("http://localhost:") ||
        origin.startsWith("https://localhost:") ||
        origin === "http://localhost" ||
        origin === "https://localhost" ||
        origin.startsWith("capacitor://localhost");

      if (isLocalhost || allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }

      const msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

app.use("/", authRoutes);
app.use("/", productRoutes);
app.use("/", categoryRoutes);
app.use("/", brandRoutes);
app.use("/", cartRoutes);
app.use("/", contactRoutes);
app.use("/", orderRoutes);
app.use("/", uploadRoutes);
app.use("/", addressRoutes);
app.use("/", wishlistRoutes);

module.exports = app;
