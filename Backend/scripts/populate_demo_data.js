const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const usersList = [
  { id: "6a5474219b084195c2eaf395", name: "Monika Kumawat", email: "monikakumawat0852@gmail.com", address: "Plot No. 12, Ganesh Nagar", city: "Jaipur", state: "Rajasthan", postalCode: "302012" },
  { id: "6a4f617218971bb0be28a15a", name: "Kinshuk Khandelwal", email: "kinshukkhandelwal333@gmail.com", address: "Flat 402, Signature Heights", city: "Jaipur", state: "Rajasthan", postalCode: "302021" },
  { id: "6a4ddfa4fbe89331e4539fa7", name: "nirbhay singh jain", email: "nirbhaysinghjain01@gmail.com", address: "House 87, Scheme 5", city: "Alwar", state: "Rajasthan", postalCode: "301001" },
  { id: "6a43f0bdcffa1444b462136c", name: "Kinshuk GDG", email: "kinshukgdg@gmail.com", address: "C-25, Vaishali Nagar", city: "Jaipur", state: "Rajasthan", postalCode: "302021" },
  { id: "6a325c63745cb00fdabf56b3", name: "Prachi Dogi", email: "prachijain@gmail.com", address: "B-104, Royal Palms, Malad East", city: "Mumbai", state: "Maharashtra", postalCode: "400097" }
];

