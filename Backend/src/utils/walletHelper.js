const Order = require("../models/orderDetails");
const Product = require("../models/productsData");

const getVendorLifetimeSales = async (vendorId) => {
  try {
    // Find all products owned by this vendor
    const vendorProducts = await Product.find({ vendorId }).select("_id");
    const vendorProductIds = vendorProducts.map(p => p._id.toString());

    if (vendorProductIds.length === 0) return 0;

    // Find all orders containing any of these products, ignoring Cancelled orders
    const orders = await Order.find({
      "items.productId": { $in: vendorProductIds },
      orderStatus: { $ne: "Cancelled" }
    });

    // Calculate sum of vendor items in these orders
    let totalSales = 0;
    for (const order of orders) {
      for (const item of order.items) {
        if (item.productId && vendorProductIds.includes(item.productId.toString())) {
          totalSales += item.price * (item.quantity || 1);
        }
      }
    }
    return totalSales;
  } catch (err) {
    console.error("Error calculating vendor lifetime sales:", err);
    return 0;
  }
};

const getRequiredMinimumBalance = (lifetimeSales) => {
  return 200; // Flat minimum required balance of ₹200 for all vendors
};

module.exports = {
  getVendorLifetimeSales,
  getRequiredMinimumBalance
};
