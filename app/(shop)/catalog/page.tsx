"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { ProductCard } from "@/components/product/product-card";
import { catalogApi } from "@/lib/api/requests";
import { useAsyncData } from "@/lib/use-async-data";

export default function CatalogPage() {
  const categories = useAsyncData("categories", catalogApi.getCategories);
  const [categoryId, setCategoryId] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState<"id" | "title" | "base_price" | "average_rating" | "reviews_count">("average_rating");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const products = useAsyncData(
    `products-${categoryId}-${query}-${minPrice}-${maxPrice}-${sortBy}-${sortOrder}`,
    () =>
      catalogApi.getProducts({
        category_id: categoryId === "all" ? undefined : Number(categoryId),
        q: query.trim() || undefined,
        min_price: minPrice ? Number(minPrice) : undefined,
        max_price: maxPrice ? Number(maxPrice) : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
  );

  return (
    <>
      <Header products={products.data ?? []} />
      <main className="container py-6">
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          <select className="rounded-md border px-3 py-2" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="all">Все категории</option>
            {(categories.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input className="rounded-md border px-3 py-2" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск" />
          <input className="rounded-md border px-3 py-2" type="number" min={0} value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Цена от" />
          <input className="rounded-md border px-3 py-2" type="number" min={0} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Цена до" />
          <select className="rounded-md border px-3 py-2" value={sortBy} onChange={(e) => setSortBy(e.target.value as "id" | "title" | "base_price" | "average_rating" | "reviews_count") }>
            <option value="average_rating">Рейтинг</option>
            <option value="base_price">Цена</option>
            <option value="title">Название</option>
            <option value="reviews_count">Отзывы</option>
            <option value="id">ID</option>
          </select>
          <select className="rounded-md border px-3 py-2" value={sortOrder} onChange={(e) => setSortOrder(e.target.value as "asc" | "desc") }>
            <option value="desc">↓</option>
            <option value="asc">↑</option>
          </select>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(products.data ?? []).map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </main>
    </>
  );
}
