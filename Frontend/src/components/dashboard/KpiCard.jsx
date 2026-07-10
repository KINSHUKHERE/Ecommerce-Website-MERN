import React from "react";

const KpiCard = ({ title, value, icon: IconComponent, badge, change, comparisonLabel = "vs last month" }) => {
  const isPositive = typeof change === "number" && change > 0;
  const isNegative = typeof change === "number" && change < 0;
  const isZero = typeof change === "number" && change === 0;

  return (
    <div className="bg-white border border-slate-200/80 rounded-[20px] p-6 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group text-left flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between">
          <div className="text-[#0F9D8A] bg-[#0F9D8A]/5 border border-[#0F9D8A]/10 w-12 h-12 rounded-full flex items-center justify-center shrink-0">
            {IconComponent && <IconComponent className="w-6 h-6" />}
          </div>
          {badge && (
            <span className="text-[10px] font-extrabold uppercase bg-teal-50 text-[#0F9D8A] border border-[#0F9D8A]/10 px-2.5 py-0.5 rounded-full tracking-wider">
              {badge}
            </span>
          )}
        </div>

        <h3 className="mt-4 text-[13px] font-extrabold text-muted-gray uppercase tracking-widest leading-none">
          {title}
        </h3>
        
        <p className="mt-2.5 text-[34px] font-black text-dark-navy tracking-tight leading-none break-words">
          {value}
        </p>
      </div>

      {typeof change === "number" && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-[13px] font-semibold">
          {isPositive && (
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-0.5 font-extrabold">
              ↑ {change.toFixed(1)}%
            </span>
          )}
          {isNegative && (
            <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded-md flex items-center gap-0.5 font-extrabold">
              ↓ {Math.abs(change).toFixed(1)}%
            </span>
          )}
          {isZero && (
            <span className="text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md flex items-center gap-0.5 font-extrabold">
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
