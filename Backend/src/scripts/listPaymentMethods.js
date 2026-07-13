const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = require("../db/db");
const Order = require("../models/orderDetails");

async function main() {
  await connectDB();
  try {
    const paymentMethods = await Order.distinct("paymentMethod");
    console.log("Distinct payment methods in database:", paymentMethods);

    const countAll = await Order.countDocuments();
    console.log("Total orders in database:", countAll);

    const codOrRazorpayCount = await Order.countDocuments({
      paymentMethod: { $in: ["COD", "Razorpay"] }
    });
    console.log("Orders with paymentMethod COD or Razorpay:", codOrRazorpayCount);
    console.log("Orders to delete:", countAll - codOrRazorpayCount);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

main();