const reviewsTemplate = {
  // Apple MacBook Air M4
  "6a436dfba1a256d0764f9bf7": [
    {
      userId: "6a5474219b084195c2eaf395",
      rating: 5,
      comment: "Absolutely loving the new M4 MacBook Air! The midnight color looks stunning, although it is a bit of a fingerprint magnet. The 16GB RAM makes multitasking incredibly smooth, and the battery easily lasts me a full day of study and browsing. Highly recommend it!"
    },
    {
      userId: "6a4f617218971bb0be28a15a",
      rating: 4,
      comment: "A solid upgrade from my old Intel MacBook. The screen is gorgeous and the keyboard is comfortable to type on. Performance is blazing fast. The only downside is the limited port selection, so you will definitely need a USB-C hub. Other than that, it's perfect."
    },
    {
      userId: "6a4ddfa4fbe89331e4539fa7",
      rating: 5,
      comment: "Brilliant laptop. Light weight, incredibly fast boot times, and completely silent since it's fanless. M4 chip handles everything I throw at it, including some light video editing. The speakers are surprisingly good for a laptop this thin."
    },
    {
      userId: "6a43f0bdcffa1444b462136c",
      rating: 3,
      comment: "It's a decent laptop, but 256GB storage is just too small for 2026. After installing my coding tools and downloading a few projects, I am already running out of space. Performance is great, but keep the storage limitation in mind before buying."
    },
    {
      userId: "6a325c63745cb00fdabf56b3",
      rating: 2,
      comment: "I am disappointed with the thermal management. When running heavier tasks, the laptop gets uncomfortably hot underneath because it has no fan. Also, the midnight finish scratches very easily. For this price, I expected better build durability."
    }
  ],
  // MarQ Split AC
  "6a436f6ca1a256d0764f9c37": [
    {
      userId: "6a5474219b084195c2eaf395",
      rating: 4,
      comment: "Decent AC for a small bedroom. Cooling is quick and the convertible modes are quite useful. Noise level is low enough for a good night's sleep. Installation was delayed by a day, but the product itself works perfectly fine."
    },
    {
      userId: "6a4f617218971bb0be28a15a",
      rating: 3,
      comment: "Average cooling performance. It takes around 20 minutes to cool my 100 sq ft room. The turbo cool mode works but consumes a lot of power. Remote control design feels cheap and lacks backlighting. Budget-friendly, but not premium."
    },
    {
      userId: "6a4ddfa4fbe89331e4539fa7",
      rating: 5,
      comment: "Excellent value for money! Got it for my home office and it works wonders. Cooling is super fast, power consumption is quite low on 3-star rating, and the inverter technology keeps the temperature stable. Zero complaints."
    },
    {
      userId: "6a43f0bdcffa1444b462136c",
      rating: 1,
      comment: "Worst experience. Within three days of installation, the AC started leaking water inside the room. The compressor also makes a loud vibrating noise. Customer support has been unresponsive. Very disappointed with MarQ."
    },
    {
      userId: "6a325c63745cb00fdabf56b3",
      rating: 4,
      comment: "Nice AC for the price. The 5-in-1 convertible modes help save electricity when it's not too hot outside. Design is clean and simple. The air throw is decent, though installation charges were higher than expected."
    }
  ],
  // Apple iPhone 17 Pro Max
  "6a43741c4ba39bdb70a7623a": [
    {
      userId: "6a5474219b084195c2eaf395",
      rating: 5,
      comment: "The iPhone 17 Pro Max is an absolute beast! The camera system is unmatched, especially in low light. The deep blue color looks very elegant and premium. Face ID is faster than ever, and the display brightness under direct sunlight is incredible."
    },
    {
      userId: "6a4f617218971bb0be28a15a",
      rating: 5,
      comment: "Best smartphone on the market. The action button and new camera control interface are very intuitive. Battery life easily lasts 1.5 days on heavy use. The design feels lighter than last year's model. Definitely worth the upgrade."
    },
    {
      userId: "6a4ddfa4fbe89331e4539fa7",
      rating: 2,
      comment: "Honestly, it feels exactly like the 16 Pro Max. The upgrades are minimal and definitely not worth the astronomical price tag. Also, the box doesn't include a charger. Apple is charging premium prices for iterative changes."
    },
    {
      userId: "6a43f0bdcffa1444b462136c",
      rating: 4,
      comment: "Incredible screen and performance. The dynamic island is actually useful now with more app integrations. However, it is a very large and heavy phone, making it hard to use with one hand. Camera is professional grade."
    },
    {
      userId: "6a325c63745cb00fdabf56b3",
      rating: 5,
      comment: "Bought this for my mobile photography hobby and I am blown away by the zoom and macro shots. iOS is smooth as always. The charging speed has also improved slightly. Truly a premium device in every aspect."
    }
  ],
  // boAt BassHeads 100 Wired Earphone
  "6a4374684ba39bdb70a76260": [
    {
      userId: "6a5474219b084195c2eaf395",
      rating: 5,
      comment: "Superb earphones for this price range! The bass is punchy and vocal clarity is clear. The hawkeye-inspired cable design doesn't tangle easily. Inline mic works perfectly for office calls. You can't get anything better for ₹399."
    },
    {
      userId: "6a4f617218971bb0be28a15a",
      rating: 4,
      comment: "Very comfortable fit. I use them for my daily workouts and they stay in place. Sound quality is decent, though the high frequencies can sound a bit harsh at maximum volume. Build quality is plastic but holds up well."
    },
    {
      userId: "6a4ddfa4fbe89331e4539fa7",
      rating: 3,
      comment: "Decent sound, but the wire feels very thin and delicate. I am worried it will break if pulled accidentally. The bass is good but tends to muffle the mid-range vocals. Good as a backup earphone, but don't expect audiophile quality."
    },
    {
      userId: "6a43f0bdcffa1444b462136c",
      rating: 2,
      comment: "The sound quality is average and the left earpiece stopped working after just two weeks of gentle use. The jack connection is loose. Disappointed, even for a cheap product."
    },
    {
      userId: "6a325c63745cb00fdabf56b3",
      rating: 4,
      comment: "A budget classic. The mic is clear, bass is decent, and the fit is secure. For ₹399, it is an amazing deal. I have bought multiple pairs of these over the years and they always deliver good value."
    }
  ],
  // SAMSUNG Q Series Soundbar
  "6a4374a94ba39bdb70a7626c": [
    {
      userId: "6a5474219b084195c2eaf395",
      rating: 5,
      comment: "Absolute cinema experience at home! The Dolby Atmos and surround sound are mind-blowing. Connecting it to my Samsung TV was seamless via eARC. The bass from the wireless subwoofer shakes the room. Absolutely worth every rupee!"
    },
    {
      userId: "6a4f617218971bb0be28a15a",
      rating: 4,
      comment: "Great sound quality with clear dialogue delivery. Setting it up was easy. The soundstage is wide, though the rear speaker effect is simulated unless you buy the optional physical rears. Clean design fits perfectly under the TV."
    },
    {
      userId: "6a4ddfa4fbe89331e4539fa7",
      rating: 5,
      comment: "Breathtaking sound clarity. The adaptive sound mode automatically optimizes the audio depending on whether I am watching news, sports, or action movies. The remote is simple and works well. Highly satisfied."
    },
    {
      userId: "6a43f0bdcffa1444b462136c",
      rating: 3,
      comment: "Audio quality is great, but the wireless subwoofer keeps disconnecting from the main soundbar every few hours. I have to restart the system to pair them again. The HDMI passthrough is also a bit laggy."
    },
    {
      userId: "6a325c63745cb00fdabf56b3",
      rating: 2,
      comment: "For a 400W soundbar, the volume is surprisingly low when using Bluetooth. The remote response is sluggish. It sounds barely better than my TV's built-in speakers unless playing native Dolby Atmos content. Disappointed for the price."
    }
  ]
};

