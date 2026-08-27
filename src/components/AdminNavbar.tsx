"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Rocket,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminNavbar({ user }: { user: { name: string; email: string } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { label: "Customers", href: "/admin/customers", icon: Users },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { label: "Launchpad", href: "/admin/launchpad", icon: Rocket },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Admin logged out.");
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-stone-800 bg-stone-950 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold tracking-wider text-white">
              BHATIA <span className="text-amber-400 font-sans text-xs tracking-widest uppercase">Admin</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "bg-purple-900 text-white shadow-xs"
                      : "text-stone-300 hover:bg-stone-900 hover:text-white"
                  }`}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 rounded-full border border-stone-700 bg-stone-900 px-3 py-1.5 text-xs font-medium text-stone-300 hover:bg-stone-800 hover:text-white transition"
            title="Open customer storefront in new tab"
          >
            <span>View Live Store</span>
            <ExternalLink size={12} />
          </Link>

          <button
            onClick={handleLogout}
            className="hidden sm:inline-flex items-center gap-1 rounded-full bg-red-950/60 border border-red-900/60 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-900/60 transition"
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white lg:hidden"
            aria-label="Toggle admin menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-stone-800 bg-stone-900 px-4 py-4 lg:hidden">
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold ${
                    active ? "bg-purple-900 text-white" : "text-stone-300 hover:bg-stone-800"
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <hr className="my-2 border-stone-800" />

            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs text-stone-300 hover:text-white"
            >
              <ExternalLink size={14} />
              <span>View Live Store</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-2 text-left text-xs font-semibold text-red-400 hover:text-red-300"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
