import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Read the terms and conditions for using Bhatia Stores online platform.",
  alternates: { canonical: "/terms-and-conditions" },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
