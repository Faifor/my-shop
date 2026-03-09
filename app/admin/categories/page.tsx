"use client";

import { useState } from "react";
import { adminApi } from "@/lib/api/requests";
import { useAsyncData } from "@/lib/use-async-data";

export default function AdminCategoriesPage() {
  const categories = useAsyncData("admin-categories", adminApi.getCategories);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateCategory() {
    if (!name.trim()) return;

    setSaving(true);
    setError(null);
    try {
      await adminApi.createCategory({ name: name.trim() });
      setName("");
      await categories.refetch();
    } catch (e) {
      setError((e as { message?: string }).message ?? "Не удалось создать категорию");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCategory(categoryId: number) {
    setError(null);
    try {
      await adminApi.deleteCategory(categoryId);
      await categories.refetch();
    } catch (e) {
      setError((e as { message?: string }).message ?? "Не удалось удалить категорию");
    }
  }

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Категории</h2>
        <p className="mt-1 text-sm text-slate-500">Создавайте и удаляйте категории из одного места.</p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-medium text-slate-700">Новая категория</h3>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например: Смартфоны"
          />
          <button
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
            disabled={saving || !name.trim()}
            onClick={handleCreateCategory}
          >
            {saving ? "Сохраняем..." : "Добавить"}
          </button>
        </div>
      </div>

      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-medium text-slate-700">Список категорий</h3>
        </div>
        <ul className="divide-y divide-slate-100">
          {(categories.data ?? []).map((item) => (
            <li key={item.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-500">ID: {item.id}</p>
              </div>
              <button
                className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
                onClick={() => handleDeleteCategory(item.id)}
              >
                Удалить
              </button>
            </li>
          ))}
          {!categories.data?.length && (
            <li className="px-4 py-8 text-center text-sm text-slate-500">Категории пока не созданы.</li>
          )}
        </ul>
      </div>
    </section>
  );
}
