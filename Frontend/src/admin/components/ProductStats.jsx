import React from "react";
import { Package, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

const ProductStats = ({ products = [], activeFilter = "", onCardClick }) => {
  const getProductTotalStock = (product) => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    }
    return product.quantity ?? 0;
  };

  const getProductStatus = (item) => {
    const qty = getProductTotalStock(item);
    if (qty <= 0 || item.sold) return "Sold";
    if (qty <= 3) return "Low Stock";
    return "In Stock";
  };

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => getProductStatus(p) !== "Sold").length;
  const lowStockProducts = products.filter((p) => getProductStatus(p) === "Low Stock").length;
  const outOfStockProducts = products.filter((p) => getProductStatus(p) === "Sold").length;

  const statCards = [
    {
      id: "",
      title: "Total Products",
      value: totalProducts,
      icon: <Package size={20} />,
      colorClass: "bg-blue-50 text-blue-600 border-blue-100",
      accentBg: "bg-blue-500/10"
    },
    {
      id: "Active",
      title: "Active Products",
      value: activeProducts,
      icon: <CheckCircle size={20} />,
      colorClass: "bg-green-50 text-green-600 border-green-100",
      accentBg: "bg-green-500/10"
    },
    {
      id: "Low Stock",
      title: "Low Stock Products",
      value: lowStockProducts,
      icon: <AlertTriangle size={20} />,
      colorClass: "bg-amber-50 text-amber-600 border-amber-100",
      accentBg: "bg-amber-500/10"
    },
    {
      id: "Sold",
      title: "Out Of Stock Products",
      value: outOfStockProducts,
      icon: <XCircle size={20} />,
      colorClass: "bg-red-50 text-red-650 border-red-100",
      accentBg: "bg-red-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((card) => {
        const isCurrentlyActive = activeFilter === card.id;
        return (
          <div
            key={card.title}
            onClick={() => onCardClick && onCardClick(card.id)}
            className={`flex flex-col p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
              isCurrentlyActive ? "border-[#088178] ring-2 ring-[#088178]/5" : "border-gray-150"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg ${card.accentBg} ${card.colorClass.split(" ")[1]}`}>
                {card.icon}
              </div>
            </div>
            <span className="text-2xl font-extrabold text-gray-900 mt-2.5 leading-none">
              {card.value}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ProductStats;
