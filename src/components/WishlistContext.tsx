"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CartItem } from "./CartContext";
import { toast } from "sonner";

type WishlistContextType = {
  items: CartItem[];
  itemCount: number;
  toggleItem: (item: CartItem) => void;
  hasItem: (id: string) => boolean;
  removeItem: (id: string) => void;
  clearWishlist: () => void;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bhatia_wishlist");
      if (stored) {
        setItems(JSON.parse(stored));
      }
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

  const toggleItem = (item: CartItem) => {
    setItems((current) => {
      const exists = current.some((entry) => entry.productId === item.productId);
      if (exists) {
        toast.info(`Removed "${item.name}" from your wishlist`);
        return current.filter((entry) => entry.productId !== item.productId);
      } else {
        toast.success(`Saved "${item.name}" to your wishlist`);
        return [...current, item];
      }
    });
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((entry) => entry.productId !== id));
  };

  const clearWishlist = () => {
    setItems([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        itemCount: items.length,
        toggleItem,
        hasItem: (id) => items.some((item) => item.productId === id),
        removeItem,
        clearWishlist,
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
