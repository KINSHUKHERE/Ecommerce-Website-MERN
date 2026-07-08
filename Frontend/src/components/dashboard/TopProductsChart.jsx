import React from "react";
import { Award, ShoppingCart } from "lucide-react";

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

      <div className="space-y-3 flex-1">
        {data.length === 0 ? (
          <div className="w-full h-48 flex flex-col items-center justify-center border border-dashed border-light-border/80 rounded-2xl p-6 bg-slate-50/50">
            <span className="text-3xl mb-2">🏆</span>
            <p className="text-xs font-bold text-muted-gray text-center">No sales recorded yet</p>
            <p className="text-[10px] text-muted-gray/80 mt-1 text-center font-medium">Rankings will update as checkout orders are processed.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((prod, index) => (
              <div
                key={index}
                className="p-3 bg-slate-50/65 border border-slate-100/50 rounded-2xl flex flex-col gap-2 hover:bg-slate-50/90 transition-colors shadow-2xs"
              >
                {/* Product details row */}
                <div className="flex justify-between items-center gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                      index === 0
                        ? "bg-amber-100 text-amber-700 border border-amber-200"
                        : index === 1
                        ? "bg-slate-200/80 text-slate-700 border border-slate-300"
                        : index === 2
                        ? "bg-orange-100 text-orange-700 border border-orange-200"
                        : "bg-slate-100 text-muted-gray border border-slate-200"
                    }`}>
                      {index + 1}
                    </span>
                    <span className="truncate text-xs font-bold text-dark-navy" title={prod.name}>
                      {prod.name}
                    </span>
                  </div>
                  
                  <span className="font-extrabold text-xs text-dark-navy shrink-0">
                    ₹{prod.revenue.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Progress bar and quantity row */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-slate-200/40 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${
                        index === 0
                          ? "from-amber-400 to-orange-500"
                          : index === 1
                          ? "from-slate-400 to-slate-500"
                          : index === 2
                          ? "from-orange-400 to-red-500"
                          : "from-primary to-primary-hover"
                      }`}
                      style={{ width: `${prod.percentage || 0}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-extrabold uppercase bg-white border border-slate-100 text-muted-gray px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                    <ShoppingCart size={9} /> {prod.quantity} sold
                  </span>
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
