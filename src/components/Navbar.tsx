"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { useState, useEffect } from "react";
import { Search, ShoppingCart, Heart, User, Menu, X, Package, LogOut } from "lucide-react";

export default function Navbar() {
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, [pathname]);

  if (!mounted) return null;

  // Don't render customer navbar on admin routes if separate admin navbar is used
  const isAdminRoute = pathname.startsWith("/admin");

  function submitSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const query = search.trim();
    if (query) {
      router.push(`/shop?search=${encodeURIComponent(query)}`);
    } else {
      router.push("/shop");
    }
    setMobileOpen(false);
  }

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Floor Tiles", href: "/shop?category=Vitrified+Floor+Tiles" },
    { label: "Wall Tiles", href: "/shop?category=Digital+Wall+Tiles" },
    { label: "Sanitaryware", href: "/shop?category=Sanitaryware+%26+Faucets" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/95 backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/95">
      {/* Top Announcement Bar */}
      <div className="bg-stone-900 py-1.5 px-4 text-center text-[11px] font-medium tracking-widest text-amber-200/90 uppercase sm:text-xs">
        <span>✨ Bhatia Showroom Collection — Authentic Vitrified Tiles & Luxury Italian Sanitaryware</span>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Logo & Brand Identity */}
        <Link href="/" className="group flex flex-col">
          <span className="font-serif text-xl sm:text-2xl font-bold tracking-[0.12em] text-stone-900 transition-colors group-hover:text-purple-900 dark:text-stone-100">
            BHATIA <span className="text-amber-700 dark:text-amber-500 font-sans text-lg font-light tracking-widest">STORES</span>
          </span>
          <span className="text-[9px] uppercase tracking-[0.25em] text-stone-500 dark:text-stone-400">
            Tiles & Sanitaryware
          </span>
        </Link>

        {/* Desktop Search Bar */}
        <div className="hidden flex-1 max-w-md mx-4 lg:block">
          <form onSubmit={submitSearch} className="relative">
            <Search
              aria-hidden
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tiles, marble look, PGVT, sanitaryware..."
              className="w-full rounded-full border border-stone-200 bg-stone-50/80 py-2 pl-10 pr-4 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-purple-800 focus:bg-white focus:ring-1 focus:ring-purple-800 dark:border-stone-800 dark:bg-stone-900 dark:text-white"
            />
          </form>
        </div>

        {/* Desktop Primary Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-700 dark:text-stone-300">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors hover:text-purple-900 dark:hover:text-amber-400 ${
                isActive(link.href) ? "font-semibold text-purple-900 dark:text-amber-400" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Icon Actions: Wishlist, Cart, My Orders, Account */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Wishlist */}
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-stone-700 transition hover:bg-stone-100 hover:text-purple-900 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            <Heart size={19} />
            {wishlistCount > 0 && (
              <span className="absolute 1 top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-amber-700 text-[10px] font-bold text-white shadow-xs">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            aria-label="Shopping Cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-stone-700 transition hover:bg-stone-100 hover:text-purple-900 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            <ShoppingCart size={19} />
            {cartCount > 0 && (
              <span className="absolute 1 top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-purple-900 text-[10px] font-bold text-white shadow-xs">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Account / Orders / Admin */}
          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/orders"
                title="My Orders"
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-100 hover:text-purple-900 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                <Package size={15} />
                <span>Orders</span>
              </Link>
              <Link
                href="/account"
                title="My Account"
                className="flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-800 transition hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200"
              >
                <User size={15} />
                <span className="max-w-[90px] truncate">{user.name.split(" ")[0]}</span>
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="rounded-full bg-purple-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-purple-800"
                >
                  Admin
                </Link>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-full bg-stone-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-purple-900 dark:bg-stone-800 dark:hover:bg-stone-700"
            >
              <User size={14} />
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-stone-700 transition hover:bg-stone-100 md:hidden dark:text-stone-300 dark:hover:bg-stone-800"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="border-t border-stone-200 bg-white px-4 pb-6 pt-3 md:hidden dark:border-stone-800 dark:bg-stone-950">
          <form onSubmit={submitSearch} className="relative mb-4">
            <Search
              aria-hidden
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tiles, sanitaryware..."
              className="w-full rounded-full border border-stone-200 bg-stone-50 py-2.5 pl-10 pr-4 text-sm text-stone-900 outline-none focus:border-purple-800 dark:border-stone-800 dark:bg-stone-900 dark:text-white"
            />
          </form>

          <div className="flex flex-col space-y-2 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-3 py-2 transition hover:bg-stone-100 dark:hover:bg-stone-900 ${
                  isActive(link.href) ? "bg-stone-100 font-semibold text-purple-900 dark:bg-stone-900 dark:text-amber-400" : "text-stone-700 dark:text-stone-300"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <hr className="my-2 border-stone-200 dark:border-stone-800" />

            <Link
              href="/orders"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-900"
            >
              <Package size={16} /> My Orders
            </Link>

            <Link
              href="/account"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-900"
            >
              <User size={16} /> My Account
            </Link>

            {user?.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2 font-semibold text-purple-900 dark:bg-purple-950/40 dark:text-purple-300"
              >
                Admin Dashboard
              </Link>
            )}

            {user ? (
              <button
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  setUser(null);
                  setMobileOpen(false);
                  router.push("/login");
                  router.refresh();
                }}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <LogOut size={16} /> Logout
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-2 flex justify-center rounded-xl bg-stone-900 py-2.5 text-center font-semibold text-white dark:bg-stone-800"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
