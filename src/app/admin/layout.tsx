import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import AdminLoginPortal from "@/components/admin/AdminLoginPortal";

export const metadata: Metadata = {
  title: "Admin Portal",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user || user.role !== "admin") {
    return <AdminLoginPortal />;
  }

  return <div className="admin-portal">{children}</div>;
}
