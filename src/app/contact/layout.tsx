import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Bhatia Stores for inquiries about tiles, sanitaryware, faucets, and hardware. We offer expert consultation and reliable delivery across India.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Bhatia Stores",
    description: "Get in touch with us for hardware and sanitaryware inquiries.",
    url: "/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
