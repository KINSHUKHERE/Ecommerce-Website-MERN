import { allUsers, getVendorsApi } from "./AuthApi";
import { getContact } from "./ContactApi";
import { getAllOrders } from "./OrderApi";
import { getProduct } from "./ProductApi";

export const getDashboardData = async (user) => {
  const isVendor = user?.role === "vendor";

  if (isVendor) {
    const [products, orders] = await Promise.all([
      getProduct(user._id),
      getAllOrders(),
    ]);

    const ordersList = orders.data.orders || [];

    return {
      totalPro: products.data.data.length,
      totalCon: 0,
      totalUse: 0,
      totalOrd: ordersList.length,
      totalRev: ordersList.reduce(
        (acc, order) => {
          if (order.orderStatus === "Cancelled") {
            return acc;
          }
          return acc + (order.totalAmount || 0);
        },
        0,
      ),
      orders: ordersList,
      products: products.data.data,
      vendors: [],
      users: []
    };
  }

  // Super Admin view
  const [products, contacts, users, orders, vendorsRes] = await Promise.all([
    getProduct(),
    getContact(),
    allUsers(),
    getAllOrders(),
    getVendorsApi(),
  ]);

  const ordersList = orders.data.orders || [];
  const vendorsList = vendorsRes.data.vendors || [];
  const usersList = users.data || [];

  return {
    totalPro: products.data.data.length,
    totalCon: contacts.data.contacts.length,
    totalUse: usersList.filter(u => u.role === "user").length,
    totalOrd: ordersList.length,
    totalRev: ordersList.reduce(
      (acc, order) => {
        if (order.orderStatus === "Cancelled") {
          return acc;
        }
        return acc + (order.totalAmount || 0);
      },
      0,
    ),
    totalVendors: vendorsList.length,
    pendingVendors: vendorsList.filter(v => v.vendorStatus === "pending").length,
    activeVendors: vendorsList.filter(v => v.vendorStatus === "active").length,
    suspendedVendors: vendorsList.filter(v => v.vendorStatus === "suspended").length,
    orders: ordersList,
    products: products.data.data,
    vendors: vendorsList,
    users: usersList
  };
};
