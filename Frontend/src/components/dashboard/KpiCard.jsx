import React from "react";

const KpiCard = ({ title, value, icon: IconComponent, badge, change, loading = false, comparisonLabel = "vs last month" }) => {
  const isPositive = typeof change === "number" && change > 0;
  const isNegative = typeof change === "number" && change < 0;
  const isZero = typeof change === "number" && change === 0;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group text-left flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between">
          <div className="text-[#0F9D8A] bg-[#0F9D8A]/5 border border-[#0F9D8A]/10 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
            {IconComponent && <IconComponent className="w-5 h-5" />}
          </div>
          {badge && (
            <span className="text-[9px] font-extrabold uppercase bg-teal-50 text-[#0F9D8A] border border-[#0F9D8A]/10 px-2 py-0.5 rounded-full tracking-wider">
              {badge}
            </span>
          )}
        </div>

        <h3 className="mt-3 text-[11px] sm:text-xs font-extrabold text-muted-gray uppercase tracking-widest leading-none">
          {title}
        </h3>
        
        <p className="mt-1.5 text-xl sm:text-2xl font-black text-dark-navy tracking-tight leading-none break-words">
          {loading ? (
            <span className="inline-block h-6 w-16 bg-slate-200 rounded animate-pulse mt-1"></span>
          ) : (
            value
          )}
        </p>
      </div>

      {loading ? (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center h-[26px]">
          <span className="inline-block h-3.5 w-24 bg-slate-100 rounded animate-pulse"></span>
        </div>
      ) : typeof change === "number" && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold">
          {isPositive && (
            <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 font-extrabold">
              ↑ {change.toFixed(1)}%
            </span>
          )}
          {isNegative && (
            <span className="text-red-500 bg-red-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 font-extrabold">
              ↓ {Math.abs(change).toFixed(1)}%
            </span>
          )}
          {isZero && (
            <span className="text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 font-extrabold">
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
