import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const INVENTORY_COLORS = {
  "Healthy Stock": "#10B981",    // Emerald
  "Low Stock (<10)": "#F59E0B",  // Amber
  "Out of Stock": "#EF4444"      // Red
};

const InventoryChart = ({ data }) => {
  const activeData = data.filter((item) => item.value > 0);

  return (
    <div className="bg-white border border-light-border/60 rounded-3xl p-5 shadow-2xs text-left w-full h-full flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-extrabold text-dark-navy tracking-tight">
          Inventory Status
        </h3>
        <p className="text-xs text-muted-gray mt-0.5 font-medium">
          Health snapshot of listed product stock.
        </p>
      </div>

      <div className="w-full h-72 min-h-[280px] flex items-center justify-center">
        {activeData.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-light-border/80 rounded-2xl p-6 bg-slate-50/50">
            <span className="text-3xl mb-2">📦</span>
            <p className="text-xs font-bold text-muted-gray text-center">No products listed</p>
            <p className="text-[10px] text-muted-gray/80 mt-1 text-center font-medium font-bold">Add products to track inventory health profiles.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={activeData}
                cx="50%"
                cy="45%"
                innerRadius={58}
                outerRadius={83}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
              >
                {activeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={INVENTORY_COLORS[entry.name] || "#94A3B8"}
                  />
                ))}
              </Pie>
              <Tooltip
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
              <Legend
                verticalAlign="bottom"
                height={40}
                iconType="circle"
                wrapperStyle={{ fontSize: "10px", fontWeight: 700, color: "#64748B" }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default InventoryChart;
