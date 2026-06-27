const mongoose = require("mongoose");
const path = require("path");

// Load Backend .env variables from the same folder
require("dotenv").config({ path: path.join(__dirname, ".env") });

const productSchema = new mongoose.Schema(
  {
    imgUrl: { type: String, required: true },
    images: { type: [String], default: [] },
    heading: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
    quantity: { type: Number, default: 10 },
    sold: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Prevent model overwrite errors if already registered in mongoose
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

const newProducts = [
  {
    imgUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    images: [
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800"
    ],
    heading: "Sony WH-1000XM4 Noise Canceling Headphones",
    price: 19990,
    description: "Industry-leading noise-canceling over-ear headphones with Alexa voice control and 30 hours of battery life.",
    categoryId: "6a34f70f42d318d0637f2037",
    brandId: "6a34f70f42d318d0637f2040",
    quantity: 15,
    sold: false
  },
  {
    imgUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800",
    images: [
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800",
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800"
    ],
    heading: "Dell XPS 13 Plus Laptop",
    price: 145000,
    description: "The most powerful 13-inch XPS laptop is up to 2x more powerful than before in the same size. Powered by 13th Gen Intel Core processors.",
    categoryId: "6a34f70f42d318d0637f2036",
    brandId: "6a34f70f42d318d0637f203d",
    quantity: 8,
    sold: false
  },
  {
    imgUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800",
    images: [
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800"
    ],
    heading: "Bose QuietComfort Ultra Wireless Headphones",
    price: 32900,
    description: "Bose QuietComfort Ultra wireless headphones with world-class noise cancellation, breakthrough spatialized audio, and premium materials.",
    categoryId: "6a34f70f42d318d0637f2037",
    brandId: "6a34f70f42d318d0637f2041",
    quantity: 12,
    sold: false
  },
  {
    imgUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
    images: [
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800",
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800"
    ],
    heading: "iPhone 15 Pro Titanium",
    price: 129900,
    description: "Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and a powerful iPhone camera system.",
    categoryId: "6a34f70e42d318d0637f2035",
    brandId: "6a34f70f42d318d0637f2039",
    quantity: 20,
    sold: false
  },
  {
    imgUrl: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800",
    images: [
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800",
      "https://images.unsplash.com/photo-1517502884422-41eaaced0168?w=800"
    ],
    heading: "Apple Watch Series 9 GPS",
    price: 41900,
    description: "Smartwatch with fitness tracker, blood oxygen and ECG apps, Always-On Retina display, and water resistance.",
    categoryId: "6a34f70f42d318d0637f2038",
    brandId: "6a34f70f42d318d0637f2044",
    quantity: 10,
    sold: false
  },
  {
    imgUrl: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800",
    images: [
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800",
      "https://images.unsplash.com/photo-1517502884422-41eaaced0168?w=800"
    ],
    heading: "Samsung Galaxy Watch 5 Bluetooth",
    price: 27999,
    description: "Samsung Galaxy Watch 5 with body composition analysis, sleep tracking, long-lasting battery, and premium sapphire crystal glass.",
    categoryId: "6a34f70f42d318d0637f2038",
    brandId: "6a34f70f42d318d0637f2045",
    quantity: 5,
    sold: false
  },
  {
    imgUrl: "https://images.unsplash.com/photo-1589561084283-930aa241c20b?w=800",
    images: [
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800",
      "https://images.unsplash.com/photo-1496181130204-755241544e35?w=800"
    ],
    heading: "HP Spectre x360 2-in-1 Laptop",
    price: 159900,
    description: "Premium convertible 2-in-1 laptop with stunning 4K OLED touch display, Intel Core i7 processor, and included active stylus pen.",
    categoryId: "6a34f70f42d318d0637f2036",
    brandId: "6a34f70f42d318d0637f203e",
    quantity: 6,
    sold: false
  },
  {
    imgUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800",
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800"
    ],
    heading: "Google Pixel 8 Pro 5G",
    price: 106999,
    description: "The all-pro phone engineered by Google. It has the best of Google AI, the most advanced Pixel Camera ever, and a sleek modern design.",
    categoryId: "6a34f70e42d318d0637f2035",
    brandId: "6a34f70f42d318d0637f203b",
    quantity: 14,
    sold: false
  },
  {
    imgUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800",
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800"
    ],
    heading: "Bose SoundLink Flex Bluetooth Speaker",
    price: 15900,
    description: "Waterproof outdoor speaker with proprietary PositionIQ technology that automatically detects orientation for optimal sound quality.",
    categoryId: "6a34f70f42d318d0637f2037",
    brandId: "6a34f70f42d318d0637f2041",
    quantity: 22,
    sold: false
  },
  {
    imgUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800",
    images: [
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800",
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800"
    ],
    heading: "Lenovo Yoga Book 9i Dual Screen Laptop",
    price: 224990,
    description: "Revolutionary dual-screen laptop featuring two full-size 13.3-inch PureSight OLED displays and multiple usability modes.",
    categoryId: "6a34f70f42d318d0637f2036",
    brandId: "6a34f70f42d318d0637f203f",
    quantity: 4,
    sold: false
  },
  {
    imgUrl: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800",
    images: [
      "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800",
      "https://images.unsplash.com/photo-1517502884422-41eaaced0168?w=800"
    ],
    heading: "Fitbit Charge 6 Fitness Tracker",
    price: 14999,
    description: "Advanced fitness tracker with built-in GPS, 24/7 heart rate tracking, personalized sleep score, and up to 7 days of battery life.",
    categoryId: "6a34f70f42d318d0637f2038",
    brandId: "6a34f70f42d318d0637f2046",
    quantity: 18,
    sold: false
  },
  {
    imgUrl: "https://images.unsplash.com/photo-1515488042361-404e9250afef?w=800",
    images: [
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800",
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800"
    ],
    heading: "Educational Wooden Building Blocks Set",
    price: 1299,
    description: "Classic educational wooden building blocks set featuring 100 colorful solid wood blocks for creative toddler play and brain development.",
    categoryId: "6a3ac2dd45eaf319d406b5fd",
    brandId: "6a3ac2f445eaf319d406b5fe",
    quantity: 35,
    sold: false
  }
];

async function migrateAndSeed() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing in env!");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const db = mongoose.connection.db;

    // 1. Try to rename 'variants' collection to 'brands'
    try {
      await db.collection("variants").rename("brands");
      console.log("Collection 'variants' successfully renamed to 'brands'.");
    } catch (e) {
      console.log("Variants collection rename skipped:", e.message);
    }

    // 2. Delete existing products
    const delResult = await Product.deleteMany({});
    console.log(`Deleted ${delResult.deletedCount} existing products from the database.`);

    // 3. Seed new products with brandId
    const seeded = await Product.insertMany(newProducts);
    console.log(`Successfully seeded ${seeded.length} products with brandId mapping!`);

  } catch (err) {
    console.error("Migration/Seeding failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed.");
    process.exit(0);
  }
}

migrateAndSeed();
