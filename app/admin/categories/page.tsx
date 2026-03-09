"use client";

import { useState } from "react";
import { catalogApi } from "@/lib/api/requests";
import { useAsyncData } from "@/lib/use-async-data";

export default function AdminCategoriesPage() {
  const categories = useAsyncData("categories", catalogApi.getCategories);
  const [name, setName] = useState("");

  return (
    <section>
      <h2 className="font-semibold">Управление категориями</h2>
      <div className="mt-3 flex gap-2">
        <input className="rounded border px-2 py-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Новая категория" />
        <button
          className="rounded bg-slate-900 px-3 py-1 text-white"
          onClick={async () => {
            await catalogApi.createCategory({ name });
            setName("");
            await categories.refetch();
          }}
        >
          Добавить
        </button>
      </div>
      <ul className="mt-4 space-y-2">
        {(categories.data ?? []).map((item) => <li key={item.id} className="rounded border bg-white p-2">{item.name}</li>)}
      </ul>
    </section>
  );
}
