import React from "react";

const KpiCard = ({ title, value, icon: IconComponent, badge, change, comparisonLabel = "vs last month" }) => {
  const isPositive = typeof change === "number" && change > 0;
  const isNegative = typeof change === "number" && change < 0;
  const isZero = typeof change === "number" && change === 0;

  return (
    <div className="bg-white border border-light-border/60 rounded-3xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all duration-300 relative overflow-hidden group text-left flex flex-col justify-between h-full">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-light-border/30 group-hover:bg-primary transition-colors duration-300"></div>
      
      <div>
        <div className="flex items-center justify-between">
          <div className="text-primary bg-primary/5 border border-primary/10 w-9 h-9 rounded-xl flex items-center justify-center">
            {IconComponent && <IconComponent className="w-4.5 h-4.5" />}
          </div>
          {badge && (
            <span className="text-[8px] sm:text-[9px] font-extrabold uppercase bg-primary/5 text-primary border border-primary/10 px-2.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>

        <h3 className="mt-3.5 text-[10px] sm:text-xs font-extrabold text-muted-gray uppercase tracking-wider leading-none">
          {title}
        </h3>
        
        <p className="mt-2 text-lg sm:text-2xl font-black text-dark-navy tracking-tight break-words">
          {value}
        </p>
      </div>

      {typeof change === "number" && (
        <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold">
          {isPositive && (
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-0.5 font-bold">
              ↑ {change.toFixed(1)}%
            </span>
          )}
          {isNegative && (
            <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded-md flex items-center gap-0.5 font-bold">
              ↓ {Math.abs(change).toFixed(1)}%
            </span>
          )}
          {isZero && (
            <span className="text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md flex items-center gap-0.5 font-bold">
              ~ 0.0%
            </span>
          )}
          <span className="text-muted-gray">{comparisonLabel}</span>
        </div>
      )}
    </div>
  );
};

export default KpiCard;
