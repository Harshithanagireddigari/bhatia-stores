import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import AdminNavbar from "@/components/AdminNavbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user || user.role !== "admin") {
    redirect("/login?redirect=/admin");
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col">
      <AdminNavbar user={user} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
