"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { adminApi, catalogApi } from "@/lib/api/requests";
import { useAsyncData } from "@/lib/use-async-data";
import type { ProductVariant } from "@/types/api";

type FormState = {
  name: string;
  categoryId: string;
  basePrice: string;
  description: string;
};

export default function AdminProductsPage() {
  const categories = useAsyncData("admin-categories", adminApi.getCategories);
  const skus = useAsyncData("admin-skus", adminApi.getSkus);

  const [productForm, setProductForm] = useState<FormState>({ name: "", categoryId: "", basePrice: "", description: "" });
  const [images, setImages] = useState<File[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [listCategoryId, setListCategoryId] = useState<string>("");
  const [listQuery, setListQuery] = useState("");
  const [listSortBy, setListSortBy] = useState<"id" | "title" | "base_price" | "average_rating" | "reviews_count">("id");
  const [listSortOrder, setListSortOrder] = useState<"asc" | "desc">("desc");

  const products = useAsyncData(
    `catalog-products-${listCategoryId}-${listQuery}-${listSortBy}-${listSortOrder}`,
    () => {
      if (!listCategoryId) return Promise.resolve([]);
      return catalogApi.getProducts({
        category_id: Number(listCategoryId),
        q: listQuery.trim() || undefined,
        sort_by: listSortBy,
        sort_order: listSortOrder,
      });
    },
  );

  const [skuCode, setSkuCode] = useState("");
  const [skuColor, setSkuColor] = useState("");
  const [skuSize, setSkuSize] = useState("");
  const [skuMemory, setSkuMemory] = useState("");
  const [stock, setStock] = useState("0");
  const [price, setPrice] = useState("1");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedProductSkus = useMemo(
    () => (skus.data ?? []).filter((item) => item.product_id === selectedProductId),
    [selectedProductId, skus.data],
  );

  function handleFilesChange(event: ChangeEvent<HTMLInputElement>) {
    setImages(Array.from(event.target.files ?? []));
  }

  async function handleCreateProduct() {
    if (!productForm.name.trim() || !productForm.categoryId || images.length === 0 || !productForm.basePrice) {
      setError("Заполните название, категорию, базовую цену и добавьте хотя бы одно фото.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const product = await adminApi.createProduct({
        name: productForm.name.trim(),
        category_id: Number(productForm.categoryId),
        base_price: Number(productForm.basePrice),
        description: productForm.description.trim() || undefined,
      });

      await adminApi.uploadProductImages(product.id, images);
      await products.refetch();
      setSelectedProductId(product.id);
      setProductForm({ name: "", categoryId: "", basePrice: "", description: "" });
      setImages([]);
      setSuccess("Товар создан. Выберите карточку справа и добавьте SKU.");
    } catch (e) {
      setError((e as { message?: string }).message ?? "Не удалось создать товар.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateSku() {
    if (!selectedProductId) {
      setError("Сначала выберите товар.");
      return;
    }

    if (!skuCode.trim()) {
      setError("Укажите SKU.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const attributes = {
        ...(skuColor.trim() ? { color: skuColor.trim() } : {}),
        ...(skuSize.trim() ? { size: skuSize.trim() } : {}),
        ...(skuMemory.trim() ? { memory: skuMemory.trim() } : {}),
      } as Record<string, unknown>;

      const createdSku = await adminApi.createSku({
        product_id: selectedProductId,
        sku: skuCode.trim(),
        attributes,
      });

      await applyStockAndPrice(createdSku);
      await skus.refetch();
      setSkuCode("");
      setSkuColor("");
      setSkuSize("");
      setSkuMemory("");
      setSuccess("SKU, остаток и цена сохранены.");
    } catch (e) {
      setError((e as { message?: string }).message ?? "Ошибка при создании SKU.");
    } finally {
      setSaving(false);
    }
  }

  async function applyStockAndPrice(sku: ProductVariant) {
    await adminApi.setInventory({ sku_id: sku.id, stock: Number(stock) });
    await adminApi.bulkSkuPrices([{ sku: sku.sku, price: Number(price) }]);
  }

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Товары</h2>
        <p className="mt-1 text-sm text-slate-500">Создавайте карточки товаров, загружайте фото, затем добавляйте SKU, остатки и цены.</p>
      </header>

      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800">1) Создание товара</h3>
          <div className="mt-3 grid gap-3">
            <input
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
              value={productForm.name}
              onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Название товара"
            />
            <select
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
              value={productForm.categoryId}
              onChange={(e) => setProductForm((prev) => ({ ...prev, categoryId: e.target.value }))}
            >
              <option value="">Выберите категорию</option>
              {(categories.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <input
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
              type="number"
              min={0}
              value={productForm.basePrice}
              onChange={(e) => setProductForm((prev) => ({ ...prev, basePrice: e.target.value }))}
              placeholder="Базовая цена"
            />
            <textarea
              className="min-h-[90px] rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
              value={productForm.description}
              onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Описание"
            />

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">2) Фото товара (обязательно)</label>
              <input className="block w-full text-sm" multiple type="file" onChange={handleFilesChange} />
              <p className="mt-1 text-xs text-slate-500">Выбрано файлов: {images.length}</p>
            </div>

            <button
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
              disabled={saving}
              onClick={handleCreateProduct}
            >
              {saving ? "Сохраняем..." : "Создать карточку товара"}
            </button>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800">Список товаров</h3>
          <p className="mt-1 text-xs text-slate-500">Сначала выберите категорию, затем найдите карточку и нажмите на нее для добавления SKU.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <select
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
              value={listCategoryId}
              onChange={(e) => setListCategoryId(e.target.value)}
            >
              <option value="">Категория</option>
              {(categories.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            <input
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
              value={listQuery}
              onChange={(e) => setListQuery(e.target.value)}
              placeholder="Поиск по названию"
              disabled={!listCategoryId}
            />
            <select
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
              value={listSortBy}
              onChange={(e) => setListSortBy(e.target.value as "id" | "title" | "base_price" | "average_rating" | "reviews_count")}
              disabled={!listCategoryId}
            >
              <option value="id">Сортировка: ID</option>
              <option value="title">Сортировка: Название</option>
              <option value="base_price">Сортировка: Цена</option>
              <option value="average_rating">Сортировка: Рейтинг</option>
              <option value="reviews_count">Сортировка: Кол-во отзывов</option>
            </select>
            <select
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
              value={listSortOrder}
              onChange={(e) => setListSortOrder(e.target.value as "asc" | "desc")}
              disabled={!listCategoryId}
            >
              <option value="desc">По убыванию</option>
              <option value="asc">По возрастанию</option>
            </select>
          </div>

          <div className="mt-3 max-h-[300px] space-y-2 overflow-auto pr-1">
            {!listCategoryId && <p className="text-sm text-slate-500">Выберите категорию для загрузки товаров.</p>}
            {(products.data ?? []).map((item) => (
              <button
                key={item.id}
                className={`w-full rounded-xl border p-3 text-left transition ${
                  selectedProductId === item.id
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-slate-50 hover:border-slate-400"
                }`}
                onClick={() => setSelectedProductId(item.id)}
              >
                <p className="font-medium">{item.name}</p>
                <p className={`text-xs ${selectedProductId === item.id ? "text-slate-200" : "text-slate-500"}`}>
                  ID: {item.id} · {item.base_price ?? "—"} ₽
                </p>
              </button>
            ))}
          </div>
        </article>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800">3) Добавление SKU, остатков и цены</h3>
        <p className="mt-1 text-xs text-slate-500">
          Выбранный товар: {selectedProductId ? `#${selectedProductId}` : "не выбран"}
        </p>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <input
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
            value={skuCode}
            onChange={(e) => setSkuCode(e.target.value)}
            placeholder="SKU код (напр. PHONE-14-256-BLK)"
          />
          <input
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="Остаток на складе"
          />
          <input
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
            type="number"
            min={1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Цена SKU"
          />
          <input
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
            value={skuColor}
            onChange={(e) => setSkuColor(e.target.value)}
            placeholder="Цвет"
          />
          <input
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
            value={skuSize}
            onChange={(e) => setSkuSize(e.target.value)}
            placeholder="Размер"
          />
          <input
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
            value={skuMemory}
            onChange={(e) => setSkuMemory(e.target.value)}
            placeholder="Память"
          />
        </div>

        <button
          className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
          disabled={saving || !selectedProductId}
          onClick={handleCreateSku}
        >
          Добавить SKU
        </button>

        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">SKU текущего товара</p>
          <ul className="mt-2 space-y-2">
            {selectedProductSkus.map((item) => (
              <li key={item.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <span className="font-medium">{item.sku}</span>
                {item.attributes && <span className="ml-2 text-xs text-slate-500">{JSON.stringify(item.attributes)}</span>}
              </li>
            ))}
            {!selectedProductSkus.length && <li className="text-sm text-slate-500">SKU пока нет.</li>}
          </ul>
        </div>
      </article>
    </section>
  );
}
