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
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight">
          Admin Dashboard
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1 max-w-2xl">
          Welcome back! Here's an overview of your store.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md p-4 sm:p-6 hover:shadow-xl transition duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="text-[#15877F] scale-90 sm:scale-100 origin-left">{card.icon}</div>
              <span className="text-[10px] sm:text-xs bg-[#15877F]/10 text-[#15877F] px-2 py-1 rounded-full whitespace-nowrap">
                Store
              </span>
            </div>

            <h3 className="mt-3 sm:mt-4 text-gray-500 text-[11px] sm:text-sm leading-snug">
              {card.title}
            </h3>

            <p className="mt-2 text-lg sm:text-2xl xl:text-3xl font-bold text-gray-800 break-words">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
