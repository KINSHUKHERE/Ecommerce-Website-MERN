import { allUsers } from "./AuthApi";
import { getContact } from "./ContactApi";
import { getAllOrders } from "./OrderApi";
import { getProduct } from "./ProductApi";

export const getDashboardData = async () => {
  const [products, contacts, users, orders] = await Promise.all([
    getProduct(),
    getContact(),
    allUsers(),
    getAllOrders(),
  ]);

  const ordersList = orders.data.orders || [];

  return {
    totalPro: products.data.data.length,
    totalCon: contacts.data.contacts.length,
    totalUse: users.data.length,
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
  };
};
