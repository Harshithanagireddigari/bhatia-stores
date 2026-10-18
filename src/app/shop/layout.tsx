import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Premium Hardware & Sanitaryware",
  description: "Browse our complete collection of premium tiles, sanitaryware, faucets, fittings, and hardware products. Shop online with reliable delivery across India.",
  alternates: { canonical: "/shop" },
  openGraph: {
    title: "Shop Premium Hardware & Sanitaryware | Bhatia Stores",
    description: "Browse our complete collection of premium tiles, sanitaryware, faucets, fittings, and hardware products.",
    url: "/shop",
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
