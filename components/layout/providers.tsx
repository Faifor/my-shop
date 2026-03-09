"use client";

import { AuthProvider } from "@/features/auth/auth-store";
import { CartProvider } from "@/features/cart/cart-store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
