"use client";

import { createContext, useContext, useState } from "react";
import { cartApi, pricingApi } from "@/lib/api/requests";
import type { Cart } from "@/types/api";

type CartContextValue = {
  cart: Cart | null;
  loading: boolean;
  ensureCart: (userId: string) => Promise<string>;
  fetchCart: (cartId: string) => Promise<void>;
  updateItem: (variantId: string, qty: number, promoCode?: string) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const ensureCart = async (userId: string) => {
    if (cart?.id) return cart.id;
    const created = await cartApi.createCart({ user_id: userId });
    setCart(created);
    return created.id;
  };

  const fetchCart = async (cartId: string) => {
    setLoading(true);
    try {
      const data = await cartApi.getCart(cartId);
      setCart(data);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (variantId: string, qty: number, promoCode?: string) => {
    if (!cart?.id) return;
    setLoading(true);
    try {
      await pricingApi.calculate({ variant_id: variantId, qty, promo_code: promoCode });
      const updated = await cartApi.updateItem(cart.id, variantId, { variant_id: variantId, qty, promo_code: promoCode });
      setCart(updated);
    } finally {
      setLoading(false);
    }
  };

  return <CartContext.Provider value={{ cart, loading, ensureCart, fetchCart, updateItem }}>{children}</CartContext.Provider>;
}

export function useCartStore() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCartStore must be used inside CartProvider");
  return context;
}
