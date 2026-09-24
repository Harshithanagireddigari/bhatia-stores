"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ShoppingCart, X, ArrowRight } from "lucide-react";

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

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("bhatia_cart");
    if (stored) {
      try {
        setItems(JSON.parse(stored));
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

    setLastAddedItem(item);
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

      {/* ADDED TO CART NOTIFICATION MODAL / DRAWER (Matching Design Mockup) */}
      {lastAddedItem && (
        <div className="fixed inset-0 z-[100] flex items-start justify-end p-4 sm:p-6 bg-black/40 backdrop-blur-xs font-sans animate-fade-in">
          <div className="w-full max-w-sm rounded-[28px] border border-[#e2d5c3] bg-white p-6 shadow-2xl dark:border-[#382f25] dark:bg-[#1a1613] text-stone-900 dark:text-white relative">
            
            <button
              onClick={() => setLastAddedItem(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-stone-400 hover:text-stone-700 dark:hover:text-white"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-4">
              <CheckCircle2 size={24} />
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">Added to Cart!</h3>
            </div>

            <div className="flex items-center gap-4 border-y border-stone-100 py-3 dark:border-stone-800">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-900">
                {lastAddedItem.image ? (
                  <Image
                    src={lastAddedItem.image}
                    alt={lastAddedItem.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-stone-400">📦</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs truncate text-stone-900 dark:text-white">{lastAddedItem.name}</p>
                <p className="mt-0.5 text-xs text-stone-500 font-medium">Qty: {lastAddedItem.quantity}</p>
                <p className="mt-0.5 text-xs font-bold text-[#b49663] dark:text-[#c5a059]">
                  ₹{Number(lastAddedItem.price).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <Link
                href="/cart"
                onClick={() => setLastAddedItem(null)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#c5a059] py-3.5 text-xs font-bold text-stone-900 shadow hover:bg-[#b49663] transition"
              >
                <ShoppingCart size={16} />
                <span>Go to Cart</span>
                <ArrowRight size={14} />
              </Link>
              <button
                onClick={() => setLastAddedItem(null)}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 transition"
              >
                Continue Shopping
              </button>
            </div>

          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
