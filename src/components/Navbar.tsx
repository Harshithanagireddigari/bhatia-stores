"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "./CartContext";
import { useTheme } from "next-themes";
import { Heart, Menu, Moon, Package, Search, ShoppingBag, ShoppingCart, Sun, User, X } from "lucide-react";

export default function Navbar() {
  const { itemCount } = useCart();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? (resolvedTheme === "dark" || theme === "dark") : false;
  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();
    router.push(query ? `/shop?search=${encodeURIComponent(query)}` : "/shop");
    setMobileOpen(false);
  }

  const linkClass =
    "text-sm font-semibold text-stone-700 dark:text-stone-200 transition-colors hover:text-[#b49663] dark:hover:text-[#c5a059]";

  return (
    <nav className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 font-sans backdrop-blur dark:border-stone-800 dark:bg-[#12100e]/95">
      <div className="mx-auto hidden max-w-7xl items-center justify-between px-4 py-3 sm:px-6 md:flex">
        
        {/* LOGO (GOLD BRANDING WITH OFFICIAL LOGO IMAGE) */}
        <Link
          href="/"
          className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#745624] dark:text-[#e2bd72] transition hover:opacity-90 flex items-center gap-2.5"
        >
          <div className="relative h-9 w-9 overflow-hidden rounded-full border border-[#745624]/40 dark:border-[#e2bd72]/40 shadow-sm shrink-0">
            <Image
              src="/logo.png"
              alt="Bhatia Stores Logo"
              fill
              sizes="36px"
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
              aria-label="Search tiles, sanitaryware"
              className="w-52 rounded-full border border-stone-200 bg-stone-50 py-2 pl-9 pr-3 text-xs outline-none transition focus:border-[#b49663] dark:border-stone-800 dark:bg-stone-900 dark:text-white dark:focus:border-[#c5a059]"
            />
          </form>

          <Link href="/shop" className={linkClass}>
            Shop
          </Link>

          <Link href="/complete-bathroom" className={linkClass}>
            Suite Completion
          </Link>

          <Link href="/boq" className={linkClass}>
            BOQ Quote
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
              onClick={toggleTheme}
              className="rounded-full p-2 text-stone-600 dark:text-stone-300 transition hover:bg-stone-100 dark:hover:bg-stone-800"
              aria-label="Toggle Theme"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>
          )}
        </div>

      </div>

      <div className="md:hidden">
        <div className="grid h-14 grid-cols-[2.5rem_1fr_auto] items-center gap-2 px-3">
          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-stone-700 transition hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={21} />}
          </button>

          <Link href="/" className="flex min-w-0 items-center justify-center gap-2 text-stone-900 dark:text-white">
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-[#c5a059]/40">
              <Image src="/logo.png" alt="Bhatia Stores" fill sizes="32px" className="object-cover" />
            </div>
            <span className="min-w-0 text-left font-serif leading-none">
              <span className="block truncate text-sm font-bold">The Bhatias</span>
              <span className="mt-1 block truncate text-[7px] font-bold uppercase tracking-[0.16em] text-[#9a7542]">
                Premium hardware store
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-0.5">
            {mounted && (
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                className="flex h-10 w-9 items-center justify-center rounded-lg text-stone-700 transition hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
                title={isDark ? "Light mode" : "Dark mode"}
              >
                {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
              </button>
            )}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="flex h-10 w-9 items-center justify-center rounded-lg text-stone-700 transition hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              <Heart size={18} />
            </Link>
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative flex h-10 w-9 items-center justify-center rounded-lg text-stone-700 transition hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              <ShoppingCart size={19} />
              {itemCount > 0 && (
                <span className="absolute right-0.5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#b49663] px-1 text-[9px] font-bold text-white">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <form onSubmit={submitSearch} className="relative border-t border-stone-100 px-3 py-2 dark:border-stone-800">
          <Search
            aria-hidden
            size={15}
            className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products, brands and finishes"
            aria-label="Search products, brands and finishes"
            className="h-9 w-full rounded-md border border-stone-200 bg-stone-50 py-2 pl-9 pr-3 text-xs text-stone-900 outline-none focus:border-[#b49663] dark:border-stone-700 dark:bg-stone-900 dark:text-white"
          />
        </form>
      </div>

      {/* MOBILE DRAWER NAV */}
      {mobileOpen && (
        <div className="absolute inset-x-0 top-full border-b border-stone-200 bg-white px-3 py-3 shadow-xl dark:border-stone-800 dark:bg-[#161310] md:hidden">
          <div className="grid grid-cols-2 gap-1">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-xs font-bold text-stone-800 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
              onClick={() => setMobileOpen(false)}
            >
              <ShoppingBag size={17} className="text-[#b49663]" />
              <span>Home</span>
            </Link>
            <Link
              href="/shop"
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-xs font-bold text-stone-800 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
              onClick={() => setMobileOpen(false)}
            >
              <ShoppingBag size={17} className="text-[#b49663]" />
              <span>Shop Catalog</span>
            </Link>

            <Link
              href="/wishlist"
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-xs font-bold text-stone-800 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
              onClick={() => setMobileOpen(false)}
            >
              <Heart size={17} className="text-[#b49663]" />
              <span>Wishlist</span>
            </Link>

            <Link
              href="/cart"
              className="flex items-center justify-between rounded-lg px-3 py-3 text-xs font-bold text-stone-800 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
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
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-xs font-bold text-stone-800 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
              onClick={() => setMobileOpen(false)}
            >
              <Package size={17} className="text-[#b49663]" />
              <span>My Orders</span>
            </Link>

            <Link
              href="/account"
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-xs font-bold text-stone-800 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
              onClick={() => setMobileOpen(false)}
            >
              <User size={17} className="text-[#b49663]" />
              <span>My Account</span>
            </Link>
            <Link
              href="/complete-bathroom"
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-xs font-bold text-stone-800 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
              onClick={() => setMobileOpen(false)}
            >
              <Package size={17} className="text-[#b49663]" />
              <span>Complete Bathroom</span>
            </Link>
            {mounted && (
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-xs font-bold text-stone-800 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
              >
                {isDark ? <Sun size={17} className="text-[#c5a059]" /> : <Moon size={17} className="text-[#b49663]" />}
                <span>{isDark ? "Light appearance" : "Dark appearance"}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
