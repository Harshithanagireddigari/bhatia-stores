import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://bhatia-stores.vercel.app";

  // Core static routes
  const routes = [
    "",
    "/shop",
    "/orders",
    "/cart",
    "/wishlist",
    "/account",
    "/login",
    "/register",
    "/forgot-password",
    "/privacy-policy",
    "/terms-and-conditions",
    "/returns-and-exchange",
    "/contact",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Fetch product IDs for dynamic product page indexing
  try {
    const res = await fetch(`${baseUrl}/api/products`, { cache: "no-store" });
    if (res.ok) {
      const products = await res.json();
      if (Array.isArray(products)) {
        const productUrls = products.map((product: { id: string; updatedAt?: string }) => ({
          url: `${baseUrl}/product/${product.id}`,
          lastModified: product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }));
        return [...routes, ...productUrls];
      }
    }
  } catch {
    // fallback if fetch during static build fails
  }

  return routes;
}
