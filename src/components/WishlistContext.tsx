"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CartItem } from "./CartContext";

type WishlistContextType = {
  items: CartItem[];
  toggleItem: (item: CartItem) => void;
  hasItem: (id: string) => boolean;
  removeItem: (id: string) => void;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

/** Validate and sanitize wishlist items loaded from client storage. */
function sanitizeWishlistItems(data: unknown): CartItem[] {
  if (!Array.isArray(data)) return [];
  const safe: CartItem[] = [];
  for (const item of data) {
    if (
      item &&
      typeof item === "object" &&
      typeof item.productId === "string" &&
      item.productId.length > 0 &&
      item.productId.length < 100 &&
      !item.productId.includes("__proto__") &&
      typeof item.name === "string" &&
      typeof item.price === "number" &&
      Number.isFinite(item.price) &&
      item.price >= 0 &&
      typeof item.image === "string" &&
      typeof item.quantity === "number" &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0 &&
      item.quantity <= 999
    ) {
      safe.push({
        productId: item.productId,
        name: item.name.slice(0, 200),
        price: item.price,
        image: item.image.slice(0, 500),
        quantity: item.quantity,
      });
    }
  }
  return safe;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bhatia_wishlist");
      setItems(raw ? sanitizeWishlistItems(JSON.parse(raw)) : []);
    } catch {
      setItems([]);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem("bhatia_wishlist", JSON.stringify(items));
    }
  }, [items, ready]);

  const toggleItem = (item: CartItem) =>
    setItems((current) =>
      current.some((entry) => entry.productId === item.productId)
        ? current.filter((entry) => entry.productId !== item.productId)
        : [...current, item]
    );

  return (
    <WishlistContext.Provider
      value={{
        items,
        toggleItem,
        hasItem: (id) => items.some((item) => item.productId === id),
        removeItem: (id) => setItems((items) => items.filter((item) => item.productId !== id)),
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}
