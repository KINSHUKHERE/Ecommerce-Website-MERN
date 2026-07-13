const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = require("../db/db");
const Order = require("../models/orderDetails");

async function main() {
  await connectDB();
  try {
    console.log("Cleaning orders...");
    const result = await Order.deleteMany({
      paymentMethod: { $nin: ["COD", "Razorpay"] }
    });
    console.log(`Successfully deleted ${result.deletedCount} orders that were not created by COD or Razorpay.`);
  } catch (err) {
    console.error("Failed to clean orders:", err);
  } finally {
    await mongoose.disconnect();
  }
}

main();
