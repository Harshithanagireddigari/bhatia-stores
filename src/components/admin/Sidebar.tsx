"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Tag, 
  Percent, 
  MessageSquare, 
  BarChart3, 
  Settings,
  Search,
  Bell,
  User
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Categories", href: "/admin/categories", icon: Tag },
  { name: "Launchpad", href: "/admin/launchpad", icon: LayoutDashboard },
  { name: "Offers & Banners", href: "/admin/offers", icon: Percent },
  { name: "Messages", href: "/admin/messages", icon: MessageSquare },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 h-screen w-64 bg-white border-r border-gray-200 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            THE BHATIAS
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            PREMIUM HARDWARE STORE
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User info */}
        <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Admin
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                admin@bhatias.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
