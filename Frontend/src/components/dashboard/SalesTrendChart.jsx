import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const SalesTrendChart = ({ data, timeFilter, setTimeFilter }) => {
  const formatCurrency = (val) => {
    return `₹${Number(val).toLocaleString("en-IN", {
      maximumFractionDigits: 0
    })}`;
  };

  const timeFilterOptions = [
    { label: "Today", value: "today" },
    { label: "7 Days", value: "7days" },
    { label: "30 Days", value: "30days" },
    { label: "6 Months", value: "6months" },
    { label: "This Year", value: "year" },
    { label: "All Time", value: "all" }
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-[20px] p-6 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left w-full h-full flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h3 className="text-sm font-extrabold text-dark-navy tracking-tight">
            Revenue & Sales Trend
          </h3>
          <p className="text-xs text-muted-gray mt-0.5 font-medium">
            Visual billing growth and billing transactions over time.
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {timeFilterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTimeFilter(opt.value)}
              className={`px-3 py-1 rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                timeFilter === opt.value
                  ? "bg-primary text-white shadow-xs"
                  : "bg-slate-50 hover:bg-slate-100 text-muted-gray border border-light-border/40"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-72 min-h-[280px]">
        {data.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-light-border/80 rounded-2xl p-6 bg-slate-50/50">
            <span className="text-3xl mb-2">📊</span>
            <p className="text-xs font-bold text-muted-gray text-center">No transactions in this period</p>
            <p className="text-[10px] text-muted-gray/80 mt-1 text-center">Sales charts will update as orders are created.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="label"
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
                tickFormatter={formatCurrency}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.96)",
                  border: "1px solid #E2E8F0",
                  borderRadius: "16px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
                  fontFamily: "inherit"
                }}
                formatter={(value) => [formatCurrency(value), "Revenue"]}
                labelStyle={{ fontWeight: 800, fontSize: "11px", color: "#0F172A", marginBottom: "4px" }}
                itemStyle={{ fontSize: "11px", fontWeight: 700 }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Area
                type="monotone"
                dataKey="value"
                name="Revenue Generated"
                stroke="#14B8A6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default SalesTrendChart;
