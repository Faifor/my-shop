"use client";

import { Header } from "@/components/layout/header";
import { orderApi } from "@/lib/api/requests";
import { useAsyncData } from "@/lib/use-async-data";

export default function OrdersPage() {
  const orders = useAsyncData("orders", orderApi.getOrders);

  return (
    <>
      <Header />
      <main className="container py-6">
        <h1 className="text-2xl font-bold">Мои заказы</h1>
        {orders.loading && <p className="mt-3">Загрузка...</p>}
        {(orders.data ?? []).map((order) => (
          <article key={order.id} className="mt-3 rounded-md border bg-white p-3">
            <p className="font-semibold">Заказ #{order.id}</p>
            <p className="text-sm">Статус: {order.status}</p>
            <p className="text-sm">Оплата: {order.payment_method} / {order.payment_status ?? "pending"}</p>
          </article>
        ))}
      </main>
    </>
  );
}
