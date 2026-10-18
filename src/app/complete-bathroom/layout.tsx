import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete Bathroom Solutions",
  description: "Design your dream bathroom with our curated collection of sanitaryware, tiles, faucets, and accessories. Complete bathroom packages available.",
  alternates: { canonical: "/complete-bathroom" },
  openGraph: {
    title: "Complete Bathroom Solutions | Bhatia Stores",
    description: "Design your dream bathroom with our curated collection.",
    url: "/complete-bathroom",
  },
};

export default function CompleteBathroomLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
