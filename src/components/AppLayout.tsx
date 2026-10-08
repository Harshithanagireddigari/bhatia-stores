"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";

const AIChatbot = dynamic(() => import("./AIChatbot"), { ssr: false });

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
      <main className="min-h-screen pb-20 md:pb-0">{children}</main>
      <AIChatbot />
      <Footer />
      <MobileBottomNav />
    </>
  );
}
