import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

const CategoryChart = ({ data }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-[20px] p-6 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left w-full h-full flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-extrabold text-dark-navy tracking-tight">
          Products by Category
        </h3>
        <p className="text-xs text-muted-gray mt-0.5 font-medium">
          Total items catalog distribution in store inventory.
        </p>
      </div>

      <div className="w-full h-72 min-h-[280px]">
        {data.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-light-border/80 rounded-2xl p-6 bg-slate-50/50">
            <span className="text-3xl mb-2">📁</span>
            <p className="text-xs font-bold text-muted-gray text-center">No categories mapped</p>
            <p className="text-[10px] text-muted-gray/80 mt-1 text-center font-medium">Categorization will register once products are listed.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="name"
                stroke="#64748B"
                fontSize={10}
                fontWeight={700}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#64748B"
                fontSize={10}
                fontWeight={700}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
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
                labelStyle={{ fontWeight: 800, fontSize: "11px", color: "#0F172A", marginBottom: "4px" }}
                itemStyle={{ fontSize: "11px", fontWeight: 700 }}
              />
              <Bar dataKey="value" name="Products Count" radius={[6, 6, 0, 0]} fill="#06B6D4">
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index % 2 === 0 ? "#06B6D4" : "#0E7490"}
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

export default CategoryChart;
