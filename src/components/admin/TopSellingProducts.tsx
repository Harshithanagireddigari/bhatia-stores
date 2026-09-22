"use client";

interface Product {
  name: string;
  sold: string;
  price: string;
  image?: string;
}

const topSellingProducts: Product[] = [
  {
    name: "Stainless Steel Basin Mixer",
    sold: "120+",
    price: "₹2,499",
  },
  {
    name: "LED Wall Light",
    sold: "95+",
    price: "₹1,299",
  },
  {
    name: "Ceramic Sink",
    sold: "88+",
    price: "₹3,250",
  },
  {
    name: "Shower Head Set",
    sold: "76+",
    price: "₹1,890",
  },
];

export default function TopSellingProducts() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Top Selling Products
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Best performers this month
      </p>
      <div className="mt-6 space-y-4">
        {topSellingProducts.map((product, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/30"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                <span className="text-lg font-bold">{index + 1}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {product.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {product.sold} sold
                </p>
              </div>
            </div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {product.price}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}