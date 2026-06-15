import React from "react";

const OrderDetails = () => {
  const orders = [
    {
      id: "#ORD001",
      customer: "Rahul Sharma",
      email: "rahul@gmail.com",
      products: "iPhone 16, AirPods",
      amount: "₹84,999",
      paymentStatus: "Paid",
      orderStatus: "Delivered",
      date: "15 Jun 2026",
    },
    {
      id: "#ORD002",
      customer: "Priya Verma",
      email: "priya@gmail.com",
      products: "Samsung S25",
      amount: "₹69,999",
      paymentStatus: "Paid",
      orderStatus: "Processing",
      date: "14 Jun 2026",
    },
    {
      id: "#ORD003",
      customer: "Amit Jain",
      email: "amit@gmail.com",
      products: "Boat Headphones",
      amount: "₹2,999",
      paymentStatus: "Pending",
      orderStatus: "Pending",
      date: "13 Jun 2026",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Order Management
        </h1>

        <p className="text-gray-500 mb-6">
          View and manage customer orders.
        </p>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-gray-600">
              No Orders Found
            </h2>

            <p className="text-gray-400 mt-2">
              Orders placed by customers will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#15877F] text-white">
                  <th className="p-4 text-left">Order ID</th>
                  <th className="p-4 text-left">Customer</th>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-left">Products</th>
                  <th className="p-4 text-left">Amount</th>
                  <th className="p-4 text-left">Payment</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Date</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-4 font-semibold">
                      {order.id}
                    </td>

                    <td className="p-4">
                      {order.customer}
                    </td>

                    <td className="p-4 text-blue-600">
                      {order.email}
                    </td>

                    <td className="p-4">
                      {order.products}
                    </td>

                    <td className="p-4 font-medium">
                      {order.amount}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.paymentStatus === "Paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.orderStatus === "Delivered"
                            ? "bg-green-100 text-green-700"
                            : order.orderStatus === "Processing"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>

                    <td className="p-4 text-gray-500">
                      {order.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;