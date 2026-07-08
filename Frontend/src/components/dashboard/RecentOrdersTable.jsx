import React from "react";

const getStatusBadgeClass = (status) => {
  switch (status) {
    case "Delivered":
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    case "Shipped":
      return "bg-cyan-50 text-cyan-600 border-cyan-100";
    case "Processing":
      return "bg-blue-50 text-blue-600 border-blue-100";
    case "Cancelled":
      return "bg-red-50 text-red-500 border-red-100";
    default:
      return "bg-slate-50 text-slate-600 border-slate-100";
  }
};

const RecentOrdersTable = ({ orders }) => {
  return (
    <div className="bg-white border border-light-border/60 rounded-3xl p-5 shadow-2xs text-left w-full h-full flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-extrabold text-dark-navy tracking-tight">
          Recent Orders
        </h3>
        <p className="text-xs text-muted-gray mt-0.5 font-medium mb-4">
          Latest checkout transaction purchases in shop.
        </p>
      </div>

      <div className="overflow-x-auto w-full">
        {orders.length === 0 ? (
          <div className="w-full py-10 flex flex-col items-center justify-center border border-dashed border-light-border/80 rounded-2xl p-6 bg-slate-50/50">
            <span className="text-3xl mb-2">🛍️</span>
            <p className="text-xs font-bold text-muted-gray text-center">No orders recorded</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-light-border/40 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest">
                <th className="pb-3.5 pl-1">Order ID</th>
                <th className="pb-3.5">Customer</th>
                <th className="pb-3.5">Status</th>
                <th className="pb-3.5 text-right pr-1">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order._id} className="text-xs font-semibold text-dark-navy hover:bg-slate-50/40 transition-colors">
                  <td className="py-3.5 pl-1 font-mono text-[10px] text-muted-gray">
                    #{order._id.substring(order._id.length - 8)}
                  </td>
                  <td className="py-3.5">
                    {order.userId?.name || "Customer"}
                  </td>
                  <td className="py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border ${getStatusBadgeClass(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="py-3.5 text-right pr-1 font-bold">
                    ₹{order.totalAmount.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RecentOrdersTable;
