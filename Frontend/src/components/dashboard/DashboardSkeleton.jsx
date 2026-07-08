import React from "react";

const DashboardSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse text-left w-full">
      {/* Header Skeleton */}
      <div className="mb-4 sm:mb-8 border-b border-light-border/40 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-72 bg-slate-100 rounded-lg"></div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-light-border/60 rounded-3xl p-4 sm:p-5 shadow-2xs relative overflow-hidden space-y-3">
            <div className="flex justify-between items-center">
              <div className="w-8 h-8 rounded-xl bg-slate-200"></div>
              <div className="h-4 w-12 bg-slate-100 rounded-full"></div>
            </div>
            <div className="h-3 w-20 bg-slate-100 rounded-lg"></div>
            <div className="h-7 w-28 bg-slate-200 rounded-lg"></div>
            <div className="h-3.5 w-32 bg-slate-100 rounded-lg"></div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white border border-light-border/60 rounded-3xl p-5 shadow-2xs space-y-4 min-h-[300px]">
          <div className="h-4 w-32 bg-slate-200 rounded-lg"></div>
          <div className="h-64 w-full bg-slate-100 rounded-2xl"></div>
        </div>
        <div className="bg-white border border-light-border/60 rounded-3xl p-5 shadow-2xs space-y-4 min-h-[300px]">
          <div className="h-4 w-32 bg-slate-200 rounded-lg"></div>
          <div className="h-64 w-full bg-slate-100 rounded-2xl"></div>
        </div>
      </div>

      {/* Tables and List Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white border border-light-border/60 rounded-3xl p-5 shadow-2xs space-y-4">
          <div className="h-4 w-32 bg-slate-200 rounded-lg"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 w-full bg-slate-100 rounded-xl"></div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-light-border/60 rounded-3xl p-5 shadow-2xs space-y-4">
          <div className="h-4 w-32 bg-slate-200 rounded-lg"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0"></div>
                <div className="space-y-1.5 w-full">
                  <div className="h-3 w-3/4 bg-slate-200 rounded-lg"></div>
                  <div className="h-2.5 w-1/2 bg-slate-100 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
