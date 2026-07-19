"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartLine = {
  productId: string;
  quantity: number;
  optionValueIds: string[];
  /** Display snapshot (not authoritative for totals). */
  name: string;
  /** Human-readable option labels for cart/checkout display. */
  optionLabels: string[];
  unitPrice: number;
};

type CartContextValue = {
  lines: CartLine[];
  addLine: (line: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  updateQuantity: (productId: string, optionValueIds: string[], quantity: number) => void;
  removeLine: (productId: string, optionValueIds: string[]) => void;
  clear: () => void;
  itemCount: number;
};

const STORAGE_KEY = "maison-malka-cart-v2";

function lineKey(productId: string, optionValueIds: string[]): string {
  return `${productId}::${[...optionValueIds].sort().join(",")}`;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        if (Array.isArray(parsed)) {
          setLines(
            parsed.map((l) => ({
              ...l,
              optionLabels: Array.isArray(l.optionLabels) ? l.optionLabels : [],
            })),
          );
        }
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const addLine = useCallback(
    (line: Omit<CartLine, "quantity"> & { quantity?: number }) => {
      const qty = line.quantity ?? 1;
      setLines((prev) => {
        const key = lineKey(line.productId, line.optionValueIds);
        const existing = prev.find(
          (l) => lineKey(l.productId, l.optionValueIds) === key,
        );
        if (existing) {
          return prev.map((l) =>
            lineKey(l.productId, l.optionValueIds) === key
              ? {
                  ...l,
                  quantity: l.quantity + qty,
                  unitPrice: line.unitPrice,
                  name: line.name,
                  optionLabels: line.optionLabels ?? [],
                }
              : l,
          );
        }
        return [
          ...prev,
          {
            productId: line.productId,
            quantity: qty,
            optionValueIds: line.optionValueIds,
            name: line.name,
            optionLabels: line.optionLabels ?? [],
            unitPrice: line.unitPrice,
          },
        ];
      });
    },
    [],
  );

  const updateQuantity = useCallback(
    (productId: string, optionValueIds: string[], quantity: number) => {
      const key = lineKey(productId, optionValueIds);
      setLines((prev) => {
        if (quantity <= 0) {
          return prev.filter((l) => lineKey(l.productId, l.optionValueIds) !== key);
        }
        return prev.map((l) =>
          lineKey(l.productId, l.optionValueIds) === key ? { ...l, quantity } : l,
        );
      });
    },
    [],
  );

  const removeLine = useCallback((productId: string, optionValueIds: string[]) => {
    const key = lineKey(productId, optionValueIds);
    setLines((prev) => prev.filter((l) => lineKey(l.productId, l.optionValueIds) !== key));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const itemCount = useMemo(
    () => lines.reduce((acc, l) => acc + l.quantity, 0),
    [lines],
  );

  const value = useMemo(
    () => ({ lines, addLine, updateQuantity, removeLine, clear, itemCount }),
    [lines, addLine, updateQuantity, removeLine, clear, itemCount],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
