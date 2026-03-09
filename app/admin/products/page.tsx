"use client";

import { useState } from "react";
import { adminApi, catalogApi } from "@/lib/api/requests";
import { useAsyncData } from "@/lib/use-async-data";

export default function AdminProductsPage() {
  const products = useAsyncData("products", catalogApi.getProducts);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  return (
    <section>
      <h2 className="font-semibold">Управление товарами</h2>
      <div className="mt-3 grid max-w-xl gap-2">
        <input className="rounded border px-2 py-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Название" />
        <textarea className="rounded border px-2 py-1" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Описание" />
        <button
          className="rounded bg-slate-900 px-3 py-1 text-white"
          onClick={async () => {
            await catalogApi.createProduct({ name, description });
            setName("");
            setDescription("");
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
            <button className="mt-2 rounded border px-2 py-1 text-sm" onClick={() => adminApi.uploadProductImage(item.id, { url: "https://placehold.co/600x400" })}>Загрузить изображение-заглушку</button>
          </article>
        ))}
      </div>
    </section>
  );
}
