"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { itemCount } = useCart();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();
    router.push(query ? `/shop?search=${encodeURIComponent(query)}` : "/shop");
    setMobileOpen(false);
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-700 dark:bg-gray-900/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400"
        >
          Bhatia Stores
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 md:flex">
          <form onSubmit={submitSearch} className="relative">
            <Search aria-hidden size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search products"
              placeholder="Search tiles..."
              className="w-40 rounded-full border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 md:w-48"
            />
          </form>
          <Link
            href="/shop"
            className="text-sm font-medium text-gray-700 transition hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
          >
            Shop
          </Link>
          <Link href="/wishlist" aria-label="Wishlist" className="relative rounded-full p-2 text-gray-700 transition hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-800">
            ♡
          </Link>
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative rounded-full p-2 text-gray-700 transition hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            🛒
            {itemCount > 0 && (
              <span className="absolute -right-4 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>
          <Link
            href="/orders"
            className="text-sm font-medium text-gray-700 transition hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
          >
            My Orders
          </Link>
          <Link
            href="/admin"
            className="text-sm font-medium text-gray-700 transition hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
          >
            Admin
          </Link>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full p-2 text-gray-600 dark:text-gray-300"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded p-1 text-gray-600 dark:text-gray-300"
            aria-label="Menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-200 px-4 pb-4 dark:border-gray-700 md:hidden">
          <div className="flex flex-col gap-3 pt-3">
            <form onSubmit={submitSearch} className="relative">
              <Search aria-hidden size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search products"
                placeholder="Search tiles, designs, brands..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800"
              />
            </form>
            <Link href="/shop" className="text-sm font-medium text-gray-700 dark:text-gray-300" onClick={() => setMobileOpen(false)}>Shop</Link>
            <Link href="/wishlist" className="text-sm font-medium text-gray-700 dark:text-gray-300" onClick={() => setMobileOpen(false)}>♡ Wishlist</Link>
            <Link href="/cart" className="text-sm font-medium text-gray-700 dark:text-gray-300" onClick={() => setMobileOpen(false)}>
              Cart {itemCount > 0 && `(${itemCount})`}
            </Link>
            <Link href="/orders" className="text-sm font-medium text-gray-700 dark:text-gray-300" onClick={() => setMobileOpen(false)}>My Orders</Link>
            <Link href="/admin" className="text-sm font-medium text-gray-700 dark:text-gray-300" onClick={() => setMobileOpen(false)}>Admin</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
