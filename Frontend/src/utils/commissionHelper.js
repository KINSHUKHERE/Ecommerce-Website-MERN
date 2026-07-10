/**
 * Helper to calculate dynamic commission statistics for a vendor.
 * 
 * Commission Criteria (based on gross monthly sales):
 * - Sales <= ₹2,00,005 (2 Lakhs): 1% admin commission
 * - Sales <= ₹10,00,005 (10 Lakhs): 5% admin commission
 * - Sales > ₹10,00,005: 10% admin commission (highest tier)
 */
export const calculateVendorCommission = (orders, vendorProducts) => {
  const vendorProductIds = new Set(
    vendorProducts.map((p) => (p._id || p).toString())
  );

  // Group sales by month (YYYY-MM format)
  const salesByMonth = {};
  let totalSalesAllTime = 0;

  orders.forEach((order) => {
    // Ignore cancelled orders
    if (order.orderStatus === "Cancelled") return;

    const date = new Date(order.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    // Calculate sum of vendor items in this order
    const vendorItemsTotal = order.items.reduce((sum, item) => {
      const pid = item.productId?._id 
        ? item.productId._id.toString() 
        : item.productId?.toString();
        
      if (pid && vendorProductIds.has(pid)) {
        return sum + (item.price * (item.quantity || 1));
      }
      return sum;
    }, 0);

    if (vendorItemsTotal > 0) {
      salesByMonth[monthKey] = (salesByMonth[monthKey] || 0) + vendorItemsTotal;
      totalSalesAllTime += vendorItemsTotal;
    }
  });

  // Calculate commission for each month
  let totalCommissionAllTime = 0;
  Object.entries(salesByMonth).forEach(([_, sales]) => {
    let rate = 0.01;
    if (sales <= 200000) {
      rate = 0.01;
    } else if (sales <= 1000000) {
      rate = 0.05;
    } else {
      rate = 0.10;
    }
    totalCommissionAllTime += sales * rate;
  });

  // Get current calendar month's statistics
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentMonthSales = salesByMonth[currentMonthKey] || 0;

  let currentRate = 0.01;
  if (currentMonthSales <= 200000) {
    currentRate = 0.01;
  } else if (currentMonthSales <= 1000000) {
    currentRate = 0.05;
  } else {
    currentRate = 0.10;
  }
  const currentMonthCommission = currentMonthSales * currentRate;

  return {
    totalSalesAllTime,
    totalCommissionAllTime,
    currentMonthSales,
    currentRate,
    currentMonthCommission,
    salesByMonth,
  };
};
