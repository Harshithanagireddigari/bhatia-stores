"use client";

interface Order {
  id: string;
  customerName: string;
  items: string;
  total: string;
  status: "Delivered" | "Processing" | "Shipped" | "Cancelled";
  date: string;
}

const recentOrders: Order[] = [
  {
    id: "#ORD-001",
    customerName: "Rahul Sharma",
    items: "Stainless Steel Basin Mixer, LED Wall Light",
    total: "₹3,798",
    status: "Delivered",
    date: "18 Sep 2026",
  },
  {
    id: "#ORD-002",
    customerName: "Priya Patel",
    items: "Ceramic Sink, Faucet Set",
    total: "₹5,250",
    status: "Processing",
    date: "17 Sep 2026",
  },
  {
    id: "#ORD-003",
    customerName: "Amit Kumar",
    items: "Shower Head, Towel Rack",
    total: "₹2,890",
    status: "Shipped",
    date: "16 Sep 2026",
  },
  {
    id: "#ORD-004",
    customerName: "Sneha Reddy",
    items: "Bathroom Mirror, Cabinet",
    total: "₹4,500",
    status: "Delivered",
    date: "15 Sep 2026",
  },
  {
    id: "#ORD-005",
    customerName: "Vikram Singh",
    items: "Toilet Seat, Flush Tank",
    total: "₹3,200",
    status: "Cancelled",
    date: "14 Sep 2026",
  },
];

const statusColors: Record<Order["status"], string> = {
  Delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function RecentOrdersTable() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Orders
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Last 5 orders
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50">
              <th className="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">
                Order ID
              </th>
              <th className="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">
                Customer
              </th>
              <th className="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">
                Items
              </th>
              <th className="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">
                Total
              </th>
              <th className="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">
                Status
              </th>
              <th className="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">
                Date
              </th>
              <th className="px-6 py-3 font-medium text-gray-600 dark:text-gray-400">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-700/30"
              >
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  {order.id}
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                  {order.customerName}
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                  {order.items}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  {order.total}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColors[order.status]}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                  {order.date}
                </td>
                <td className="px-6 py-4">
                  <button className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}