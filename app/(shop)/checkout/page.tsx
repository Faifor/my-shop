"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { orderApi } from "@/lib/api/requests";
import { useCartStore } from "@/features/cart/cart-store";

export default function CheckoutPage() {
  const { cart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "yookassa">("cod");
  const [status, setStatus] = useState<string>("");

  const submit = async () => {
    if (!cart?.id) return;
    try {
      const order = await orderApi.checkout({ cart_id: cart.id, payment_method: paymentMethod });
      setStatus(`Заказ #${order.id} создан. Статус оплаты: ${order.payment_status ?? "ожидается"}`);
    } catch (e) {
      setStatus((e as { message?: string }).message ?? "Ошибка при оформлении");
    }
  };

  return (
    <>
      <Header />
      <main className="container py-6">
        <h1 className="text-2xl font-bold">Оформление заказа</h1>
        <div className="mt-4 rounded-lg border bg-white p-4">
          <p>Сумма заказа: {cart?.total ?? 0} ₽</p>
          <div className="mt-3 space-y-2">
            <label className="flex items-center gap-2"><input type="radio" name="payment" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />Наложенный платеж</label>
            <label className="flex items-center gap-2"><input type="radio" name="payment" checked={paymentMethod === "yookassa"} onChange={() => setPaymentMethod("yookassa")} />YooKassa</label>
          </div>
          <button className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-white" onClick={submit}>Подтвердить заказ</button>
          {status && <p className="mt-3 text-sm">{status}</p>}
        </div>
      </main>
    </>
  );
}
