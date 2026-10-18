import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bill of Quantities",
  description: "Generate a detailed Bill of Quantities for your hardware and sanitaryware project. Get accurate estimates with Bhatia Stores.",
  alternates: { canonical: "/boq" },
};

export default function BoqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
