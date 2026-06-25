const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const variantRoutes = require("./routes/variantRoutes");
const cartRoutes = require("./routes/cartRoutes");
const contactRoutes = require("./routes/contactRoutes");
const orderRoutes = require("./routes/orderRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

const allowedOrigins = [
   process.env.FRONTEND_URL, 
   "http://localhost:5173"
];

app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json());

app.use("/", authRoutes);
app.use("/", productRoutes);
app.use("/", categoryRoutes);
app.use("/", variantRoutes);
app.use("/", cartRoutes);
app.use("/", contactRoutes);
app.use("/", orderRoutes);
app.use("/", uploadRoutes);

module.exports = app;
