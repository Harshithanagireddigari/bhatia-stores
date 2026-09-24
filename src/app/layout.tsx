import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CartProvider } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";
import AppLayout from "@/components/AppLayout";
import { Toaster } from "sonner";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

// Load fonts – Inter for body, Poppins for display/headings
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Bhatia Stores - Your One-Stop Shop",
  description: "Premium products with fast delivery and secure payments.",
};

import ConsentModal from "@/components/ConsentModal";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-[#f8f6f1] text-stone-900 antialiased transition-colors dark:bg-[#12100e] dark:text-stone-100 font-sans">
        <ThemeProvider>
          <CartProvider>
            <WishlistProvider>
              <ConsentModal />
              <AppLayout>{children}</AppLayout>
              <Toaster position="top-right" richColors />
            </WishlistProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
