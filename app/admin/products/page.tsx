"use client";

import { useState } from "react";
import { adminApi } from "@/lib/api/requests";
import { useAsyncData } from "@/lib/use-async-data";

export default function AdminProductsPage() {
  const products = useAsyncData("admin-products", adminApi.getProducts);
  const categories = useAsyncData("admin-categories", adminApi.getCategories);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");

  return (
    <section>
      <h2 className="font-semibold">Управление товарами</h2>
      <div className="mt-3 grid max-w-xl gap-2">
        <input className="rounded border px-2 py-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Название" />
        <select className="rounded border px-2 py-1" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Выберите категорию</option>
          {(categories.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <button
          className="rounded bg-slate-900 px-3 py-1 text-white"
          onClick={async () => {
            if (!categoryId) return;
            await adminApi.createProduct({ name, category_id: Number(categoryId) });
            setName("");
            await products.refetch();
          }}
        >
          Создать товар
        </button>
      </div>
      <div className="mt-4 space-y-2">
        {(products.data ?? []).map((item) => (
          <article key={item.id} className="rounded border bg-white p-3">
            <p className="font-medium">{item.name}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
