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
      iconClass: Package,
      badge: "Catalog",
    },
    {
      title: "Total Users",
      value: totalUsers > 0 ? totalUsers - 1 : 0,
      iconClass: Users,
      badge: "Accounts",
    },
    {
      title: "Total Orders",
      value: totalOrders,
      iconClass: ShoppingCart,
      badge: "Sales",
    },
    {
      title: "Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      iconClass: IndianRupee,
      badge: "Revenue",
    },
    {
      title: "Contact Queries",
      value: totalContacts,
      iconClass: MessageSquare,
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
        <h1 className="text-xl sm:text-3xl font-extrabold text-dark-navy tracking-tight leading-tight">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="text-xs sm:text-sm text-muted-gray mt-1.5 font-medium leading-relaxed">
          Here's a comprehensive snapshot of your YoCart store's performance, catalog overview, and customer inquiries.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-3">
        {cards.map((card, index) => {
          const IconComponent = card.iconClass;
          return (
            <div
              key={index}
              className="bg-white border border-light-border/60 rounded-3xl p-4 sm:p-6 shadow-2xs hover:shadow-md transition-all duration-300 text-left relative overflow-hidden group"
            >
              {/* Corner Decorative Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-light-border/30 group-hover:bg-primary transition-colors duration-300"></div>
              
              <div className="flex items-center justify-between">
                <div className="text-primary bg-primary/5 border border-primary/10 w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[8px] sm:text-[10px] font-extrabold uppercase bg-primary/5 text-primary border border-primary/10 px-2 sm:px-2.5 py-0.5 rounded-full">
                  {card.badge}
                </span>
              </div>

              <h3 className="mt-3 text-[9px] sm:text-xs font-extrabold text-muted-gray uppercase tracking-wider leading-none">
                {card.title}
              </h3>

              <p className="mt-2 text-base sm:text-3xl font-black text-dark-navy tracking-tight break-words">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboard;
