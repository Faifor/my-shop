"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/types/api";
import { useAuth } from "@/features/auth/auth-store";
import { useCartStore } from "@/features/cart/cart-store";

export function Header({ products = [] }: { products?: Product[] }) {
  const [query, setQuery] = useState("");
  const { user, logout } = useAuth();
  const { cart } = useCartStore();

  const searched = useMemo(() => {
    if (!query) return [];
    return products.filter((item) => item.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
  }, [products, query]);

  return (
    <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold">eComBack Shop</Link>
        <div className="relative flex-1">
          <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Поиск товаров" value={query} onChange={(e) => setQuery(e.target.value)} />
          {searched.length > 0 && (
            <div className="absolute mt-1 w-full rounded-md border bg-white p-2 shadow">
              {searched.map((item) => (
                <Link key={item.id} className="block rounded px-2 py-1 hover:bg-slate-50" href={`/catalog/${item.id}`}>
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>
        <Link href="/cart" className="text-sm">Корзина ({cart?.items?.length ?? 0})</Link>
        {user ? (
          <>
            <Link href="/profile" className="text-sm">{user.full_name}</Link>
            {user.role === "ADMIN" && <Link href="/admin" className="text-sm">Админ</Link>}
            <button onClick={logout} className="rounded-md border px-3 py-1 text-sm">Выйти</button>
          </>
        ) : (
          <Link href="/login" className="rounded-md border px-3 py-1 text-sm">Войти</Link>
        )}
      </div>
    </header>
  );
}
