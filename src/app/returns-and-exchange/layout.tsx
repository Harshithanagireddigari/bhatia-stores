import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns & Exchange Policy",
  description: "Learn about Bhatia Stores return and exchange policy for tiles, sanitaryware, and hardware products.",
  alternates: { canonical: "/returns-and-exchange" },
};

export default function ReturnsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
