import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CartProvider } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";
import AppLayout from "@/components/AppLayout";
import ClientOverlays from "@/components/ClientOverlays";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bhatia-stores.vercel.app"),
  title: { default: "Bhatia Stores | Premium Hardware & Sanitaryware", template: "%s | Bhatia Stores" },
  description: "Shop premium tiles, sanitaryware, faucets, fittings, and hardware with reliable delivery across India.",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "Bhatia Stores",
    title: "Bhatia Stores | Premium Hardware & Sanitaryware",
    description: "Premium tiles, sanitaryware, faucets, fittings, and hardware.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bhatia Stores",
    description: "Premium tiles, sanitaryware, faucets, fittings, and hardware.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={inter.variable}
      suppressHydrationWarning
    >
      <body className="bg-[#f8f6f1] text-stone-900 antialiased transition-colors dark:bg-[#12100e] dark:text-stone-100 font-sans">
        <ThemeProvider>
          <CartProvider>
            <WishlistProvider>
              <AppLayout>{children}</AppLayout>
              <ClientOverlays />
            </WishlistProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
