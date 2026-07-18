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
      icon: <Package size={16} />,
      colorClass: "bg-blue-50 text-blue-600 border-blue-100/50",
      accentBg: "bg-blue-500/5"
    },
    {
      id: "Active",
      title: "Active Products",
      value: activeProducts,
      icon: <CheckCircle size={16} />,
      colorClass: "bg-emerald-50 text-emerald-600 border-emerald-100/50",
      accentBg: "bg-emerald-500/5"
    },
    {
      id: "Low Stock",
      title: "Low Stock Products",
      value: lowStockProducts,
      icon: <AlertTriangle size={16} />,
      colorClass: "bg-amber-50 text-amber-600 border-amber-100/50",
      accentBg: "bg-amber-500/5"
    },
    {
      id: "Sold",
      title: "Out Of Stock Products",
      value: outOfStockProducts,
      icon: <XCircle size={16} />,
      colorClass: "bg-red-50 text-red-655 border-red-100/50",
      accentBg: "bg-red-500/5"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-dark-navy antialiased">
      {statCards.map((card) => {
        const isCurrentlyActive = activeFilter === card.id;
        return (
          <div
            key={card.title}
            onClick={() => onCardClick && onCardClick(card.id)}
            className={`flex flex-col p-5 bg-white border rounded-3xl shadow-2xs hover:shadow-md transition-all duration-300 cursor-pointer relative overflow-hidden group text-left ${
              isCurrentlyActive ? "border-primary ring-4 ring-primary/5 bg-primary/[0.01]" : "border-light-border/60"
            }`}
          >
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-light-border/20 group-hover:bg-primary transition-colors duration-300"></div>
            
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest block truncate">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg flex-shrink-0 flex items-center justify-center ${card.accentBg} ${card.colorClass.split(" ")[1]}`}>
                {card.icon}
              </div>
            </div>
            <span className="text-xl sm:text-3xl font-black text-dark-navy mt-3.5 leading-none">
              {card.value}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ProductStats;
