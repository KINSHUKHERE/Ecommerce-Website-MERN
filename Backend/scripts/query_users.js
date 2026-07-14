const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function queryUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully to DB");
    
    // Define a simple Schema
    const UserSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model("User", UserSchema, "users");
    
    const users = await User.find({}).lean();
    console.log("USERS IN DB:");
    users.forEach(u => {
      console.log(`- Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, ID: ${u._id}`);
    });
    
    const products = await mongoose.model("Product", new mongoose.Schema({}, { strict: false }), "products").find({}).lean();
    console.log("PRODUCTS IN DB:");
    products.forEach(p => {
      console.log(`- Heading: ${p.heading}, Price: ${p.price}, ID: ${p._id}`);
    });
    
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

queryUsers();
