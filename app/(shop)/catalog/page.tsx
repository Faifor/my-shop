"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/layout/header";
import { ProductCard } from "@/components/product/product-card";
import { catalogApi } from "@/lib/api/requests";
import { useAsyncData } from "@/lib/use-async-data";

export default function CatalogPage() {
  const products = useAsyncData("products", catalogApi.getProducts);
  const categories = useAsyncData("categories", catalogApi.getCategories);
  const [categoryId, setCategoryId] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"price" | "rating">("rating");

  const view = useMemo(() => {
    const filtered = (products.data ?? []).filter((item) => categoryId === "all" || item.category_id === categoryId);
    return filtered.sort((a, b) => {
      if (sortBy === "price") return (a.variants?.[0]?.price ?? 0) - (b.variants?.[0]?.price ?? 0);
      return (b.rating ?? 0) - (a.rating ?? 0);
    });
  }, [categoryId, products.data, sortBy]);

  return (
    <>
      <Header products={products.data ?? []} />
      <main className="container py-6">
        <div className="flex flex-wrap gap-3">
          <select className="rounded-md border px-3 py-2" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="all">Все категории</option>
            {(categories.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="rounded-md border px-3 py-2" value={sortBy} onChange={(e) => setSortBy(e.target.value as "price" | "rating") }>
            <option value="rating">По рейтингу</option>
            <option value="price">По цене</option>
          </select>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {view.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </main>
    </>
  );
}
