import type { Metadata } from "next";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

async function getProduct(id: string) {
  try {
    const [product] = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        image: products.image,
        images: products.images,
        category: products.category,
      })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    return product || null;
  } catch (error) {
    console.error("Error fetching product for metadata:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return { title: "Product Not Found" };
  }

  const title = product.name;
  const description = product.description
    ? product.description.substring(0, 160)
    : `Buy ${product.name} at Bhatia Stores. Premium quality hardware and sanitaryware with delivery across India.`;
  const image = Array.isArray(product.images) && product.images.length > 0
    ? (product.images[0] as string)
    : product.image || undefined;

  return {
    title,
    description,
    alternates: { canonical: `/product/${id}` },
    openGraph: {
      title: `${title} | Bhatia Stores`,
      description,
      url: `/product/${id}`,
      type: "website",
      ...(image ? { images: [{ url: image, width: 800, height: 800, alt: title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ProductLayout({ params, children }: Props) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return <>{children}</>;
  }

  const priceNum = typeof product.price === "string" ? parseFloat(product.price) : Number(product.price);
  const image = Array.isArray(product.images) && product.images.length > 0
    ? (product.images[0] as string)
    : product.image || undefined;

  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : `https://www.bhatiastores.com${image.startsWith("/") ? "" : "/"}${image}`
    : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `${product.name} - Premium hardware from Bhatia Stores`,
    url: `https://www.bhatiastores.com/product/${id}`,
    ...(imageUrl ? { image: imageUrl } : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: isNaN(priceNum) ? "0.00" : priceNum.toFixed(2),
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Bhatia Stores",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
