import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CartProvider } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bhatia Stores - Luxury Tiles, Sanitaryware & Faucets Showroom",
  description: "Explore world-class PGVT vitrified floor slabs, high-definition wall tiles, designer quartz sinks, and Italian sanitaryware at Bhatia Stores.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body className="bg-stone-50 text-stone-900 antialiased transition-colors dark:bg-stone-950 dark:text-stone-100 font-sans selection:bg-purple-900 selection:text-white">
        <ThemeProvider>
          <CartProvider>
            <WishlistProvider>
              <Navbar />
              <main className="min-h-screen">{children}</main>
              <Footer />
              <Toaster position="top-right" richColors />
            </WishlistProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
