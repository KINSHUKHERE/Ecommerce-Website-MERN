const Product = require("../models/productsData");
const Variant = require("../models/variantDetails");
const SaleConfig = require("../models/saleConfig");

const DELIVERY_FEE = 20;
const FREE_DELIVERY_THRESHOLD = 1000;

/**
 * Recompute an order's line items and totals authoritatively from the database.
 * The client is NEVER trusted for price/name — only productId, variantId and
 * quantity are read from the request. This prevents price-tampering: an attacker
 * cannot claim to buy expensive goods while paying for cheap ones.
 *
 * Mirrors the pricing rules used by the checkout UI (global sale + salePrice,
 * and the <₹1000 => ₹20 delivery / free-above rule).
 *
 * Throws an Error with a `.statusCode` on any invalid/unavailable item.
 */
async function computeOrderTotals(items) {
  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error("No items provided for the order");
    err.statusCode = 400;
    throw err;
  }

  const saleConfig = await SaleConfig.findOne();
  const globalSaleActive = !!(saleConfig && saleConfig.isGlobalSaleActive);

  const pricedItems = [];
  let subtotal = 0;

  for (const item of items) {
    const quantity = Number(item.quantity);
    if (!item.productId || !Number.isInteger(quantity) || quantity < 1) {
      const err = new Error("Invalid item in order");
      err.statusCode = 400;
      throw err;
    }

    const product = await Product.findById(item.productId);
    if (!product || product.status !== "active") {
      const err = new Error(`Product "${item.name || item.productId}" is unavailable`);
      err.statusCode = 400;
      throw err;
    }

    let unitPrice;
    let variantId = null;
    let image = product.imgUrl;

    if (item.variantId) {
      const variant = await Variant.findOne({ _id: item.variantId, isDeleted: false });
      if (!variant || !variant.isActive) {
        const err = new Error(`A selected variant of "${product.heading}" is unavailable`);
        err.statusCode = 400;
        throw err;
      }
      variantId = variant._id;
      const onSale = globalSaleActive && variant.onSale && variant.salePrice > 0;
      unitPrice = onSale ? variant.salePrice : variant.price;
      if (variant.images && variant.images.length > 0) image = variant.images[0];
    } else {
      const onSale = globalSaleActive && product.onSale && product.salePrice > 0;
      unitPrice = onSale ? product.salePrice : (product.price || 0);
    }

    unitPrice = Number(unitPrice) || 0;
    subtotal += unitPrice * quantity;

    pricedItems.push({
      productId: product._id,
      variantId,
      name: product.heading,
      price: unitPrice,
      quantity,
      image,
    });
  }

  const deliveryCharge =
    subtotal > 0 && subtotal < FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE : 0;
  const expectedTotal = subtotal + deliveryCharge;

  return { subtotal, deliveryCharge, expectedTotal, pricedItems, globalSaleActive };
}

/**
 * Atomically reserve stock for each priced item. Variant stock (the real
 * inventory) is decremented with a conditional `$gte` update so two concurrent
 * buyers can never oversell. If any item cannot be satisfied, everything already
 * reserved in this call is rolled back and { ok:false } is returned.
 *
 * Legacy flat products (no variant) keep the previous best-effort decrement.
 */
async function reserveStock(pricedItems) {
  const reserved = [];

  for (const item of pricedItems) {
    if (item.variantId) {
      const updated = await Variant.findOneAndUpdate(
        { _id: item.variantId, isDeleted: false, quantity: { $gte: item.quantity } },
        { $inc: { quantity: -item.quantity } },
        { new: true }
      );

      if (!updated) {
        await releaseStock(reserved);
        return { ok: false, message: `Insufficient stock for "${item.name}"` };
      }
      reserved.push(item);
    } else {
      // Legacy flat product: best-effort decrement (does not block checkout).
      const product = await Product.findById(item.productId);
      if (product) {
        product.quantity = Math.max(0, (product.quantity ?? 10) - item.quantity);
        if (product.quantity <= 0) product.sold = true;
        await product.save();
      }
    }
  }

  return { ok: true };
}

/** Restore stock reserved by reserveStock (used to roll back a failed order). */
async function releaseStock(items) {
  for (const item of items) {
    if (item.variantId) {
      await Variant.updateOne(
        { _id: item.variantId },
        { $inc: { quantity: item.quantity } }
      );
    }
  }
}

/**
 * Fan out order notifications to the relevant vendors and the admin.
 * Shared by the COD and online-payment order paths so both notify sellers.
 */
async function createOrderNotifications(order, pricedItems) {
  try {
    const Notification = require("../models/notificationDetails");

    const vendorItemsMap = {};
    for (const item of pricedItems) {
      const prod = await Product.findById(item.productId);
      if (prod && prod.vendorId) {
        const vIdStr = prod.vendorId.toString();
        if (!vendorItemsMap[vIdStr]) vendorItemsMap[vIdStr] = [];
        vendorItemsMap[vIdStr].push(item);
      }
    }

    for (const [vendorId, vendorItems] of Object.entries(vendorItemsMap)) {
      const itemNames = vendorItems.map((item) => item.name).join(", ");
      await Notification.create({
        recipient: vendorId,
        title: "New Order Received",
        message: `You received a new order for: ${itemNames}.`,
        type: "order",
        link: "/vendor/order-details",
      });
    }

    await Notification.create({
      recipient: null,
      title: "New Order Placed",
      message: `Order #${order._id.toString().slice(-8)} has been placed for a total of ₹${order.totalAmount}.`,
      type: "order",
      link: "/order-details",
    });
  } catch (notifErr) {
    console.error("Failed to generate order notifications:", notifErr);
  }
}

module.exports = {
  computeOrderTotals,
  reserveStock,
  releaseStock,
  createOrderNotifications,
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
};
