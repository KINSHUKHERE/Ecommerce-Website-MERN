/**
 * Helper to calculate dynamic commission statistics for a vendor.
 * 
 * Commission Criteria (based on gross monthly sales):
 * - Sales <= ₹2,00,005 (2 Lakhs): 1% admin commission
 * - Sales <= ₹10,00,005 (10 Lakhs): 5% admin commission
 * - Sales > ₹10,00,005: 10% admin commission (highest tier)
 */
export const calculateVendorCommission = (orders, vendorProducts, settings = null) => {
  const vendorProductIds = new Set(
    vendorProducts.map((p) => (p._id || p).toString())
  );

  const priceThreshold = (settings && settings.priceThreshold !== undefined) ? settings.priceThreshold : 50000;
  const commissionUnderThreshold = (settings && settings.commissionUnderThreshold !== undefined) ? settings.commissionUnderThreshold / 100 : 0.02;
  const commissionOverThreshold = (settings && settings.commissionOverThreshold !== undefined) ? settings.commissionOverThreshold / 100 : 0.05;

  let totalSalesAllTime = 0;
  let totalCommissionAllTime = 0;

  // Group by month
  const salesByMonth = {};
  const commissionByMonth = {};

  orders.forEach((order) => {
    // Process only delivered orders
    if (order.orderStatus !== "Delivered") return;

    const date = new Date(order.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    order.items.forEach((item) => {
      const pid = item.productId?._id 
        ? item.productId._id.toString() 
        : item.productId?.toString();

      if (pid && vendorProductIds.has(pid)) {
        const itemPrice = item.price;
        const rate = itemPrice < priceThreshold ? commissionUnderThreshold : commissionOverThreshold;

        const itemTotal = itemPrice * (item.quantity || 1);
        const itemCommission = itemTotal * rate;

        totalSalesAllTime += itemTotal;
        totalCommissionAllTime += itemCommission;

        salesByMonth[monthKey] = (salesByMonth[monthKey] || 0) + itemTotal;
        commissionByMonth[monthKey] = (commissionByMonth[monthKey] || 0) + itemCommission;
      }
    });
  });

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentMonthSales = salesByMonth[currentMonthKey] || 0;
  const currentMonthCommission = commissionByMonth[currentMonthKey] || 0;

  // Average active rate for current month
  const currentRate = currentMonthSales > 0 ? (currentMonthCommission / currentMonthSales) : 0.05;

  return {
    totalSalesAllTime,
    totalCommissionAllTime,
    currentMonthSales,
    currentRate,
    currentMonthCommission,
    salesByMonth,
  };
};
