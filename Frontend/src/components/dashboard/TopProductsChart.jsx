import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid
} from "recharts";

const TopProductsChart = ({ data }) => {
  return (
    <div className="bg-white border border-light-border/60 rounded-3xl p-5 shadow-2xs text-left w-full h-full flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-extrabold text-dark-navy tracking-tight">
          Top Selling Products
        </h3>
        <p className="text-xs text-muted-gray mt-0.5 font-medium">
          Best performing items by orders item count sold.
        </p>
      </div>

      <div className="w-full h-72 min-h-[280px]">
        {data.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-light-border/80 rounded-2xl p-6 bg-slate-50/50">
            <span className="text-3xl mb-2">🏆</span>
            <p className="text-xs font-bold text-muted-gray text-center">No products sold yet</p>
            <p className="text-[10px] text-muted-gray/80 mt-1 text-center font-medium">Top selling leaderboards require completed order purchases.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
              <XAxis
                type="number"
                stroke="#64748B"
                fontSize={10}
                fontWeight={700}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#64748B"
                fontSize={9}
                fontWeight={700}
                tickLine={false}
                axisLine={false}
                width={85}
              />
              <Tooltip
                cursor={{ fill: "rgba(15, 23, 42, 0.02)" }}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.96)",
                  border: "1px solid #E2E8F0",
                  borderRadius: "16px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
                  fontFamily: "inherit"
                }}
                labelStyle={{ fontWeight: 800, fontSize: "11px", color: "#0F172A" }}
                itemStyle={{ fontSize: "11px", fontWeight: 700 }}
              />
              <Bar dataKey="value" name="Units Sold" radius={[0, 6, 6, 0]} fill="#3B82F6">
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? "#10B981" : index === 1 ? "#3B82F6" : index === 2 ? "#06B6D4" : "#8B5CF6"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default TopProductsChart;
