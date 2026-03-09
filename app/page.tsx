"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { ProductCard } from "@/components/product/product-card";
import { catalogApi } from "@/lib/api/requests";
import { useAsyncData } from "@/lib/use-async-data";

export default function HomePage() {
  const products = useAsyncData("products", catalogApi.getProducts);
  const categories = useAsyncData("categories", catalogApi.getCategories);

  return (
    <>
      <Header products={products.data ?? []} />
      <main className="container py-6">
        <section className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white">
          <h1 className="text-3xl font-bold">Современный магазин на eComBack API</h1>
          <p className="mt-2 text-slate-200">Каталог, корзина, checkout и личный кабинет в едином интерфейсе.</p>
          <Link href="/catalog" className="mt-4 inline-block rounded-md bg-white px-4 py-2 text-slate-900">Перейти в каталог</Link>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">Категории</h2>
          {categories.loading && <p className="mt-3">Загрузка категорий...</p>}
          {categories.error && <p className="mt-3 text-red-600">{categories.error}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            {(categories.data ?? []).map((category) => (
              <span key={category.id} className="rounded-full border bg-white px-3 py-1 text-sm">{category.name}</span>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">Популярные товары</h2>
          {products.loading && <p className="mt-3">Загрузка товаров...</p>}
          {products.error && <p className="mt-3 text-red-600">{products.error}</p>}
          {!products.loading && (products.data?.length ?? 0) === 0 && <p className="mt-3 text-slate-500">Пока товаров нет.</p>}
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(products.data ?? []).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
