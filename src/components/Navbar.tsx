"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "./CartContext";
import { useTheme } from "next-themes";
import { Moon, Search, Sun, Heart, ShoppingBag, ShoppingCart, User, Package, LogOut } from "lucide-react";

export default function Navbar() {
  const { itemCount } = useCart();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();
    router.push(query ? `/shop?search=${encodeURIComponent(query)}` : "/shop");
    setMobileOpen(false);
  }

  const linkClass =
    "text-sm font-semibold text-stone-700 dark:text-stone-200 transition-colors hover:text-[#b49663] dark:hover:text-[#c5a059]";

  return (
    <nav className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 dark:border-stone-800 dark:bg-[#12100e]/95 backdrop-blur font-sans">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        
        {/* LOGO (GOLD BRANDING WITH OFFICIAL LOGO IMAGE) */}
        <Link
          href="/"
          className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#b49663] dark:text-[#c5a059] transition hover:opacity-90 flex items-center gap-2.5"
        >
          <div className="relative h-9 w-9 overflow-hidden rounded-full border border-[#c5a059]/40 shadow-sm shrink-0">
            <Image
              src="/logo.png"
              alt="Bhatia Stores Logo"
              fill
              className="object-cover"
            />
          </div>
          <span>Bhatia Stores</span>
        </Link>

        {/* DESKTOP NAVBAR LINKS */}
        <div className="hidden items-center gap-6 md:flex">
          <form onSubmit={submitSearch} className="relative">
            <Search
              aria-hidden
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tiles, sanitaryware..."
              className="w-52 rounded-full border border-stone-200 bg-stone-50 py-2 pl-9 pr-3 text-xs outline-none transition focus:border-[#b49663] dark:border-stone-800 dark:bg-stone-900 dark:text-white dark:focus:border-[#c5a059]"
            />
          </form>

          <Link href="/shop" className={linkClass}>
            Shop
          </Link>

          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="relative flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200 transition hover:text-[#b49663] dark:hover:text-[#c5a059]"
          >
            <Heart size={18} className="text-[#b49663]" />
            <span>Wishlist</span>
          </Link>

          <Link
            href="/cart"
            aria-label="Cart"
            className="relative flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200 transition hover:text-[#b49663] dark:hover:text-[#c5a059]"
          >
            <div className="relative">
              <ShoppingCart size={18} className="text-[#b49663]" />
              {itemCount > 0 && (
                <span className="absolute -right-2.5 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#b49663] text-[10px] font-bold text-white shadow-sm">
                  {itemCount}
                </span>
              )}
            </div>
            <span>Cart</span>
          </Link>

          <Link href="/orders" className={linkClass}>
            My Orders
          </Link>

          <Link href="/account" className={linkClass}>
            Account
          </Link>

          {/* Theme Toggle Button */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full p-2 text-stone-600 dark:text-stone-300 transition hover:bg-stone-100 dark:hover:bg-stone-800"
              aria-label="Toggle Theme"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>
          )}

          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/login");
              router.refresh();
            }}
            className="text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 transition"
          >
            Logout
          </button>
        </div>

        {/* MOBILE CONTROLS */}
        <div className="flex items-center gap-2 md:hidden">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full p-2 text-stone-600 dark:text-stone-300"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-xl p-2 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
            aria-label="Menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER NAV */}
      {mobileOpen && (
        <div className="border-t border-stone-200 dark:border-stone-800 bg-white px-4 pb-5 pt-3 md:hidden dark:bg-[#161310]">
          <div className="flex flex-col gap-3">
            <form onSubmit={submitSearch} className="relative mb-2">
              <Search
                aria-hidden
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tiles, sanitaryware..."
                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#b49663] dark:border-stone-700 dark:bg-stone-900 dark:text-white"
              />
            </form>

            <Link
              href="/shop"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
              onClick={() => setMobileOpen(false)}
            >
              <ShoppingBag size={17} className="text-[#b49663]" />
              <span>Shop Catalog</span>
            </Link>

            <Link
              href="/wishlist"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
              onClick={() => setMobileOpen(false)}
            >
              <Heart size={17} className="text-[#b49663]" />
              <span>Wishlist</span>
            </Link>

            <Link
              href="/cart"
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
              onClick={() => setMobileOpen(false)}
            >
              <div className="flex items-center gap-3">
                <ShoppingCart size={17} className="text-[#b49663]" />
                <span>My Shopping Cart</span>
              </div>
              {itemCount > 0 && (
                <span className="rounded-full bg-[#b49663] px-2 py-0.5 text-[10px] text-white">
                  {itemCount}
                </span>
              )}
            </Link>

            <Link
              href="/orders"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
              onClick={() => setMobileOpen(false)}
            >
              <Package size={17} className="text-[#b49663]" />
              <span>My Orders</span>
            </Link>

            <Link
              href="/account"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
              onClick={() => setMobileOpen(false)}
            >
              <User size={17} className="text-[#b49663]" />
              <span>My Account</span>
            </Link>

            <button
              onClick={async () => {
                setMobileOpen(false);
                await fetch("/api/auth/logout", { method: "POST" });
                router.push("/login");
                router.refresh();
              }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-left mt-2 border-t border-stone-100 dark:border-stone-800 pt-3"
            >
              <LogOut size={17} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
