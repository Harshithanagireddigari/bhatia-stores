import { getSessionUser } from "@/lib/auth";
import AdminLoginPortal from "@/components/admin/AdminLoginPortal";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user || user.role !== "admin") {
    return <AdminLoginPortal />;
  }

  return <>{children}</>;
}