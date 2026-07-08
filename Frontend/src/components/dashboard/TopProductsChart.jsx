import React from "react";
import { Award, ShoppingCart, IndianRupee } from "lucide-react";

const TopProductsChart = ({ data }) => {
  return (
    <div className="bg-white border border-light-border/60 rounded-3xl p-5 shadow-2xs text-left w-full h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-extrabold text-dark-navy tracking-tight">
            Top Performing Products
          </h3>
          <span className="text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Award size={10} /> Leaderboard
          </span>
        </div>
        <p className="text-xs text-muted-gray font-medium mb-5">
          Best selling listings ranked by item volume and billing share.
        </p>
      </div>

      <div className="space-y-4 flex-1">
        {data.length === 0 ? (
          <div className="w-full h-48 flex flex-col items-center justify-center border border-dashed border-light-border/80 rounded-2xl p-6 bg-slate-50/50">
            <span className="text-3xl mb-2">🏆</span>
            <p className="text-xs font-bold text-muted-gray text-center">No sales recorded yet</p>
            <p className="text-[10px] text-muted-gray/80 mt-1 text-center font-medium">Rankings will update as checkout orders are processed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((prod, index) => (
              <div key={index} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <div className="flex items-center gap-2.5 max-w-[70%]">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                      index === 0
                        ? "bg-amber-100 text-amber-600"
                        : index === 1
                        ? "bg-slate-100 text-slate-600"
                        : index === 2
                        ? "bg-amber-50 text-amber-700"
                        : "bg-slate-50 text-muted-gray"
                    }`}>
                      {index + 1}
                    </span>
                    <span className="truncate text-dark-navy hover:text-primary transition-colors cursor-default" title={prod.name}>
                      {prod.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-right">
                    <span className="text-[10px] text-muted-gray font-bold uppercase flex items-center gap-0.5 bg-slate-50 px-2 py-0.5 rounded-md">
                      <ShoppingCart size={8} /> {prod.quantity} sold
                    </span>
                    <span className="font-extrabold text-dark-navy flex items-center gap-0.5">
                      ₹{prod.revenue.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Progress bar meter */}
                <div className="w-full h-2 bg-slate-100/70 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${
                      index === 0
                        ? "from-teal-400 to-emerald-500"
                        : index === 1
                        ? "from-blue-400 to-indigo-500"
                        : index === 2
                        ? "from-cyan-400 to-blue-500"
                        : "from-slate-400 to-slate-500"
                    }`}
                    style={{ width: `${prod.percentage || 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopProductsChart;
