const mongoose = require("mongoose");

async function connectDB() {
  if (!process.env.MONGO_URI) {
    console.error("MongoDB Connection Error: process.env.MONGO_URI is not defined in your environment variables!");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Successfully connected to MongoDB database.");
  } catch (err) {
    console.error("MongoDB Connection Failed! Please check your network connectivity, database credentials, or IP whitelist rules.");
    console.error("Error Message:", err.message);
    if (err.name === "MongooseServerSelectionError") {
      console.error("Reason: Server selection timed out. This usually means MongoDB Atlas is blocking your current IP address. Make sure IP 0.0.0.0/0 (allow access from anywhere) is whitelisted in MongoDB Atlas for Render deployments.");
    } else if (err.message.includes("Authentication failed")) {
      console.error("Reason: Database authentication failed. Check your username and password in your connection string.");
    }
    console.error("Stack Trace:", err.stack);
  }
}

module.exports = connectDB;