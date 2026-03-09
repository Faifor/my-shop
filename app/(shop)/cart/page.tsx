"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { useCartStore } from "@/features/cart/cart-store";

export default function CartPage() {
  const { cart, updateItem, loading } = useCartStore();

  return (
    <>
      <Header />
      <main className="container py-6">
        <h1 className="text-2xl font-bold">Корзина</h1>
        {!cart && <p className="mt-4 text-slate-500">Корзина пока не создана.</p>}
        {(cart?.items?.length ?? 0) === 0 && <p className="mt-4 text-slate-500">В корзине пусто.</p>}
        <div className="mt-5 space-y-3">
          {(cart?.items ?? []).map((item) => (
            <div key={String(item.variant_id)} className="flex items-center justify-between rounded-lg border bg-white p-3">
              <div>
                <p className="font-semibold">{item.product_name ?? item.variant_name ?? item.variant_id}</p>
                <p className="text-sm text-slate-500">{item.line_total ?? 0} ₽</p>
              </div>
              <div className="flex gap-2">
                <button className="rounded border px-2" onClick={() => updateItem(item.variant_id, Math.max(1, item.qty - 1), item.promo_code)}>-</button>
                <span>{item.qty}</span>
                <button className="rounded border px-2" onClick={() => updateItem(item.variant_id, item.qty + 1, item.promo_code)}>+</button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-lg border bg-white p-4">
          <p>Subtotal: {cart?.subtotal ?? 0} ₽</p>
          <p>Скидка: {cart?.discount_total ?? 0} ₽</p>
          <p className="text-lg font-bold">Итого: {cart?.total ?? 0} ₽</p>
        </div>
        <Link href="/checkout" className="mt-4 inline-block rounded-md bg-slate-900 px-4 py-2 text-white">Перейти к оформлению</Link>
        {loading && <p className="mt-2 text-sm">Обновление корзины...</p>}
      </main>
    </>
  );
}
