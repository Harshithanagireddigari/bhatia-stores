"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AIChatbot from "./AIChatbot";

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isDelivery = pathname?.startsWith("/delivery-agents");

  if (isAdmin || isDelivery) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <AIChatbot />
      <Footer />
    </>
  );
}
