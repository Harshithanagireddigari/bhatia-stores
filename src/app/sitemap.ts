import { unstable_cache } from "next/cache";
import { MetadataRoute } from "next";
import { db } from "@/db";
import { products } from "@/db/schema";

const baseUrl = "https://bhatia-stores.vercel.app";

const getProductPages = unstable_cache(
  () => db.select({ id: products.id, createdAt: products.createdAt }).from(products),
  ["sitemap-products"],
  { revalidate: 3600 },
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const generatedAt = new Date();
  const publicRoutes = [
    { path: "", priority: 1.0, frequency: "daily" as const },
    { path: "/shop", priority: 0.9, frequency: "daily" as const },
    { path: "/complete-bathroom", priority: 0.8, frequency: "weekly" as const },
    { path: "/boq", priority: 0.7, frequency: "monthly" as const },
    { path: "/contact", priority: 0.6, frequency: "monthly" as const },
    { path: "/privacy-policy", priority: 0.4, frequency: "yearly" as const },
    { path: "/terms-and-conditions", priority: 0.4, frequency: "yearly" as const },
    { path: "/returns-and-exchange", priority: 0.4, frequency: "yearly" as const },
  ].map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: generatedAt,
    changeFrequency: route.frequency,
    priority: route.priority,
  }));

  try {
    const productPages = await getProductPages();
    return [...publicRoutes, ...productPages.map((product) => ({
      url: `${baseUrl}/product/${product.id}`,
      lastModified: product.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))];
  } catch {
    return publicRoutes;
  }
}
