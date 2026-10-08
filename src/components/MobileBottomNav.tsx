"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, ShoppingBag, ShoppingCart, User } from "lucide-react";
import { useCart } from "./CartContext";

const items = [
  { label: "Home", href: "/", icon: Home },
  { label: "Shop", href: "/shop", icon: ShoppingBag },
  { label: "Cart", href: "/cart", icon: ShoppingCart },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
  { label: "Account", href: "/account", icon: User },
];

const authPaths = ["/login", "/register", "/forgot-password", "/reset-password", "/otp", "/logout"];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  if (!pathname || authPaths.includes(pathname)) return null;

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-stone-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-1.5 shadow-[0_-8px_24px_rgba(45,36,28,0.08)] backdrop-blur dark:border-stone-800 dark:bg-[#161310]/95 md:hidden"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-semibold transition-colors ${
                active
                  ? "text-[#9a7542] dark:text-[#e2bd72]"
                  : "text-stone-500 dark:text-stone-400"
              }`}
            >
              <span className="relative">
                <Icon size={19} strokeWidth={active ? 2.25 : 1.8} />
                {item.href === "/cart" && itemCount > 0 && (
                  <span className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#b49663] px-1 text-[9px] font-bold text-white">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
