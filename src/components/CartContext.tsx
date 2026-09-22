"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
}

const CartContext = createContext<CartContextType | null>(null);

/** Validate and sanitize items loaded from client storage to prevent state manipulation. */
function sanitizeCartItems(data: unknown): CartItem[] {
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

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("bhatia_cart");
    if (stored) {
      try {
        setItems(sanitizeCartItems(JSON.parse(stored)));
      } catch {
        setItems([]);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("bhatia_cart", JSON.stringify(items));
    }
  }, [items, mounted]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId ? { ...i, quantity } : i
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
