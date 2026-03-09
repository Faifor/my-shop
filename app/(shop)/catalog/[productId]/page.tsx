"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/features/auth/auth-store";
import { useCartStore } from "@/features/cart/cart-store";
import { catalogApi } from "@/lib/api/requests";
import { useAsyncData } from "@/lib/use-async-data";

export default function ProductPage({ params }: { params: { productId: string } }) {
  const products = useAsyncData("products", catalogApi.getProducts);
  const reviews = useAsyncData(`reviews-${params.productId}`, () => catalogApi.getReviews(Number(params.productId)));
  const [qty, setQty] = useState(1);
  const { user } = useAuth();
  const { ensureCart, updateItem } = useCartStore();

  const product = useMemo(() => (products.data ?? []).find((item) => String(item.id) === params.productId), [params.productId, products.data]);
  const variant = product?.variants?.[0];
  const image = product?.images?.[0]?.url;
  const price = variant?.price ?? product?.base_price;

  const add = async () => {
    if (!user || !variant) return;
    await ensureCart(user.id);
    await updateItem(Number(variant.id), qty);
  };

  return (
    <>
      <Header products={products.data ?? []} />
      <main className="container py-6">
        {!product && <p>Товар не найден.</p>}
        {product && (
          <div className="grid gap-6 lg:grid-cols-2">
            {image ? <Image src={image} alt={product.name} width={900} height={600} className="h-80 w-full rounded-xl object-cover" unoptimized /> : <div className="h-80 rounded-xl bg-slate-100" />}
            <div>
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <p className="mt-2 text-slate-600">{product.description}</p>
              <p className="mt-2">⭐ {product.rating ?? "—"}</p>
              <p className="mt-4 text-2xl font-bold">{price !== undefined ? `${price} ₽` : "Цена по запросу"}</p>
              <div className="mt-4 flex items-center gap-2">
                <input type="number" className="w-20 rounded-md border px-2 py-1" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value) || 1)} />
                <button onClick={add} className="rounded-md bg-slate-900 px-4 py-2 text-white" disabled={!user}>Добавить в корзину</button>
              </div>
              {!user && <p className="mt-2 text-sm text-slate-500">Для покупки необходимо авторизоваться.</p>}
            </div>
          </div>
        )}

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Отзывы</h2>
          {reviews.loading && <p className="mt-2">Загрузка отзывов...</p>}
          {(reviews.data ?? []).map((review) => (
            <article key={review.id} className="mt-3 rounded-md border bg-white p-3">
              <p className="font-medium">Оценка: {review.rating}/5</p>
              <p className="text-sm text-slate-600">{review.review}</p>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
