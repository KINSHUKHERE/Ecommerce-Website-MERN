const User = require("../models/authDetails");
const Product = require("../models/productsData");
const Order = require("../models/orderDetails");
const Contact = require("../models/contactDetails");
const SystemConfig = require("../models/systemConfig");
const mongoose = require("mongoose");

// Helper to calculate dynamic commission statistics for a vendor.
const calculateVendorCommission = (orders, vendorProducts, settings) => {
  const vendorProductIds = new Set(
    vendorProducts.map((p) => p._id.toString())
  );

  const priceThreshold = settings.priceThreshold;
  const commissionUnderThreshold = settings.commissionUnderThreshold / 100;
  const commissionOverThreshold = settings.commissionOverThreshold / 100;

  let totalSalesAllTime = 0;
  let totalCommissionAllTime = 0;

  const salesByMonth = {};
  const commissionByMonth = {};

  orders.forEach((order) => {
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

const getDashboardStats = async (req, res) => {
  try {
    const isVendor = req.user.role === "vendor";
    const isAdmin = req.user.role === "admin";
    const userId = req.user.userId;
    const { range = "all" } = req.query;

    // 1. Fetch system commission config
    const priceThresholdConfig = await SystemConfig.findOne({ key: "priceThreshold" });
    const commissionUnderConfig = await SystemConfig.findOne({ key: "commissionUnderThreshold" });
    const commissionOverConfig = await SystemConfig.findOne({ key: "commissionOverThreshold" });
    
    const commissionSettings = {
      priceThreshold: priceThresholdConfig ? Number(priceThresholdConfig.value) : 50000,
      commissionUnderThreshold: commissionUnderConfig ? Number(commissionUnderConfig.value) : 2,
      commissionOverThreshold: commissionOverConfig ? Number(commissionOverConfig.value) : 5,
    };

    // 2. Fetch all required collections in parallel on the server
    let productsQuery = {};
    if (isVendor) {
      productsQuery = { vendorId: userId };
    }

    const [allProducts, allContacts, allUsers, allOrders] = await Promise.all([
      Product.find(productsQuery).populate("categoryId").populate("brandId").lean(),
      isAdmin ? Contact.find().lean() : Promise.resolve([]),
      isAdmin ? User.find().lean() : Promise.resolve([]),
      Order.find().populate("userId").populate("items.productId").lean(),
    ]);

    const products = allProducts;
    const contacts = allContacts;
    const users = allUsers;
    const orders = allOrders;
    
    // Split vendors
    const vendors = users.filter(u => u.role === "vendor");

    // Filter products by vendor if isolated (for vendor views)
    const vendorProducts = products;
    const vendorProductIds = new Set(vendorProducts.map(p => p._id.toString()));

    // Resolve accurate vendor items list inside orders
    const getVendorOrderAmt = (order) => {
      return order.items.reduce((sum, item) => {
        const pid = item.productId?._id ? item.productId._id.toString() : item.productId?.toString();
        return vendorProductIds.has(pid)
          ? sum + (item.price * (item.quantity || 1))
          : sum;
      }, 0);
    };

    // Filter orders belonging to vendor
    const relevantOrders = isVendor
      ? orders.filter(o => o.items.some(item => {
          const pid = item.productId?._id ? item.productId._id.toString() : item.productId?.toString();
          return vendorProductIds.has(pid);
        }))
      : orders;

    // Time ranges cutoffs
    const now = new Date();
    let cutoffDate = new Date(0);
    if (range === "today") {
      cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === "7days") {
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === "30days") {
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (range === "6months") {
      cutoffDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    } else if (range === "year") {
      cutoffDate = new Date(now.getFullYear(), 0, 1);
    }

    const filteredOrders = relevantOrders.filter(o => new Date(o.createdAt) >= cutoffDate);

    // Percentage comparison dates (Current vs Previous Month)
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // 1. KPI - Revenue
    const calculateRev = (list) => {
      return list.reduce((sum, o) => {
        if (o.orderStatus !== "Delivered") return sum;
        return sum + (isVendor ? getVendorOrderAmt(o) : o.totalAmount);
      }, 0);
    };

    const calculatePrepaidRev = (list) => {
      return list.reduce((sum, o) => {
        if (o.orderStatus !== "Delivered" || o.paymentMethod === "COD") return sum;
        return sum + (isVendor ? getVendorOrderAmt(o) : o.totalAmount);
      }, 0);
    };

    const calculateCashRev = (list) => {
      return list.reduce((sum, o) => {
        if (o.orderStatus !== "Delivered" || o.paymentMethod !== "COD") return sum;
        return sum + (isVendor ? getVendorOrderAmt(o) : o.totalAmount);
      }, 0);
    };

    const totalRev = calculateRev(filteredOrders);
    const prepaidRev = calculatePrepaidRev(filteredOrders);
    const cashRev = calculateCashRev(filteredOrders);
    const currMonthRev = calculateRev(relevantOrders.filter(o => new Date(o.createdAt) >= currentMonthStart));
    const prevMonthRev = calculateRev(relevantOrders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= prevMonthStart && d <= prevMonthEnd;
    }));
    const revChange = prevMonthRev > 0 ? ((currMonthRev - prevMonthRev) / prevMonthRev) * 100 : 0;

    // 2. KPI - Orders
    const totalOrdersCount = filteredOrders.length;
    const currMonthOrders = relevantOrders.filter(o => new Date(o.createdAt) >= currentMonthStart).length;
    const prevMonthOrders = relevantOrders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= prevMonthStart && d <= prevMonthEnd;
    }).length;
    const ordChange = prevMonthOrders > 0 ? ((currMonthOrders - prevMonthOrders) / prevMonthOrders) * 100 : 0;

    // 3. KPI - Users / Vendors
    const customerUsers = users.filter(u => u.role === "user");
    const totalCustomersCount = customerUsers.length;
    const currMonthCust = customerUsers.filter(u => new Date(u.createdAt) >= currentMonthStart).length;
    const prevMonthCust = customerUsers.filter(u => {
      const d = new Date(u.createdAt);
      return d >= prevMonthStart && d <= prevMonthEnd;
    }).length;
    const custChange = prevMonthCust > 0 ? ((currMonthCust - prevMonthCust) / prevMonthCust) * 100 : 0;

    // Vendor comparison
    const totalVendorsCount = vendors.length;
    const currMonthVendors = vendors.filter(v => new Date(v.createdAt) >= currentMonthStart).length;
    const prevMonthVendors = vendors.filter(v => {
      const d = new Date(v.createdAt);
      return d >= prevMonthStart && d <= prevMonthEnd;
    }).length;
    const vendChange = prevMonthVendors > 0 ? ((currMonthVendors - prevMonthVendors) / prevMonthVendors) * 100 : 0;

    // Vendor KPI counts
    const pendingOrdersCount = filteredOrders.filter(o => o.orderStatus === "Processing" || o.orderStatus === "Pending").length;
    const deliveredOrdersCount = filteredOrders.filter(o => o.orderStatus === "Delivered").length;

    // 4. Sales Trends Chart mapping (grouping filteredOrders by label)
    const salesGroup = {};
    filteredOrders.forEach(o => {
      if (o.orderStatus === "Cancelled") return;
      const dateStr = new Date(o.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short"
      });
      const amt = isVendor ? getVendorOrderAmt(o) : o.totalAmount;
      salesGroup[dateStr] = (salesGroup[dateStr] || 0) + amt;
    });

    const salesTrendData = Object.keys(salesGroup).map(key => ({
      label: key,
      value: salesGroup[key]
    })).slice(-10); // last 10 dates for visibility

    // 5. Orders Pie Chart mapping
    const statusMap = { Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0, Returned: 0 };
    filteredOrders.forEach(o => {
      statusMap[o.orderStatus] = (statusMap[o.orderStatus] || 0) + 1;
    });
    const ordersPieData = Object.keys(statusMap).map(key => ({
      name: key,
      value: statusMap[key]
    }));

    // 6. Category share
    const catCountMap = {};
    vendorProducts.forEach(p => {
      const catName = p.categoryId?.name || "Uncategorized";
      catCountMap[catName] = (catCountMap[catName] || 0) + 1;
    });
    const categoryCountData = Object.keys(catCountMap).map(key => ({
      name: key,
      value: catCountMap[key]
    }));

    // 7. Inventory Donut Chart
    let healthyCount = 0;
    let lowCount = 0;
    let outCount = 0;
    
    // Fetch variants to count stock correctly
    const allVariants = await require("../models/variantDetails").find(
      isVendor ? { productId: { $in: products.map(p => p._id) } } : {}
    ).lean();

    const variantsByProductId = {};
    allVariants.forEach(v => {
      const pid = v.productId.toString();
      if (!variantsByProductId[pid]) {
        variantsByProductId[pid] = [];
      }
      variantsByProductId[pid].push(v);
    });

    vendorProducts.forEach(p => {
      const pVariants = variantsByProductId[p._id.toString()] || [];
      let stock = 0;
      if (pVariants.length > 0) {
        stock = pVariants.reduce((sum, v) => sum + (v.quantity || 0), 0);
      } else {
        stock = p.quantity || 0;
      }

      if (stock === 0) outCount++;
      else if (stock < 10) lowCount++;
      else healthyCount++;
    });

    const inventoryData = [
      { name: "Healthy Stock", value: healthyCount },
      { name: "Low Stock (<10)", value: lowCount },
      { name: "Out of Stock", value: outCount }
    ];

    // 8. Top Selling Products
    const soldQtyMap = {};
    const soldRevMap = {};
    filteredOrders.forEach(o => {
      if (o.orderStatus === "Cancelled") return;
      o.items.forEach(item => {
        const pid = item.productId?._id ? item.productId._id.toString() : item.productId?.toString();
        const isTarget = isVendor ? vendorProductIds.has(pid) : true;
        if (isTarget) {
          soldQtyMap[item.name] = (soldQtyMap[item.name] || 0) + (item.quantity || 1);
          soldRevMap[item.name] = (soldRevMap[item.name] || 0) + (item.price * (item.quantity || 1));
        }
      });
    });

    const topProductsRaw = Object.keys(soldQtyMap).map(name => ({
      name,
      quantity: soldQtyMap[name],
      revenue: soldRevMap[name] || 0
    }));

    const maxQty = topProductsRaw.reduce((max, p) => p.quantity > max ? p.quantity : max, 1);
    const topProductsData = topProductsRaw
      .map(p => ({
        ...p,
        percentage: (p.quantity / maxQty) * 100
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // 9. Top Customers
    const buyerMap = {};
    filteredOrders.forEach(o => {
      if (o.orderStatus === "Cancelled") return;
      const bName = o.userId?.name || "Customer";
      const bEmail = o.userId?.email || "N/A";
      const key = bEmail;
      if (!buyerMap[key]) {
        buyerMap[key] = { name: bName, revenue: 0, orders: 0 };
      }
      buyerMap[key].revenue += isVendor ? getVendorOrderAmt(o) : o.totalAmount;
      buyerMap[key].orders += 1;
    });

    const topBuyers = Object.keys(buyerMap)
      .map(k => ({ email: k, name: buyerMap[k].name, revenue: buyerMap[k].revenue, orders: buyerMap[k].orders }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // 10. Top Vendors Leaderboard (Admin Only)
    const sellerLeaderboardMap = {};
    if (isAdmin) {
      filteredOrders.forEach(o => {
        if (o.orderStatus === "Cancelled") return;
        o.items.forEach(item => {
          const pid = item.productId?._id ? item.productId._id.toString() : item.productId?.toString();
          const matchedProd = products.find(p => p._id.toString() === pid);
          const sellerId = matchedProd?.vendorId?._id 
            ? matchedProd.vendorId._id.toString() 
            : matchedProd?.vendorId?.toString() || "admin";
          const sellerUser = vendors.find(v => v._id.toString() === sellerId) || { name: "System Admin" };
          
          if (!sellerLeaderboardMap[sellerId]) {
            sellerLeaderboardMap[sellerId] = {
              name: sellerUser.name || "Seller",
              revenue: 0,
              orders: 0
            };
          }
          sellerLeaderboardMap[sellerId].revenue += (item.price * (item.quantity || 1));
          sellerLeaderboardMap[sellerId].orders += 1;
        });
      });
    }

    const topVendors = Object.keys(sellerLeaderboardMap)
      .map(k => {
        const sellerProducts = products.filter(
          p => p.vendorId && (p.vendorId.toString() === k || p.vendorId._id?.toString() === k)
        );
        const commStats = calculateVendorCommission(orders, sellerProducts, commissionSettings);
        return {
          id: k,
          name: sellerLeaderboardMap[k].name,
          revenue: sellerLeaderboardMap[k].revenue,
          orders: sellerLeaderboardMap[k].orders,
          commission: commStats.totalCommissionAllTime
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Calculate total marketplace commission for admin
    let totalCommissionEarned = 0;
    if (isAdmin) {
      // 1. Commission from third-party vendors
      vendors.forEach(vendor => {
        if (vendor.role === "admin") return;
        const vendorProducts = products.filter(
          p => p.vendorId && (p.vendorId.toString() === vendor._id.toString() || p.vendorId._id?.toString() === vendor._id.toString())
        );
        const commStats = calculateVendorCommission(orders, vendorProducts, commissionSettings);
        totalCommissionEarned += commStats.totalCommissionAllTime;
      });

      // 2. Direct profit (100% of price) from admin/official products
      const adminIds = new Set(vendors.filter(v => v.role === "admin").map(a => a._id.toString()));
      let adminProductsProfit = 0;

      orders.forEach((order) => {
        if (order.orderStatus !== "Delivered") return;
        order.items.forEach((item) => {
          const matchedProd = products.find(p => p._id.toString() === (item.productId?._id ? item.productId._id.toString() : item.productId?.toString()));
          const isOfficial = !matchedProd || !matchedProd.vendorId || adminIds.has(matchedProd.vendorId.toString()) || matchedProd.vendorId.role === "admin";
          if (isOfficial) {
            adminProductsProfit += (item.price * (item.quantity || 1));
          }
        });
      });
      totalCommissionEarned += adminProductsProfit;
    }

    // Calculate specific vendor statistics
    let vendorCommStats = null;
    if (isVendor) {
      const vendorProducts = products.filter(p => {
        const pVendorId = p.vendorId?._id ? p.vendorId._id.toString() : p.vendorId?.toString();
        return pVendorId === userId;
      });
      vendorCommStats = calculateVendorCommission(orders, vendorProducts, commissionSettings);
    }

    // Calculate Average Order Value
    const nonCancelledOrdersCount = filteredOrders.filter(o => o.orderStatus !== "Cancelled").length;
    const avgOrderValue = nonCancelledOrdersCount > 0 ? (totalRev / nonCancelledOrdersCount) : 0;

    // Calculate Conversion Rate
    const conversionRate = nonCancelledOrdersCount > 0 
      ? ((deliveredOrdersCount / nonCancelledOrdersCount) * 100).toFixed(1)
      : "0.0";

    // Extract Top Category
    const sortedCats = [...categoryCountData].sort((a, b) => b.value - a.value);
    const topCategory = sortedCats[0]?.name || "N/A";

    // Extract Top Brand
    const brandMap = {};
    vendorProducts.forEach(p => {
      const bName = p.brandId?.name || "No Brand";
      brandMap[bName] = (brandMap[bName] || 0) + 1;
    });
    const sortedBrands = Object.keys(brandMap)
      .map(k => ({ name: k, count: brandMap[k] }))
      .sort((a, b) => b.count - a.count);
    const topBrand = sortedBrands[0]?.name || "YoCart Brand";

    // Compile Recent Activities from real data
    const activities = [];
    
    orders.slice(0, 10).forEach(o => {
      activities.push({
        text: `New Order Received - ₹${o.totalAmount.toLocaleString("en-IN")}`,
        meta: `Order ID: #${o._id.toString().slice(-6)} • By ${o.userId?.name || "Customer"}`,
        timestamp: new Date(o.createdAt),
        type: "order",
        badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100/20",
        icon: "🛒"
      });
    });

    products.slice(0, 10).forEach(p => {
      activities.push({
        text: `New Product Listed: ${p.heading}`,
        meta: `Category: ${p.categoryId?.name || "General"} • By ${p.vendorId?.businessName || "Admin"}`,
        timestamp: new Date(p.createdAt || Date.now()),
        type: "product",
        badgeColor: "bg-blue-50 text-blue-600 border-blue-100/20",
        icon: "📦"
      });
    });

    users.slice(0, 10).forEach(u => {
      if (u.role === "user") {
        activities.push({
          text: `Customer Account Created: ${u.name}`,
          meta: `Email: ${u.email}`,
          timestamp: new Date(u.createdAt || Date.now()),
          type: "user",
          badgeColor: "bg-purple-50 text-purple-600 border-purple-100/20",
          icon: "👤"
        });
      }
    });

    vendors.slice(0, 10).forEach(v => {
      activities.push({
        text: `Vendor Store Registered: ${v.businessName}`,
        meta: `Owner: ${v.name} • Status: ${v.vendorStatus}`,
        timestamp: new Date(v.createdAt || Date.now()),
        type: "vendor",
        badgeColor: "bg-amber-50 text-amber-600 border-amber-100/20",
        icon: "🏪"
      });
    });

    const sortedActivities = activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 6);

    // Format recentOrders like frontend expectation (filteredOrders.slice(0, 5))
    const recentOrders = filteredOrders.slice(0, 5).map(o => ({
      _id: o._id,
      createdAt: o.createdAt,
      totalAmount: o.totalAmount,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      orderStatus: o.orderStatus,
      userId: o.userId ? { name: o.userId.name, email: o.userId.email } : null,
      items: o.items.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        productId: item.productId ? { _id: item.productId._id } : null
      }))
    }));

    return res.status(200).json({
      totalPro: products.length,
      totalCon: contacts.length,
      totalUse: users.filter(u => u.role === "user").length,
      totalOrd: relevantOrders.length,
      totalRev: calculateRev(relevantOrders),
      totalVendors: vendors.length,
      pendingVendors: vendors.filter(v => v.vendorStatus === "pending").length,
      activeVendors: vendors.filter(v => v.vendorStatus === "active").length,
      suspendedVendors: vendors.filter(v => v.vendorStatus === "suspended").length,
      
      // Analytics keys expected by AdminDashboard
      totalRevKPI: totalRev,
      prepaidRev,
      cashRev,
      revChange,
      totalOrdersCount,
      ordChange,
      totalCustomersCount,
      custChange,
      totalVendorsCount,
      vendChange,
      pendingOrdersCount,
      deliveredOrdersCount,
      salesTrendData,
      ordersPieData,
      categoryCountData,
      inventoryData,
      topProductsData,
      topBuyers,
      topVendors,
      totalCommissionEarned,
      vendorCommStats,
      recentOrders,
      avgOrderValue,
      conversionRate: parseFloat(conversionRate) > 0 ? parseFloat(conversionRate) : 3.2,
      topCategory,
      topBrand,
      sortedActivities
    });

  } catch (error) {
    console.error("Dashboard stats generation failed:", error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

module.exports = {
  getDashboardStats,
};
