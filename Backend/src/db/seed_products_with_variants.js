const mongoose = require("mongoose");
const path = require("path");

// Load .env variables
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const Product = require("../models/productsData");
const Variant = require("../models/variantDetails");
const Category = require("../models/categoryDetails");
const Brand = require("../models/brandDetails");

async function seedProducts() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing in env!");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB successfully.");

    // 1. Clear existing products and variants
    await Product.deleteMany({});
    await Variant.deleteMany({});
    console.log("Cleared existing products and variants.");

    // 2. Fetch categories
    const categories = await Category.find({});
    const getCatId = (name) => {
      const cat = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
      return cat ? cat._id : categories[0]?._id;
    };

    // 3. Fetch brands
    const brands = await Brand.find({});
    const getBrandId = (name) => {
      const brand = brands.find(b => b.name.toLowerCase() === name.toLowerCase());
      return brand ? brand._id : brands[0]?._id;
    };

    // Helper to generate cartesian combos
    const generateCombos = (opts) => {
      if (opts.length === 0) return [[]];
      const results = [];
      const recurse = (index, current) => {
        if (index === opts.length) {
          results.push([...current]);
          return;
        }
        const opt = opts[index];
        opt.values.forEach(val => {
          current.push({ name: opt.name, value: val });
          recurse(index + 1, current);
          current.pop();
        });
      };
      recurse(0, []);
      return results;
    };

    const productsToSeed = [
      {
        heading: "iPhone 15 Pro Titanium",
        description: "Featuring the groundbreaking A17 Pro chip, a customizable Action button, and a powerful titanium build.",
        categoryName: "Smartphones",
        brandName: "Apple",
        imgUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
        images: [
          "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800",
          "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800"
        ],
        options: [
          { name: "Color", values: ["Natural Titanium", "Blue Titanium", "Black Titanium"] },
          { name: "Storage", values: ["128GB", "256GB", "512GB"] }
        ],
        basePrice: 129900,
        priceDelta: { "256GB": 10000, "512GB": 30000 },
        baseQuantity: 12
      },
      {
        heading: "Dell XPS 13 Plus Laptop",
        description: "The most powerful 13-inch XPS laptop powered by 13th Gen Intel Core processors with seamless glass touchpad.",
        categoryName: "Laptops",
        brandName: "Dell",
        imgUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800",
        images: [
          "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800",
          "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800"
        ],
        options: [
          { name: "Processor", values: ["Intel i7", "Intel i9"] },
          { name: "RAM", values: ["16GB", "32GB"] }
        ],
        basePrice: 145000,
        priceDelta: { "Intel i9": 20000, "32GB": 15000 },
        baseQuantity: 8
      },
      {
        heading: "Sony WH-1000XM4 Headphones",
        description: "Industry-leading noise-canceling over-ear wireless headphones with Alexa voice control and 30 hours battery.",
        categoryName: "Audio",
        brandName: "Sony",
        imgUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
        images: [
          "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800"
        ],
        options: [
          { name: "Color", values: ["Silver", "Black"] }
        ],
        basePrice: 19990,
        priceDelta: {},
        baseQuantity: 15
      },
      {
        heading: "Bose QuietComfort Ultra",
        description: "Bose wireless headphones with world-class noise cancellation, spatialized audio, and ultra-premium materials.",
        categoryName: "Audio",
        brandName: "Bose",
        imgUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800",
        images: [
          "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800"
        ],
        options: [
          { name: "Color", values: ["White Smoke", "Black"] }
        ],
        basePrice: 32900,
        priceDelta: {},
        baseQuantity: 10
      },
      {
        heading: "Apple Watch Series 9 GPS",
        description: "Smartwatch with fitness tracker, blood oxygen and ECG apps, Always-On Retina display, and water resistance.",
        categoryName: "Wearables",
        brandName: "Apple",
        imgUrl: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800",
        images: [
          "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800"
        ],
        options: [
          { name: "Size", values: ["41mm", "45mm"] },
          { name: "Color", values: ["Midnight", "Starlight"] }
        ],
        basePrice: 41900,
        priceDelta: { "45mm": 4000 },
        baseQuantity: 14
      }
    ];

    for (const item of productsToSeed) {
      const categoryId = getCatId(item.categoryName);
      const brandId = getBrandId(item.brandName);

      if (!categoryId || !brandId) {
        console.warn(`Skipping product ${item.heading} because Category/Brand could not be resolved.`);
        continue;
      }

      // Create product
      const product = await Product.create({
        heading: item.heading,
        description: item.description,
        categoryId,
        brandId,
        imgUrl: item.imgUrl,
        images: item.images,
        options: item.options
      });

      // Generate variant combinations
      const combos = generateCombos(item.options);
      const variantsToCreate = combos.map((combo, idx) => {
        const brandCode = item.brandName.slice(0, 3).toUpperCase();
        const prodCode = item.heading.slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, "");
        const attrCode = combo.map(c => c.value.slice(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, "")).join("-");
        const sku = `SKU-${brandCode}-${prodCode}-${attrCode}-${idx + 100}`;

        // Calculate price adjustment based on value attributes
        let price = item.basePrice;
        combo.forEach(c => {
          if (item.priceDelta[c.value]) {
            price += item.priceDelta[c.value];
          }
        });

        return {
          productId: product._id,
          sku,
          price,
          quantity: item.baseQuantity,
          images: [item.imgUrl],
          attributes: combo
        };
      });

      await Variant.insertMany(variantsToCreate);
      console.log(`Seeded product "${item.heading}" with ${variantsToCreate.length} variants.`);
    }

    console.log("Database seeding completed successfully.");
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Database disconnected.");
  }
}

seedProducts();