async function populateDemoData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // Get DB collections directly to write customized timestamps bypass
    const db = mongoose.connection.db;
    const reviewsCol = db.collection("reviews");
    const ordersCol = db.collection("orders");

    // Clean current orders and reviews
    await reviewsCol.deleteMany({});
    await ordersCol.deleteMany({});
    console.log("Cleared existing reviews and orders.");

    // Retrieve products and variants
    const Product = mongoose.model("Product", new mongoose.Schema({}, { strict: false }), "products");
    const Variant = mongoose.model("Variant", new mongoose.Schema({}, { strict: false }), "variants");

    const products = await Product.find({}).lean();
    const variants = await Variant.find({}).lean();

    console.log(`Found ${products.length} products and ${variants.length} variants in database.`);

    const orderDocs = [];
    const reviewDocs = [];

    // Helper to generate transaction IDs
    const genTxnId = () => "txn_" + Math.random().toString(36).substr(2, 9).toUpperCase();

    // Loop through each product to create 5 reviews
    for (const prod of products) {
      const prodIdStr = prod._id.toString();
      const templates = reviewsTemplate[prodIdStr];
      if (!templates) {
        console.log(`No reviews template for product: ${prod.heading}`);
        continue;
      }

      // Find variants of this product
      const prodVariants = variants.filter(v => v.productId.toString() === prodIdStr);

      for (const temp of templates) {
        const user = usersList.find(u => u.id === temp.userId);
        if (!user) continue;

        // Pick a random variant (if exists) or fall back
        const variant = prodVariants[Math.floor(Math.random() * prodVariants.length)];
        const price = variant ? variant.price : (prod.price || 499);
        const variantId = variant ? variant._id : null;

        // Generate Dates
        // Review date: between 2 and 60 days ago
        const daysAgoReview = 2 + Math.floor(Math.random() * 58);
        const reviewDate = new Date();
        reviewDate.setDate(reviewDate.getDate() - daysAgoReview);

        // Order date: 5 to 15 days before review date
        const daysAgoOrder = daysAgoReview + 5 + Math.floor(Math.random() * 10);
        const orderDate = new Date();
        orderDate.setDate(orderDate.getDate() - daysAgoOrder);

        // Create Verified Purchase Order
        const quantity = 1 + Math.floor(Math.random() * 2); // 1-2 units
        const itemTotal = price * quantity;

        const orderItem = {
          productId: prod._id,
          variantId: variantId,
          name: prod.heading,
          price: price,
          quantity: quantity,
          image: prod.imgUrl
        };

        const paymentMethod = ["UPI", "Card", "Razorpay", "COD"][Math.floor(Math.random() * 4)];

        const orderDoc = {
          userId: new mongoose.Types.ObjectId(user.id),
          items: [orderItem],
          totalAmount: itemTotal,
          shippingAddress: {
            address: user.address,
            city: user.city,
            state: user.state,
            postalCode: user.postalCode,
            country: "India"
          },
          paymentMethod: paymentMethod,
          transactionId: genTxnId(),
          paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
          orderStatus: "Delivered",
          createdAt: orderDate,
          updatedAt: orderDate
        };

        orderDocs.push(orderDoc);

        // Create Review
        const reviewDoc = {
          productId: prod._id,
          userId: new mongoose.Types.ObjectId(user.id),
          userName: user.name,
          rating: temp.rating,
          comment: temp.comment,
          createdAt: reviewDate,
          updatedAt: reviewDate
        };

        reviewDocs.push(reviewDoc);
      }
    }

    // Add extra random non-delivered / cancelled / shipped orders for the users to look natural
    for (const user of usersList) {
      // 2 extra orders per user
      for (let i = 0; i < 2; i++) {
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        const prodVariants = variants.filter(v => v.productId.toString() === randomProduct._id.toString());
        const variant = prodVariants[Math.floor(Math.random() * prodVariants.length)];
        const price = variant ? variant.price : (randomProduct.price || 499);
        const variantId = variant ? variant._id : null;

        const quantity = 1 + Math.floor(Math.random() * 3); // 1-3 units
        const orderStatus = ["Shipped", "Processing", "Cancelled"][Math.floor(Math.random() * 3)];
        
        const daysAgoOrder = 1 + Math.floor(Math.random() * 20);
        const orderDate = new Date();
        orderDate.setDate(orderDate.getDate() - daysAgoOrder);

        const paymentMethod = ["UPI", "Card", "Razorpay", "COD"][Math.floor(Math.random() * 4)];

        const extraOrder = {
          userId: new mongoose.Types.ObjectId(user.id),
          items: [{
            productId: randomProduct._id,
            variantId: variantId,
            name: randomProduct.heading,
            price: price,
            quantity: quantity,
            image: randomProduct.imgUrl
          }],
          totalAmount: price * quantity,
          shippingAddress: {
            address: user.address,
            city: user.city,
            state: user.state,
            postalCode: user.postalCode,
            country: "India"
          },
          paymentMethod: paymentMethod,
          transactionId: genTxnId(),
          paymentStatus: orderStatus === "Cancelled" ? "Failed" : (paymentMethod === "COD" ? "Pending" : "Paid"),
          orderStatus: orderStatus,
          createdAt: orderDate,
          updatedAt: orderDate
        };

        orderDocs.push(extraOrder);
      }
    }

    // Insert everything directly
    if (orderDocs.length > 0) {
      await ordersCol.insertMany(orderDocs);
      console.log(`Successfully populated ${orderDocs.length} orders.`);
    }

    if (reviewDocs.length > 0) {
      await reviewsCol.insertMany(reviewDocs);
      console.log(`Successfully populated ${reviewDocs.length} reviews.`);
    }

    console.log("Database population completed successfully!");
    await mongoose.connection.close();
  } catch (err) {
    console.error("Error populating demo data:", err);
  }
}

populateDemoData();
