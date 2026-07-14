const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function queryVariants() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully to DB");
    
    // Define a simple Schema
    const VariantSchema = new mongoose.Schema({}, { strict: false });
    const Variant = mongoose.model("Variant", VariantSchema, "variants");
    
    const variants = await Variant.find({}).lean();
    console.log("VARIANTS IN DB:");
    variants.forEach(v => {
      console.log(`- Product ID: ${v.productId}, Price: ${v.price}, Stock: ${v.quantity}, Variant: ${JSON.stringify(v.options)}, ID: ${v._id}`);
    });
    
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

queryVariants();
