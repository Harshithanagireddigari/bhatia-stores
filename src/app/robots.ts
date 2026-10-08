import { MetadataRoute } from "next";

const baseUrl = "https://bhatia-stores.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/account", "/orders", "/cart", "/wishlist", "/login", "/register", "/forgot-password", "/checkout"],
    }],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
