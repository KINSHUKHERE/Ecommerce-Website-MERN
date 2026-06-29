import React, { useEffect, useState } from "react";
import {
  Package,
  Users,
  ShoppingCart,
  IndianRupee,
  MessageSquare,
} from "lucide-react";
import { getDashboardData } from "../../api/DashboardApi";

const AdminDashboard = () => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalContacts, setTotalContacts] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const fetchData = async () => {
    try {
      const getInfo = await getDashboardData();
      setTotalProducts(getInfo.totalPro);
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
      icon: <Package size={20} />,
      badge: "Catalog",
    },
    {
      title: "Total Users",
      value: totalUsers > 0 ? totalUsers - 1 : 0,
      icon: <Users size={20} />,
      badge: "Accounts",
    },
    {
      title: "Total Orders",
      value: totalOrders,
      icon: <ShoppingCart size={20} />,
      badge: "Sales",
    },
    {
      title: "Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: <IndianRupee size={20} />,
      badge: "Revenue",
    },
    {
      title: "Contact Queries",
      value: totalContacts,
      icon: <MessageSquare size={20} />,
      badge: "Support",
    },
  ];

  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Admin",
    role: "admin",
  };
  const firstName = user?.name ? user.name.split(" ")[0] : "Admin";

  return (
    <div className="space-y-6 text-dark-navy antialiased">
      {/* Header */}
      <div className="mb-4 sm:mb-8 text-left">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-navy tracking-tight leading-tight">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="text-xs sm:text-sm text-muted-gray mt-1.5 font-medium leading-relaxed">
          Here's a comprehensive snapshot of your YoCart store's performance, catalog overview, and customer inquiries.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-3">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white border border-light-border/60 rounded-3xl p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all duration-300 text-left relative overflow-hidden group"
          >
            {/* Corner Decorative Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-light-border/30 group-hover:bg-primary transition-colors duration-300"></div>
            
            <div className="flex items-center justify-between">
              <div className="text-primary bg-primary/5 border border-primary/10 w-10 h-10 rounded-2xl flex items-center justify-center">
                {card.icon}
              </div>
              <span className="text-[10px] sm:text-xs font-extrabold uppercase bg-primary/5 text-primary border border-primary/10 px-2.5 py-0.5 rounded-full">
                {card.badge}
              </span>
            </div>

            <h3 className="mt-4 text-xs font-extrabold text-muted-gray uppercase tracking-widest leading-none">
              {card.title}
            </h3>

            <p className="mt-2 text-xl sm:text-3xl font-black text-dark-navy tracking-tight break-words">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
