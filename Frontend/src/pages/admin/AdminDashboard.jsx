import React, { useEffect, useState } from "react";
import {
  Package,
  Users,
  ShoppingCart,
  IndianRupee,
  MessageSquare,
} from "lucide-react";
// import { getProduct } from "../../api/ProductApi";
// import { getContact } from "../../api/ContactApi";
// import { allUsers } from "../../api/AuthApi";
// import { getAllOrders } from "../../api/OrderApi";
import {getDashboardData} from "../../api/DashboardApi"

const AdminDashboard = () => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalContacts, setTotalContacts] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const fetchData = async () => {
    try {
      const getInfo = await getDashboardData();
      setTotalProducts(getInfo.totalPro)
      setTotalOrders(getInfo.totalOrd);
      setTotalUsers(getInfo.totalUse);
      setTotalContacts(getInfo.totalCon);
      setTotalRevenue(getInfo.totalRev);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const cards = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: <Package size={28} />,
    },
    {
      title: "Total Users",
      value: totalUsers > 0 ? totalUsers - 1 : 0,
      icon: <Users size={28} />,
    },
    {
      title: "Total Orders",
      value: totalOrders,
      icon: <ShoppingCart size={28} />,
    },
    {
      title: "Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      icon: <IndianRupee size={28} />,
    },
    {
      title: "Contact Queries",
      value: totalContacts,
      icon: <MessageSquare size={28} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back! Here's an overview of your store.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="text-[#15877F]">{card.icon}</div>
              <span className="text-xs bg-[#15877F]/10 text-[#15877F] px-2 py-1 rounded-full">
                Store
              </span>
            </div>

            <h3 className="mt-4 text-gray-500 text-sm">{card.title}</h3>

            <p className="mt-2 text-3xl font-bold text-gray-800">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
